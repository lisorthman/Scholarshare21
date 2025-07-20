'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import signIn from next-auth/react
import InputField from '../../components/InputField';
import { Button } from "../../components/ui/button";
import NavBar from '../../components/Navbar';
import { tokenUtils } from '@/lib/auth';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  const strength = [
    hasMinLength,
    hasNumber,
    hasSpecialChar,
    hasUpperCase,
    hasLowerCase
  ].filter(Boolean).length;

  let message = '';
  let color = '';

  if (password.length === 0) {
    return { strength: 0, message: '', color: '' };
  }

  if (strength <= 2) {
    message = 'Weak password';
    color = 'red';
  } else if (strength <= 4) {
    message = 'Moderate password';
    color = 'orange';
  } else {
    message = 'Strong password!';
    color = 'green';
  }

  return { strength, message, color };
};

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: '',
    educationQualification: '', // Added
  });
  const [error, setError] = useState<string>('');
  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [passwordFeedback, setPasswordFeedback] = useState({
    strength: 0,
    message: '',
    color: ''
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    specialChar: false,
    upperCase: false,
    lowerCase: false
  });
  const [approvalMessage, setApprovalMessage] = useState<string>(''); // For researcher approval

  // Clear any existing tokens on component mount
  useEffect(() => {
    // Clean up any expired or invalid tokens
    tokenUtils.cleanupExpiredTokens();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength in real-time
    if (name === 'password') {
      const { strength, message, color } = checkPasswordStrength(value);
      setPasswordFeedback({ strength, message, color });

      // Update requirements checklist
      setPasswordRequirements({
        length: value.length >= 8,
        number: /\d/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        upperCase: /[A-Z]/.test(value),
        lowerCase: /[a-z]/.test(value)
      });
    }
  };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Check password strength before submission
    if (passwordFeedback.strength < 3) {
      setError('Please choose a stronger password');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'researcher' && !formData.educationQualification) {
      setError('Education qualification is required for researchers');
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
          ...(formData.role === 'researcher' ? { educationQualification: formData.educationQualification } : {}),
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Clear any existing tokens first
        tokenUtils.clearAuthData();
        
        // Save token AND role to storage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", formData.email);

        // Set cookies (optional)
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        document.cookie = `role=${data.role}; path=/; max-age=3600`;

        // Remove approvalMessage for researchers. Always proceed to OTP verification for all roles.
        alert('Registration Successful! Check your email for verification.');
        // Proceed to OTP verification for all roles
        const otpRes = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        if (otpRes.ok) {
          const otpData = await otpRes.json();
          localStorage.setItem("otpExpiryTime", otpData.expiry);
          router.push('/verify');
        }
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
    try {
      await signIn("google", { 
        callbackUrl: "/oauth-callback"
      });
    } catch (error) {
      console.error("Google sign-up error:", error);
      setError("An error occurred during Google sign-up.");
    }
  };

  // Handle Facebook Sign-In
  const handleFacebookSignIn = async () => {
    try {
      await signIn("facebook", { 
        callbackUrl: "/oauth-callback"
      });
    } catch (error) {
      console.error("Facebook sign-up error:", error);
      setError("An error occurred during Facebook sign-up.");
    }
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
            {approvalMessage && <p style={{ color: 'green', marginBottom: '10px' }}>{approvalMessage}</p>}
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
            {formData.role === 'researcher' && (
              <>
                <br />
                <InputField
                  type="text"
                  placeholder="Education Qualification"
                  name="educationQualification"
                  value={formData.educationQualification}
                  onChange={handleChange}
                  required={formData.role === 'researcher'}
                />
              </>
            )}
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

            {/* Password Strength Feedback */}
            {formData.password && (
              <div style={{ width: '100%', marginBottom: '10px' }}>
                <div style={{ 
                  height: '5px', 
                  backgroundColor: '#e0e0e0', 
                  borderRadius: '5px',
                  marginBottom: '5px'
                }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${passwordFeedback.strength * 20}%`, 
                      backgroundColor: passwordFeedback.color,
                      borderRadius: '5px',
                      transition: 'all 0.3s ease'
                    }} 
                  />
                </div>
                <p style={{ 
                  color: passwordFeedback.color, 
                  fontSize: '14px',
                  margin: '5px 0'
                }}>
                  {passwordFeedback.message}
                </p>
                
                {/* Password Requirements Checklist */}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p style={{ margin: '2px 0', color: passwordRequirements.length ? 'green' : 'red' }}>
                    {passwordRequirements.length ? '✓' : '✗'} At least 8 characters
                  </p>
                  <p style={{ margin: '2px 0', color: passwordRequirements.number ? 'green' : 'red' }}>
                    {passwordRequirements.number ? '✓' : '✗'} Contains a number
                  </p>
                  <p style={{ margin: '2px 0', color: passwordRequirements.specialChar ? 'green' : 'red' }}>
                    {passwordRequirements.specialChar ? '✓' : '✗'} Contains a special character
                  </p>
                  <p style={{ margin: '2px 0', color: passwordRequirements.upperCase ? 'green' : 'red' }}>
                    {passwordRequirements.upperCase ? '✓' : '✗'} Contains uppercase letter
                  </p>
                  <p style={{ margin: '2px 0', color: passwordRequirements.lowerCase ? 'green' : 'red' }}>
                    {passwordRequirements.lowerCase ? '✓' : '✗'} Contains lowercase letter
                  </p>
                </div>
              </div>
            )}

            
            <InputField
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <br />
            {/* Submit Button */}
            <Button
              name="Register"
              type="submit"
              variant="default"
              disabled={false}
              style={{
                width: "100%",
                height: "45px",
                backgroundColor: "#634141",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              Register
            </Button>
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