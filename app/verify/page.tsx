// app/verify/page.tsx


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';

const VerifyPage = () => {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '', '']); // Array to store each digit of the OTP
  const [error, setError] = useState<string>('');
  const [isResending, setIsResending] = useState<boolean>(false); // Track resend loading state
  const [expiryTime, setExpiryTime] = useState<Date | null>(null); // OTP expiration time
  const [timeLeft, setTimeLeft] = useState<number>(0); // Time left in seconds

  // Retrieve expiryTime from localStorage when the component mounts
  useEffect(() => {
    const storedExpiryTime = localStorage.getItem('otpExpiryTime');
    if (storedExpiryTime) {
      console.log('Retrieved expiryTime:', storedExpiryTime);
      setExpiryTime(new Date(storedExpiryTime));
    } else {
      console.log('No expiryTime found in localStorage');
    }
  }, []);

  // Handle OTP input change
  const handleCodeChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus to the next input
      if (value && index < 4) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle Backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index]) {
      // If the current box is empty, move focus to the previous box
      if (index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  // Handle OTP submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the user's email from localStorage
    const email = localStorage.getItem('email');

    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    // Combine the OTP digits into a single string
    const otp = code.join('');

    try {
      // Send the OTP to the backend for verification
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Verification successful!');
        localStorage.removeItem('email'); // Clear the email from localStorage
        localStorage.removeItem('otpExpiryTime'); // Clear the expiryTime
        router.push('/dashboard'); // Redirect to the dashboard
      } else {
        setError(data.message || 'Verification failed'); // Display error message
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.'); // Display generic error message
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    const email = localStorage.getItem('email');

    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setIsResending(true); // Start loading state

    try {
      const response = await fetch('/api/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification code');
      }

      const data = await response.json();
      const newExpiryTime = new Date(data.expiry);
      setExpiryTime(newExpiryTime); // Update the expiry time
      localStorage.setItem('otpExpiryTime', newExpiryTime.toISOString()); // Store expiryTime in localStorage
      alert('New verification code sent!');
    } catch (error) {
      console.error('Error in handleResend:', error);
      if (error instanceof Error) {
        setError(error.message || 'An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsResending(false); // End loading state
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!expiryTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = Math.floor((expiryTime.getTime() - now.getTime()) / 1000); // Time difference in seconds
      setTimeLeft(timeDiff > 0 ? timeDiff : 0);

      if (timeDiff <= 0) {
        clearInterval(interval); // Stop the timer when it reaches 0
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [expiryTime]);

  // Mask the email (e.g., e******@gmail.com)
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
        fontFamily: 'Space Grotesk, sans-serif', // Apply Space Grotesk font
      }}
    >
      {/* Curved Rectangle Box */}
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
          alignItems: 'center', // Center content horizontally
          justifyContent: 'center', // Center content vertically
        }}
      >
        {/* "We’ve sent a 5-digit code to your Gmail:" */}
        <h1
          style={{
            marginBottom: '5px',
            fontSize: '24px',
            fontWeight: 400, // Medium weight
            letterSpacing: '2.5px', // Add space between letters
            textAlign: 'center',
          }}
        >
          We’ve sent a 5-digit code to your Gmail:
        </h1>

        {/* Masked Email */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 500, // Semi-bold weight
            letterSpacing: '0.5px', // Add space between letters
            marginBottom: '40px',
          }}
        >
          {maskEmail(localStorage.getItem('email') || 'example@gmail.com')}
        </p>

        {/* "Enter the code" */}
        <h2
          style={{
            marginBottom: '20px',
            fontSize: '18px',
            fontWeight: 500, // Medium weight
            letterSpacing: '0.5px', // Add space between letters
            textAlign: 'center',
            color: '#3F2828',
          }}
        >
          Enter OTP Code
        </h2>

        {/* OTP Input Boxes */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '40px',
          }}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)} // Handle Backspace key
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

        {/* Countdown Timer */}
        {timeLeft > 0 && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 400,
              color: '#666',
              marginBottom: '20px',
            }}
          >
            Code expires in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </p>
        )}

        {/* Verify Button */}
        <Button
          name="Verify"
          type="submit"
          onClick={handleSubmit}
          style={{
            width: '50%', // Customizable width
            height: '50px',
            backgroundColor: '#634141',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            cursor: 'pointer',
            margin: '0 auto', // Center the button
            display: 'block', // Ensure it takes the full width
          }}
        />

        {/* Error Message */}
        {error && (
          <p
            style={{
              color: 'red',
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '16px',
            }}
          >
            {error}
          </p>
        )}

        {/* "Didn’t receive it? Resend" */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '16px',
            fontWeight: 400, // Normal weight
            letterSpacing: '0.5px', // Add space between letters
            color: '#666',
          }}
        >
          Didn’t receive it?
          <br /> {/* Move "Resend" to the next line */}
          <span
            style={{
              color: timeLeft > 0 || isResending ? '#999' : '#634141', // Gray out when timer is active or resending
              cursor: timeLeft > 0 || isResending ? 'not-allowed' : 'pointer', // Change cursor when disabled
              fontWeight: 'bold',
            }}
            onClick={timeLeft > 0 || isResending ? undefined : handleResend} // Disable onClick when timer is active or resending
          >
            {isResending ? 'Resending...' : 'Resend'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;