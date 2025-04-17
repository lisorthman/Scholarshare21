'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import signIn from next-auth/react
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import NavBar from '../../components/Navbar';

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: '',
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Registration Successful! Check your email for the verification code.');
        localStorage.setItem('email', formData.email);
  
        // 🔁 Call /api/send-otp after registration
        const otpRes = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        });
  
        const otpData = await otpRes.json();
        if (otpRes.ok && otpData.expiry) {
          localStorage.setItem('otpExpiryTime', otpData.expiry);
        }
  
        router.push('/verify');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred. Please try again.');
    }
  };  
  

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' }); // Redirect to dashboard after sign-in
  };

  // Handle Facebook Sign-In
  const handleFacebookSignIn = async () => {
    await signIn('facebook', { callbackUrl: '/dashboard' }); // Redirect to dashboard after sign-in
  };

  return (
    <div>
      <NavBar />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '45% 55%',
          height: '100vh',
          backgroundColor: '#EBDEDE',
        }}
      >
        {/* Left side (background image) */}
        <div
          style={{
            gridColumn: 1,
            backgroundImage: `url('/SignUp.png')`,
            backgroundSize: '500px 500px',
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Right side (curved box with content) */}
        <div
          style={{
            gridColumn: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: '50px 0 0 50px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <h2
              style={{
                marginBottom: '30px',
                fontSize: '40px',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              Create Account
            </h2>
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                height: '40px',
                border: 'none',
                borderBottom: '1px solid #C4C4C4',
                borderRadius: '0px',
                fontSize: '16px',
                textAlign: 'center',
              }}
            >
              <option value="">Select a role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="researcher">Researcher</option>
            </select>
            <br />

            {/* Google and Facebook Sign-In Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '10px',
                gap: '20px',
              }}
            >
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  color: '#5C5C5C',
                  border: '1px solid black',
                  backgroundColor: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png"
                  alt="Google Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '10px',
                    objectFit: 'contain',
                  }}
                />
                <span style={{ fontSize: '14px' }}>Sign up with Google</span>
              </button>

              {/* Facebook Sign-In Button */}
              <button
                type="button"
                onClick={handleFacebookSignIn}
                style={{
                  color: '#5C5C5C',
                  border: '1px solid black',
                  backgroundColor: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png"
                  alt="Facebook Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '10px',
                    objectFit: 'contain',
                  }}
                />
                <span style={{ fontSize: '14px' }}>Sign up with Facebook</span>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', color: '#666' }}>- or -</span>
            </div>

            {/* Regular Sign-Up Form */}
            <InputField
              type="text"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <br />
            <InputField
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <br />
            <InputField
              type="text"
              placeholder="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <br />
            <InputField
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <br />
            <InputField
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <br />
            <Button
              name="Register"
              type="submit"
              style={{
                width: '100%',
                height: '40px',
                marginBottom: '20px',
              }}
            />
            <br />
            <br />

            {/* Link to Login Page */}
            <div style={{ alignContent: 'center', textAlign: 'center' }}>
              <p>
                <span>
                  Already have an account?{' '}
                  <a
                    onClick={() => router.push('/signin')}
                    style={{ cursor: 'pointer', color: 'blue' }}
                  >
                    Login
                  </a>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;