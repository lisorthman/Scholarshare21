
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import InputField from "../../components/InputField";
import { Button } from "../../components/ui/Button"; // Ensure this path matches exactly
import NavBar from "../../components/Navbar";

const SigninPage = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Save token AND role to storage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        
        // Set cookies (optional, for SSR compatibility)
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        document.cookie = `role=${data.role}; path=/; max-age=3600`;

        alert("Login Successful!");
        
        // Redirect based on role
        switch (data.role) {
          case "user":
            router.push("/user-dashboard");
            break;
          case "admin":
            router.push("/admin-dashboard");
            break;
          case "researcher":
            router.push("/researcher-dashboard");
            break;
          default:
            router.push("/");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleFacebookSignIn = async () => {
    await signIn("facebook", { callbackUrl: "/dashboard" });
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/forgot-password");
  };

  return (
    <div>
      <NavBar />
      <div className="grid grid-cols-[45%_55%] h-screen bg-[#EBDEDE]">
        {/* Left side (background image) */}
        <div
          className="bg-[url('/SignIn.png')] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundSize: "500px 500px",
            backgroundPosition: "50% 50%",
          }}
        />

        {/* Right side (curved box with content) */}
        <div className="flex justify-center items-center p-5 bg-white rounded-l-[50px] shadow-md">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full max-w-[500px]"
          >
            <h2 className="mb-[30px] text-[40px] font-space-grotesk">
              Login
            </h2>
            {error && (
              <p className="text-red-500 mb-[10px]">{error}</p>
            )}

            {/* Role Selection */}
            <select
              name="role"
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full h-10 border-b border-[#C4C4C4] text-center"
            >
              <option value="">Select a role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="researcher">Researcher</option>
            </select>
            <br />

            {/* Social Sign-In Buttons */}
            <div className="flex justify-between mb-5 p-2 gap-5">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="text-[#5C5C5C] border border-black bg-white px-5 py-2 rounded flex items-center cursor-pointer"
              >
                <img
                  src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png"
                  alt="Google Logo"
                  className="w-6 h-6 mr-2 object-contain"
                />
                <span className="text-sm">Sign in with Google</span>
              </button>

              {/* Facebook Sign-In Button */}
              <button
                type="button"
                onClick={handleFacebookSignIn}
                className="text-[#5C5C5C] border border-black bg-white px-5 py-2 rounded flex items-center cursor-pointer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png"
                  alt="Facebook Logo"
                  className="w-6 h-6 mr-2 object-contain"
                />
                <span className="text-sm">Sign in with Facebook</span>
              </button>
            </div>

            <div className="text-center mb-5">
              <span className="text-[#666]">- or -</span>
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
            <div className="flex justify-end w-full mb-5">
              <a
                href="/forgot-password"
                onClick={handleForgotPassword}
                className="text-[#634141] cursor-pointer text-sm"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              name="Login"
              type="submit"
              variant="default"
              className="w-full h-10 mb-5"
            >
              Login
            </Button>
            <br />
            <br />

            {/* Link to Signup Page */}
            <div className="text-center">
              <p>
                <span>
                  Don't have an account?{" "}
                  <a
                    onClick={() => router.push("/signup")}
                    className="text-blue-500 cursor-pointer"
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
