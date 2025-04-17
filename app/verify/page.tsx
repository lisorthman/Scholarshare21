'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';

const VerifyPage = () => {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isResending, setIsResending] = useState<boolean>(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Auto-clear error after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const storedExpiryTime = localStorage.getItem('otpExpiryTime');
    if (storedExpiryTime) {
      setExpiryTime(new Date(storedExpiryTime));
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 4) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index]) {
      if (index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = localStorage.getItem('email');
    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    const otp = code.join('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Verification successful!');
        localStorage.removeItem('email');
        localStorage.removeItem('otpExpiryTime');
        localStorage.setItem('token', data.token);

        if (data.role === 'admin') router.push('/admin-dashboard');
        else if (data.role === 'researcher') router.push('/researcher-dashboard');
        else router.push('/user-dashboard');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleResend = async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }
  
    setIsResending(true);
  
    try {
      const response = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }
  
      const newExpiryTime = new Date(data.expiry);
      setExpiryTime(newExpiryTime);
      localStorage.setItem('otpExpiryTime', newExpiryTime.toISOString());
  
      // Custom alert with attempts left
      alert(`New OTP sent.\nYou have ${data.attemptsLeft} resend attempt${data.attemptsLeft !== 1 ? 's' : ''} left.`);
    } catch (error) {
      console.error('Error in handleResend:', error);
      if (error instanceof Error) setError(error.message);
      else setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  

  useEffect(() => {
    if (!expiryTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);
      setTimeLeft(timeDiff > 0 ? timeDiff : 0);

      if (timeDiff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username[0] + '*'.repeat(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#E0D8C3',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: '40px',
          borderTopRightRadius: '40px',
          padding: '160px 70px',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ marginBottom: '5px', fontSize: '24px', fontWeight: 400, letterSpacing: '2.5px', textAlign: 'center' }}>
          We’ve sent a 5-digit code to your Gmail:
        </h1>

        <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 500, letterSpacing: '0.5px', marginBottom: '40px' }}>
          {maskEmail(localStorage.getItem('email') || 'example@gmail.com')}
        </p>

        <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 500, letterSpacing: '0.5px', textAlign: 'center', color: '#3F2828' }}>
          Enter OTP Code
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              style={{
                width: '50px',
                height: '50px',
                textAlign: 'center',
                fontSize: '24px',
                border: '1px solid #C4C4C4',
                borderRadius: '10px',
                outline: 'none',
              }}
            />
          ))}
        </div>

        {timeLeft > 0 && (
          <p style={{ textAlign: 'center', fontSize: '16px', fontWeight: 400, color: '#666', marginBottom: '20px' }}>
            Code expires in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </p>
        )}

        <Button
          name="Verify"
          type="submit"
          onClick={handleSubmit}
          style={{
            width: '50%',
            height: '50px',
            backgroundColor: '#634141',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            cursor: 'pointer',
            margin: '0 auto',
            display: 'block',
          }}
        />

        {error && (
          <p style={{ color: 'red', textAlign: 'center', marginTop: '10px', fontSize: '16px' }}>
            {error}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '16px', fontWeight: 400, letterSpacing: '0.5px', color: '#666' }}>
          Didn’t receive it?
          <br />
          <span
            style={{
              color: timeLeft > 0 || isResending ? '#999' : '#634141',
              cursor: timeLeft > 0 || isResending ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
            onClick={timeLeft > 0 || isResending ? undefined : handleResend}
          >
            {isResending ? 'Resending...' : 'Resend'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;
