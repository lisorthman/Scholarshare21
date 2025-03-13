// app/signin/page.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import NavBar from '../../components/Navbar';

const SigninPage = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Login Successful!');
        localStorage.setItem('token', data.token); // Store token in local storage
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
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
            backgroundImage: `url('/SignIn.png')`, // Add your background image here
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
              Login
            </h2>
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            {/* Role Selection */}
            <select
              name="role"
              value={selectedRole}
              onChange={handleRoleChange}
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

            {/* Social Sign-In Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '10px',
                gap: '20px',
              }}
            >
              <button
                style={{
                  color: '#5C5C5C',
                  border: '1px solid black',
                  backgroundColor: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
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
                <span style={{ fontSize: '14px' }}>Sign in with Google</span>
              </button>
              <button
                style={{
                  color: '#5C5C5C',
                  border: '1px solid black',
                  backgroundColor: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
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
                <span style={{ fontSize: '14px' }}>Sign in with Facebook</span>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', color: '#666' }}>- or -</span>
            </div>

            {/* Email and Password Fields */}
            <InputField
              type="email"
              placeholder="Email Address"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <InputField
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            {/* Forgot Password */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <a
                href="#"
                onClick={() => alert('Forgot password?')}
                style={{ textDecoration: 'none', color: '#634141' }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              name="Login"
              type="submit"
              style={{
                width: '100%',
                height: '40px',
                marginBottom: '20px',
              }}
            />
            <br />
            <br />

            {/* Link to Signup Page */}
            <div style={{ alignContent: 'center', textAlign: 'center' }}>
              <p>
                <span>
                  Don't have an account?{' '}
                  <a
                    onClick={() => router.push('/signup')}
                    style={{ cursor: 'pointer', color: 'blue' }}
                  >
                    Register
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

export default SigninPage;