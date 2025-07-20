"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { User } from "@/types/user";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResearcherProfile() {
  const router = useRouter();
  const [researcher, setResearcher] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

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
        if (data.valid && data.user.role === "researcher") {
          setResearcher(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email,
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
      // First update name (email cannot be changed)
      const updateResponse = await fetch("/api/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: formData.name,
          // Don't include email as it shouldn't be changed
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.message || "Failed to update profile");
      }

      // If password is being changed, send verification email
      if (formData.password) {
        setIsSendingVerification(true);
        const verificationResponse = await fetch("/api/request-password-change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newPassword: formData.password,
          }),
        });

        const verificationData = await verificationResponse.json();

        if (!verificationResponse.ok) {
          throw new Error(verificationData.message || "Failed to initiate password change");
        }

        alert("Verification email sent. Please check your email to complete password change.");
      }

      setResearcher({ ...researcher!, name: formData.name });
      setEditMode(false);
      setError(null);
      setIsSendingVerification(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
      setIsSendingVerification(false);
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

      if (researcher) {
        setResearcher({ ...researcher, profilePhoto: result.url });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload photo. Please try again.");
      setProfilePhoto(
        researcher?.profilePhoto ? `${researcher.profilePhoto}?t=${Date.now()}` : null
      );
    } finally {
      setIsUploading(false);
    }
  };

  const passwordsMatch =
    (formData.password === formData.confirmPassword &&
      formData.password.length > 0) ||
    (formData.password === "" && formData.confirmPassword === "");

  if (!researcher) return <p>Loading...</p>;

  return (
    <DashboardLayout user={researcher} defaultPage="Profile">
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          backgroundColor: "#D8CBB0",
          minHeight: "100%",
          padding: "2rem",
          borderRadius: "13px",
          width: "100%",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            padding: "2rem",
            width: "98%",
            margin: "0 auto",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
                fontSize: "20px",
                fontWeight: "600",
                margin: "0",
              }}
            >
              Researcher Profile
            </h1>
            <button
              onClick={() => (editMode ? handleSave() : setEditMode(true))}
              style={{
                backgroundColor: editMode ? "#D8CBB0" : "#D8CBB0",
                color: editMode ? "black" : "black",
                borderRadius: "6px",
                padding: "0.5rem 1.5rem",
                fontSize: "14px",
                fontWeight: "600",
                cursor: passwordsMatch ? "pointer" : "not-allowed",
                opacity: passwordsMatch ? 1 : 0.5,
              }}
              disabled={!passwordsMatch || isSendingVerification}
            >
              {editMode ? (isSendingVerification ? "Sending..." : "Save Changes") : "Edit Profile"}
            </button>
            {editMode && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: researcher.name,
                    email: researcher.email,
                    password: "",
                    confirmPassword: "",
                  });
                  setError(null);
                }}
                style={{
                  backgroundColor: "#D8CBB0",
                  color: "black",
                  borderRadius: "6px",
                  padding: "0.5rem 1.5rem",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
              >
                Cancel
              </button>
            )}
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
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "#F0F2F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  color: "#555",
                  marginBottom: "1rem",
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
                  researcher.name.charAt(0).toUpperCase()
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
                  backgroundColor: "#EFE9DC",
                  color: "black",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
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
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #DDD",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "400",
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
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
                      New Password (leave blank to keep unchanged)
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
                    {formData.password && (
                      <p style={{ fontSize: "12px", color: "#666", marginTop: "0.25rem" }}>
                        A verification email will be sent to confirm password change
                      </p>
                    )}
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
                      Confirm New Password
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
                    {researcher.name}
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "400",
                      marginBottom: "1rem",
                    }}
                  >
                    {researcher.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#F9F9F9",
              borderRadius: "6px",
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Researcher Information
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
                <p>Researcher</p>
              </div>
              <div>
                <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                  Member Since
                </p>
                <p>{researcher.createdAt ? new Date(researcher.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                  Last Login
                </p>
                <p>
                  {(researcher as any).lastLogin
                    ? new Date((researcher as any).lastLogin).toLocaleString()
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
      </div>
    </DashboardLayout>
  );
}