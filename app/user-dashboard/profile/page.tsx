"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { User } from "@/types/user";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.user.role === "user") {
          setUser(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email,
            bio: data.user.bio || "",
            password: "",
            confirmPassword: "",
          });

          if (data.user.profilePhoto) {
            setProfilePhoto(`${data.user.profilePhoto}?t=${Date.now()}`);
          } else {
            setProfilePhoto(null);
          }
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.push("/login");
      }
    };

    verifyToken();
  }, [router]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please sign in again.");
      router.push("/login");
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        token,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch("/api/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser({ ...user!, name: formData.name, email: formData.email, bio: formData.bio });
      setEditMode(false);
      setError(null);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      setError("Please select a valid image file (JPEG or PNG)");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Image size must be less than 4MB");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", token);

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/update-profile-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      setProfilePhoto(`${result.url}?t=${Date.now()}`);

      if (user) {
        setUser({ ...user, profilePhoto: result.url });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload photo. Please try again.");
      setProfilePhoto(
        user?.profilePhoto ? `${user.profilePhoto}?t=${Date.now()}` : null
      );
    } finally {
      setIsUploading(false);
    }
  };

  const passwordsMatch =
    (formData.password === formData.confirmPassword &&
      formData.password.length > 0) ||
    (formData.password === "" && formData.confirmPassword === "");

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Profile">
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100%",
          padding: "2rem",
          borderRadius: "20px",
          width: "100%",
          fontFamily: "'Poppins', sans-serif",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "800px",
        }}
      >
        {error && (
          <p
            style={{
              color: "red",
              fontSize: "14px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "600",
              margin: "0",
            }}
          >
            My Profile
          </h1>
          <div style={{ display: "flex", gap: "10px" }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: passwordsMatch ? "pointer" : "not-allowed",
                    opacity: passwordsMatch ? 1 : 0.5,
                    border: "none",
                  }}
                  disabled={!passwordsMatch}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      ...formData,
                      password: "",
                      confirmPassword: "",
                    });
                    setError(null);
                  }}
                  style={{
                    backgroundColor: "transparent",
                    color: "#0070f3",
                    border: "1px solid #0070f3",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  backgroundColor: "#0070f3",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                backgroundColor: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                color: "#555",
                marginBottom: "20px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {profilePhoto ? (
                <>
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={() => setProfilePhoto(null)}
                  />
                  {isUploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div className="spinner"></div>
                    </div>
                  )}
                </>
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/jpeg,image/png"
              onChange={handlePhotoChange}
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: "transparent",
                color: "#0070f3",
                border: "1px solid #0070f3",
                borderRadius: "6px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isUploading ? "not-allowed" : "pointer",
                opacity: isUploading ? 0.7 : 1,
              }}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Change Photo"}
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {editMode ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Name*
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #DDD",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "400",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Email*
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #DDD",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "400",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #DDD",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "400",
                      minHeight: "100px",
                    }}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Password (leave blank to keep unchanged)
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #DDD",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                      placeholder="Enter new password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #DDD",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                      placeholder="Confirm new password"
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {formData.password !== formData.confirmPassword &&
                    formData.confirmPassword !== "" && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginTop: "0.5rem",
                        }}
                      >
                        Passwords don't match
                      </p>
                    )}
                </div>
              </div>
            ) : (
              <div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  {user.name}
                </h2>
                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    fontWeight: "400",
                    marginBottom: "1rem",
                  }}
                >
                  {user.email}
                </p>
                {formData.bio && (
                  <div
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "20px",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <p>{formData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            Account Information
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              fontSize: "14px",
              fontWeight: "400",
            }}
          >
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>Role</p>
              <p>User</p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                Member Since
              </p>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                Last Login
              </p>
              <p>
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "Never"}
              </p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                Account Status
              </p>
              <p style={{ color: "#2E7D32" }}>Active</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}