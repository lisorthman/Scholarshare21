"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import InputField from "../../components/InputField";
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700']
});

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("resetEmail", email);
        router.push("/forgot-password/verify-otp");
      } else {
        setError(data.message || "No account found with this email");
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
        padding: "170px 60px", // Reduced padding from 210px to 120px
        boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "900px",
        margin: "0 auto",
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
          Forgot Your Password?
        </h1>

        <p style={{
          textAlign: "center",
          fontSize: "16px", // Increased from 14px
          color: "#666",
          marginBottom: "40px", // Increased from 32px
          lineHeight: "1.5",
          maxWidth: "400px", // Added maxWidth
        }}>
          Enter your registered email address to receive a password reset code
        </p>

        {error && (
          <p style={{ 
            color: "red", 
            textAlign: "center", 
            marginBottom: "20px", // Increased from 16px
            width: "100%",
            fontSize: "15px", // Added font size
          }}>
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "400px", // Increased from 320px
          }}
        >
          <div style={{ 
            width: "100%", 
            marginBottom: "32px", // Increased from 24px
          }}>
            <InputField
              name="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            name="Send Reset Code"
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
            }}
          >
            {isLoading ? "Checking..." : "Send Reset Code"}
          </Button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "32px", // Increased from 24px
            fontSize: "16px", // Increased from 14px
            color: "#666",
          }}
        >
          Remember your password?{" "}
          <a
            href="/signin"
            style={{ 
              color: "#634141", 
              fontWeight: 500, 
              cursor: "pointer",
              textDecoration: "none",
              fontSize: "16px", // Added font size
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;