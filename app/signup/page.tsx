"use client"; // Mark this component as a Client Component

import React, { useState, useEffect, ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import NavBar from '../../components/Navbar';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string;
}

interface RegistrationFormProps {
  children: ReactNode;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ children }) => {
  const router = useRouter(); // Initialize useRouter
  const [formData, setFormData] = useState<FormData>({
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phoneNumber ||
      !formData.role
    ) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      setError('Invalid phone number');
      return;
    }

    setError('');
    alert('Registration Successful!');
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          margin: '0 auto', // Center the form
          paddingTop: '100px', // Add some spacing below the NavBar
        }}
      >
        <h2
          style={{
            marginBottom: '30px',
            fontSize: '40px',
            fontFamily: 'Space Grotesk, sans-serif', // Apply Space Grotesk font here
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
            <span style={{ fontSize: '14px' }}>Sign up with Google</span>
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
            <span style={{ fontSize: '14px' }}>Sign up with Facebook</span>
          </button>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', color: '#666' }}>- or -</span>
        </div>
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
        {children}
      </form>
    </div>
  );
};

const LoginForm: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRole || !email || !password) {
      setError('All fields are required');
      return;
    }

    setError('');
    alert('Login Successful!');
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px', // Added max-width for better readability
          margin: '0 auto', // Center the form
          padding: '20px', // Added padding for spacing
          backgroundColor: '#fff', // Optional: Add background color
          borderRadius: '10px', // Optional: Add rounded corners
        }}
      >
        <h2
          style={{
            marginBottom: '30px',
            fontSize: '40px',
            fontFamily: 'Space Grotesk, sans-serif', // Apply Space Grotesk font here
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
        {children}
      </form>
    </div>
  );
};

const Home: React.FC = () => {
  const [screenWidth, setScreenWidth] = useState<number | null>(null);
  const [showRegistration, setShowRegistration] = useState<boolean>(false);

  useEffect(() => {
    // Safely access `window` (only in the browser)
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <div>
      {/* Render NavBar only once at the top */}
      {screenWidth !== null && screenWidth >= 768 && <NavBar />}

      {/* Main content */}
      {screenWidth !== null && screenWidth >= 768 ? (
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
              backgroundImage: showRegistration ? `url('/SignUp.png')` : `url('/SignIn.png')`,
              backgroundSize: '500px 500px',
              backgroundPosition: '50% 50%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Right side (forms) */}
          <div
            className="forms-container"
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
            {showRegistration ? (
              <RegistrationForm>
                <div style={{ alignContent: 'center', textAlign: 'center' }}>
                  <p>
                    <span>
                      Already have an account?{' '}
                      <a
                        onClick={() => setShowRegistration(false)}
                        style={{ cursor: 'pointer', color: 'blue' }}
                      >
                        Login
                      </a>
                    </span>
                  </p>
                </div>
              </RegistrationForm>
            ) : (
              <LoginForm>
                <div style={{ alignContent: 'center', textAlign: 'center' }}>
                  <p>
                    <span>
                      Don't have an account?{' '}
                      <a
                        onClick={() => setShowRegistration(true)}
                        style={{ cursor: 'pointer', color: 'blue' }}
                      >
                        Register
                      </a>
                    </span>
                  </p>
                </div>
              </LoginForm>
            )}
          </div>
        </div>
      ) : (
        <div
          className="forms-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: '20px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {showRegistration ? (
            <RegistrationForm>
              <div style={{ alignContent: 'center', textAlign: 'center' }}>
                <p>
                  <span>
                    Already have an account?{' '}
                    <a
                      onClick={() => setShowRegistration(false)}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      Login
                    </a>
                  </span>
                </p>
              </div>
            </RegistrationForm>
          ) : (
            <LoginForm>
              <div style={{ alignContent: 'center', textAlign: 'center' }}>
                <p>
                  <span>
                    Don't have an account?{' '}
                    <a
                      onClick={() => setShowRegistration(true)}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      Register
                    </a>
                  </span>
                </p>
              </div>
            </LoginForm>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;