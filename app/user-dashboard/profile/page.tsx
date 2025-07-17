"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { User } from "@/types/user";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiEdit2, FiSave, FiX, FiUpload } from "react-icons/fi";

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
      const updateData: any = {
        name: formData.name,
        email: formData.email,
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

      setResearcher({ ...researcher!, name: formData.name, email: formData.email });
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

  if (!researcher) return (
    <DashboardLayout user={null} defaultPage="Profile">
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D8CBB0]"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout user={researcher} defaultPage="Profile">
      <div className="min-h-full p-6 w-full font-sans">
        {/* Main Content Container */}
        <div className="bg-[#D8CBB0] rounded-xl p-6 w-full h-full">
          {/* Profile Card */}
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl mx-auto shadow-lg">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account information</p>
              </div>
              
              <div className="flex gap-3">
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={() => (editMode ? handleSave() : setEditMode(true))}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    editMode 
                      ? "bg-[#D8CBB0] hover:bg-[#C5B79B] text-gray-800" 
                      : "bg-[#D8CBB0] hover:bg-[#C5B79B] text-gray-800"
                  } ${!passwordsMatch ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!passwordsMatch}
                >
                  {editMode ? (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-[#EFEBE9] flex items-center justify-center overflow-hidden border-4 border-[#EFEBE9]">
                    {profilePhoto ? (
                      <>
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => setProfilePhoto(null)}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-4xl text-[#5D4037] font-bold">
                        {researcher.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 bg-[#EFE9DC] rounded-lg hover:bg-[#D7CCC8] transition-colors"
                  disabled={isUploading}
                >
                  <FiUpload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Change Photo"}
                </button>
              </div>

              {/* Profile Details Section */}
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name*
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D8CBB0] focus:border-[#D8CBB0] transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email*
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D8CBB0] focus:border-[#D8CBB0] transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password (leave blank to keep unchanged)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D8CBB0] focus:border-[#D8CBB0] transition pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D8CBB0] focus:border-[#D8CBB0] transition pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {formData.password !== formData.confirmPassword &&
                        formData.confirmPassword !== "" && (
                          <p className="text-red-500 text-xs mt-1">
                            Passwords don't match
                          </p>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#3E2723]">
                        {researcher.name}
                      </h2>
                      <p className="text-gray-600 mt-1">{researcher.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* User Information Section */}
            <div className="mt-10 bg-[#F9F9F9] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">User</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(researcher.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">
                    {researcher.lastLogin
                      ? new Date(researcher.lastLogin).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}