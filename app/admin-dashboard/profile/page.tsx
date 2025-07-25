
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { User } from "@/types/user";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminProfile() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
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
        if (data.valid && data.user.role === "admin") {
          setAdmin(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email, // Initial email, non-editable
            password: "",
            confirmPassword: "",
          });

          // Set profile photo directly from URL if it exists
          if (data.user.profilePhoto) {
            // Add cache busting parameter to prevent caching issues
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
        // Exclude email from update
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

      setAdmin({ ...admin!, name: formData.name, email: admin!.email }); // Preserve original email
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

    // Validate file type
    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      setError("Please select a valid image file (JPEG or PNG)");
      return;
    }

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      setError("Image size must be less than 4MB");
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
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

      // Update with the new blob URL (add cache busting)
      setProfilePhoto(`${result.url}?t=${Date.now()}`);

      // Update admin state
      if (admin) {
        setAdmin({ ...admin, profilePhoto: result.url });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload photo. Please try again.");
      // Revert to previous photo if available
      setProfilePhoto(
        admin?.profilePhoto ? `${admin.profilePhoto}?t=${Date.now()}` : null
      );
    } finally {
      setIsUploading(false);
    }
  };

  const passwordsMatch =
    (formData.password === formData.confirmPassword &&
      formData.password.length > 0) ||
    (formData.password === "" && formData.confirmPassword === "");

  if (!admin) return <p>Loading...</p>;

  return (
    <DashboardLayout user={admin} defaultPage="Profile">
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
              Admin Profile
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
              disabled={!passwordsMatch}
            >
              {editMode ? "Save Changes" : "Edit Profile"}
            </button>
            {editMode && (
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
                  admin.name.charAt(0).toUpperCase()
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
                      disabled // Make email non-editable
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
                    {admin.name}
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "400",
                      marginBottom: "1rem",
                    }}
                  >
                    {admin.email}
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
              Admin Information
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
                <p>Administrator</p>
              </div>
              <div>
                <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                  Member Since
                </p>
                <p>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                  Last Login
                </p>
                <p>
                  {admin.lastLogin
                    ? new Date(admin.lastLogin).toLocaleString()
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