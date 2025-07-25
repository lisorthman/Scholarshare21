"use client"; 

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {Button} from "../../components/ui/Button";


const VerifyPage = () => {
  const router = useRouter();

  const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isResending, setIsResending] = useState<boolean>(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [approvalMessage, setApprovalMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "example@gmail.com");
  }, []);

  useEffect(() => {
    const storedExpiryTime = localStorage.getItem("otpExpiryTime");
    if (storedExpiryTime) {
      console.log("Retrieved expiryTime:", storedExpiryTime);
      setExpiryTime(new Date(storedExpiryTime));
    } else {
      console.log("No expiryTime found in localStorage");
    }
  }, []);

  // Handle input changes in OTP boxes
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

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index]) {
      if (index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  // Handle form submission for OTP verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Retrieve user's email from localStorage
    const email = localStorage.getItem("email");
    if (!email) {
      setError("Email not found. Please sign up again.");
      return;
    }

    // Join OTP digits into a single string
    const otp = code.join("");

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Verification successful!");

        localStorage.removeItem("email");
        localStorage.removeItem("otpExpiryTime");
        localStorage.setItem("token", data.token); // Save token

        if (data.role === "admin") {
          router.push("/admin-dashboard");
        } else if (data.role === "researcher") {
          alert("Registration successful! Please wait for approval email by admin.");
          router.push("/signin");
          return;
        } else {
          router.push("/user-dashboard");
        }
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  // Handle resending the OTP
  const handleResend = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      setError("Email not found. Please sign up again.");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend verification code");
      }

      // Update expiry time and localStorage
      const newExpiryTime = new Date(data.expiry);
      setExpiryTime(newExpiryTime);
      localStorage.setItem("otpExpiryTime", newExpiryTime.toISOString());
      alert("New verification code sent!");
    } catch (error) {
      console.error("Error in handleResend:", error);
      if (error instanceof Error) {
        setError(error.message || "An error occurred. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  // Countdown timer for OTP expiry
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
    if (!email || !email.includes("@")) return email;
    const [username, domain] = email.split("@");
    if (!username) return email;
    const maskedUsername =
      username.length > 1
        ? username[0] + "*".repeat(username.length - 1)
        : username[0] || "";
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#E0D8C3",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {/* Main container */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTopLeftRadius: "40px",
          borderTopRightRadius: "40px",
          padding: "160px 70px",
          boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <h1 style={{ marginBottom: "5px", fontSize: "24px", fontWeight: 400, letterSpacing: "2.5px", textAlign: "center" }}>
          We’ve sent a 5-digit code to your Gmail:
        </h1>

        <p style={{ textAlign: "center", fontSize: "18px", fontWeight: 500, letterSpacing: "0.5px", marginBottom: "40px" }}>
          {maskEmail(email)}
        </p>

        <h2 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 500, letterSpacing: "0.5px", textAlign: "center", color: "#3F2828" }}>
          Enter OTP Code
        </h2>

        {/* OTP input fields */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px" }}>
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
                width: "50px",
                height: "50px",
                textAlign: "center",
                fontSize: "24px",
                border: "1px solid #C4C4C4",
                borderRadius: "10px",
                outline: "none",
              }}
            />
          ))}
        </div>

        {timeLeft > 0 && (
          <p style={{ textAlign: "center", fontSize: "16px", fontWeight: 400, color: "#666", marginBottom: "20px" }}>
            Code expires in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </p>
        )}

        {/* Submit button */}
        <Button
          name="Verify"
          type="submit"
          onClick={handleSubmit}
          style={{
            width: "50%",
            height: "50px",
            backgroundColor: "#634141",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
            margin: "0 auto",
            display: "block",
          }}
        >
          Verify
        </Button>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px", fontSize: "16px" }}>
            {error}
          </p>
        )}

        {/* Resend link */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "16px", fontWeight: 400, letterSpacing: "0.5px", color: "#666" }}>
          Didn’t receive it?
          <br />
          <span
            style={{
              color: timeLeft > 0 || isResending ? "#999" : "#634141",
              cursor: timeLeft > 0 || isResending ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
            onClick={timeLeft > 0 || isResending ? undefined : handleResend}
          >
            {isResending ? "Resending..." : "Resend"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;
