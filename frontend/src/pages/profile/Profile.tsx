import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Camera,
  X,
  Save,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { useAuth } from "../../context/AuthContext";
import { ratingsAPI, usersAPI } from "../../services/api";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RatingCard from "../../components/Rating/RatingCard";
import RatingStars from "../../components/Rating/RatingStars";

const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    avatar: null,
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const [userRatings, setUserRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    fetchUserRatings();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile();
      const profileData = response.data;

      setUserData({
        firstName: profileData.first_name || user?.first_name || "",
        lastName: profileData.last_name || user?.last_name || "",
        email: profileData.email || user?.email || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        avatar: profileData.profile_image || null,
        socialLinks: {
          facebook: profileData.social_links?.facebook || "",
          twitter: profileData.social_links?.twitter || "",
          linkedin: profileData.social_links?.linkedin || "",
          instagram: profileData.social_links?.instagram || "",
        },
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await ratingsAPI.getUserRatings();

      // Check if user is a technician or client
      if (response.data.technician_ratings) {
        setUserRatings(response.data.technician_ratings);
        setAverageRating(response.data.average_rating || 0);
      } else if (response.data.client_ratings) {
        setUserRatings(response.data.client_ratings);
        setAverageRating(response.data.average_rating || 0);
      }
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const updateData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
        social_links: userData.socialLinks,
      };

      const response = await usersAPI.updateProfile(updateData);

      if (response.data) {
        updateUser({
          ...user,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
        });

        setMessage({ type: "success", text: "Profile updated successfully" });
        setIsEditModalOpen(false);

        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      setChangingPassword(true);

      const response = await usersAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setMessage({ type: "success", text: "Password changed successfully" });
      toast.success("Password changed successfully");
      navigate("/login");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("social.")) {
      const socialPlatform = name.split(".")[1];
      setUserData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: value,
        },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await usersAPI.uploadAvatar(formData);

      if (response.data.profile_image) {
        setUserData((prev) => ({
          ...prev,
          avatar: response.data.profile_image,
        }));

        setMessage({ type: "success", text: "Avatar updated successfully" });

        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to upload avatar",
      });
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 dark:text-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your profile and account settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <h2 className="text-xl font-bold">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {userData.bio}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {userData.email}
                  </p>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                  <div className="space-y-3">
                    {userData.socialLinks.facebook && (
                      <div className="flex items-center">
                        <Facebook className="w-5 h-5 text-blue-600 mr-3" />
                        <a
                          href={userData.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                        >
                          {userData.socialLinks.facebook}
                        </a>
                      </div>
                    )}
                    {userData.socialLinks.twitter && (
                      <div className="flex items-center">
                        <Twitter className="w-5 h-5 text-blue-400 mr-3" />
                        <a
                          href={userData.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                        >
                          {userData.socialLinks.twitter}
                        </a>
                      </div>
                    )}
                    {userData.socialLinks.linkedin && (
                      <div className="flex items-center">
                        <Linkedin className="w-5 h-5 text-blue-700 mr-3" />
                        <a
                          href={userData.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                        >
                          {userData.socialLinks.linkedin}
                        </a>
                      </div>
                    )}
                    {userData.socialLinks.instagram && (
                      <div className="flex items-center">
                        <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                        <a
                          href={userData.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                        >
                          {userData.socialLinks.instagram}
                        </a>
                      </div>
                    )}
                    {!userData.socialLinks.facebook &&
                      !userData.socialLinks.twitter &&
                      !userData.socialLinks.linkedin &&
                      !userData.socialLinks.instagram && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No social links added yet.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="border-b dark:border-gray-700 mb-6">
                  <nav className="flex space-x-8">
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "personal"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("personal")}
                    >
                      Personal Information
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "security"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("security")}
                    >
                      Security
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "notifications"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("notifications")}
                    >
                      Notifications
                    </button>
                    <button
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "ratings"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("ratings")}
                  >
                    Ratings
                  </button>
                  </nav>
                </div>
                <nav className="flex space-x-8">
                  <button
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "personal"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("personal")}
                  ></button>

                  
                </nav>

                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name
                        </label>
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <p>{userData.firstName}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <p>{userData.lastName}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p>{userData.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p>{userData.phone || "Not provided"}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bio
                      </label>
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p>{userData.bio || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Change Password
                      </h3>
                      <form onSubmit={handleChangePassword}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white pr-10"
                                placeholder="Enter current password"
                                required
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white pr-10"
                                placeholder="Enter new password"
                                required
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white pr-10"
                                placeholder="Confirm new password"
                                required
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={changingPassword}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                          >
                            {changingPassword
                              ? "Updating..."
                              : "Update Password"}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="pt-6 border-t dark:border-gray-700">
                      <h3 className="text-lg font-semibold mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive emails for important updates
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive browser notifications
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive text messages for urgent issues
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ratings" && (
                  <div className="space-y-6">
                    {userRatings.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Your Ratings
                            </h3>
                            <div className="flex items-center mt-2">
                              <RatingStars
                                rating={averageRating}
                                readonly={true}
                                size="lg"
                                setRating={undefined}
                              />
                              <span className="ml-2 text-2xl font-bold">
                                {averageRating.toFixed(1)}
                              </span>
                              <span className="ml-2 text-gray-500 dark:text-gray-400">
                                ({userRatings.length} ratings)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {userRatings.map((rating) => (
                            <RatingCard
                              key={rating.id}
                              rating={rating}
                              showUser={true}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No ratings yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          You haven't received any ratings yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    Edit Personal Information
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Update your details to keep your profile up-to-date.
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Link className="w-5 h-5 mr-2" />
                      Social Links
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Facebook className="w-5 h-5 text-blue-600 mr-3" />
                        <input
                          type="text"
                          name="social.facebook"
                          value={userData.socialLinks.facebook}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="Facebook profile URL"
                        />
                      </div>
                      <div className="flex items-center">
                        <Twitter className="w-5 h-5 text-blue-400 mr-3" />
                        <input
                          type="text"
                          name="social.twitter"
                          value={userData.socialLinks.twitter}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="Twitter profile URL"
                        />
                      </div>
                      <div className="flex items-center">
                        <Linkedin className="w-5 h-5 text-blue-700 mr-3" />
                        <input
                          type="text"
                          name="social.linkedin"
                          value={userData.socialLinks.linkedin}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="LinkedIn profile URL"
                        />
                      </div>
                      <div className="flex items-center">
                        <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                        <input
                          type="text"
                          name="social.instagram"
                          value={userData.socialLinks.instagram}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="Instagram profile URL"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={userData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Bio
                        </label>
                        <textarea
                          rows={3}
                          name="bio"
                          value={userData.bio}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t dark:border-gray-700 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default ProfilePage;
