'use client';

import { useState, useEffect } from 'react';
import { updateUserProfile, uploadProfilePicture } from '@/lib/mangodb';
import { put } from '@vercel/blob';
import DashboardHeader from '@/components/DashboardHeader';

export default function ResearcherProfilePage() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    image: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      const response = await fetch('/api/user');
      const data = await response.json();
      setUser(data);
      setNewName(data.name);
    };
    fetchUser();
  }, []);

  const handleNameChange = async () => {
    try {
      await updateUserProfile({ name: newName });
      setUser({ ...user, name: newName });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      // Upload to Vercel Blob
      const response = await fetch(`/api/researcher/upload?filename=${selectedFile.name}`, {
        method: 'POST',
        body: selectedFile,
      });
      
      const { url } = await response.json();
      
      // Update user profile with new image URL
      await updateUserProfile({ image: url });
      setUser({ ...user, image: url });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <DashboardHeader title="Profile Settings" />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="flex flex-col items-center">
              <img
                src={user.image || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer mb-2"
              >
                Change Photo
              </label>
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 p-2 bg-gray-100 rounded">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="p-2 border rounded flex-1"
                      />
                      <button
                        onClick={handleNameChange}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-1">
                      <p className="p-2 bg-gray-100 rounded flex-1">{user.name}</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}