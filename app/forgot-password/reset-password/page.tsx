"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import InputField from "../../../components/InputField";
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700']
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    specialChar: false,
    upperCase: false,
    lowerCase: false
  });

  const checkPasswordStrength = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    setIsLoading(true);
    const email = localStorage.getItem("resetEmail");

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password reset successfully!");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetOtpExpiry");
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={spaceGrotesk.className} style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#E0D8C3",
    }}>
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: "40px",
        borderTopRightRadius: "40px",
        padding: "120px 60px", // Reduced top padding to accommodate larger content
        boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "450px", // Increased from 400px
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <h1 style={{
            marginBottom: "24px", // Increased from 16px
            fontSize: "28px", // Increased from 24px
            fontWeight: 500,
            textAlign: "center",
            color: "#3F2828",
          }}>
            Create New Password
          </h1>

          <p style={{
            textAlign: "center",
            fontSize: "16px", // Increased from 14px
            color: "#666",
            marginBottom: "40px", // Increased from 32px
            lineHeight: "1.5",
          }}>
            Please enter a new password for your account
          </p>

          {error && (
            <p style={{ 
              color: "red", 
              textAlign: "center", 
              marginBottom: "20px", // Increased from 16px
              width: "100%",
              fontSize: "15px",
            }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ 
              color: "green", 
              textAlign: "center", 
              marginBottom: "20px",
              width: "100%",
              fontSize: "15px",
            }}>
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={{ marginBottom: "28px", width: "100%" }}>
              <InputField
                type="password"
                placeholder="New Password"
                value={password}
                onChange={handlePasswordChange}
                style={{ 
                  width: "100%",
                  padding: "16px", // Increased padding
                  fontSize: "16px",
                }}
              />
              {password && (
                <div style={{ 
                  marginTop: "12px", // Increased from 8px
                  fontSize: "14px", // Increased from 12px
                  color: "#666",
                  padding: "0 8px",
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    margin: "6px 0", // Increased from 4px
                  }}>
                    <span style={{ 
                      color: passwordRequirements.length ? "green" : "red",
                      marginRight: "8px", // Increased from 6px
                      fontSize: "16px", // Added font size
                    }}>
                      {passwordRequirements.length ? "✓" : "✗"}
                    </span>
                    At least 8 characters
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    margin: "6px 0",
                  }}>
                    <span style={{ 
                      color: passwordRequirements.number ? "green" : "red",
                      marginRight: "8px",
                      fontSize: "16px",
                    }}>
                      {passwordRequirements.number ? "✓" : "✗"}
                    </span>
                    Contains a number
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    margin: "6px 0",
                  }}>
                    <span style={{ 
                      color: passwordRequirements.specialChar ? "green" : "red",
                      marginRight: "8px",
                      fontSize: "16px",
                    }}>
                      {passwordRequirements.specialChar ? "✓" : "✗"}
                    </span>
                    Contains a special character
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    margin: "6px 0",
                  }}>
                    <span style={{ 
                      color: passwordRequirements.upperCase ? "green" : "red",
                      marginRight: "8px",
                      fontSize: "16px",
                    }}>
                      {passwordRequirements.upperCase ? "✓" : "✗"}
                    </span>
                    Contains uppercase letter
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    margin: "6px 0",
                  }}>
                    <span style={{ 
                      color: passwordRequirements.lowerCase ? "green" : "red",
                      marginRight: "8px",
                      fontSize: "16px",
                    }}>
                      {passwordRequirements.lowerCase ? "✓" : "✗"}
                    </span>
                    Contains lowercase letter
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "36px", width: "100%" }}>
              <InputField
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ 
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                }}
              />
            </div>

            <Button
              name="Reset Password"
              type="submit"
              variant="default"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "56px", // Increased from 48px
                backgroundColor: "#634141",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px", // Increased from 16px
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "28px", // Increased from 24px
              }}
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </Button>
          </form>

          <p style={{
            textAlign: "center",
            fontSize: "16px", // Increased from 14px
            color: "#666",
          }}>
            Remember your password?{" "}
            <a
              href="/signin"
              style={{ 
                color: "#634141", 
                fontWeight: 500, 
                cursor: "pointer",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;