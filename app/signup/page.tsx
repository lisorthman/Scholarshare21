"use client"; // Mark this component as a Client Component

import React from 'react';
import Navbar from '../../components/Navbar';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

const SignupPage: React.FC = () => {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  const handleSignup = () => {
    alert(`Signup with Email: ${email}, Password: ${password}`);
  };

  return (
    <div>
      <Navbar />
      <h1>Signup</h1>
      <form>
        <InputField
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSignup} variant="primary">
          Sign Up
        </Button>
      </form>
    </div>
  );
};

export default SignupPage;