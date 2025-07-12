"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPasswordChange() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying password change...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Invalid verification link");
      setIsError(true);
      return;
    }

    const verifyPasswordChange = async () => {
      try {
        const response = await fetch(`/api/verify-password-change?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setMessage("Password changed successfully! You can now login with your new password.");
      } catch (error) {
        console.error("Verification error:", error);
        setMessage(
          error instanceof Error ? error.message : "Verification failed"
        );
        setIsError(true);
      }
    };

    verifyPasswordChange();
  }, [searchParams]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ color: isError ? "red" : "green" }}>{message}</h1>
      {!isError && (
        <p>
          <a href="/login">Click here to login</a>
        </p>
      )}
    </div>
  );
}