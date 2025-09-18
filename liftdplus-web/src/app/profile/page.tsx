"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineTrash,
  HiOutlineUser,
} from "react-icons/hi";
import { createClient } from "@/utils/supabase/client";
import { pageCache } from "@/utils/cache/PageCache";
import UpdateEmailModal from "@/components/site_core/UpdateEmailModal";
import UpdatePasswordModal from "@/components/site_core/UpdatePasswordModal";
import UpdateUsernameModal from "@/components/site_core/UpdateUsernameModal";
import DeleteAccountModal from "@/components/site_core/DeleteAccountModal";
import EditInterestsModal from "@/components/site_core/EditInterestsModal";
import LogoutModal from "@/components/site_core/LogoutModal";

export default function Profile() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    created_at?: string;
    user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
  } | null>(null);
  const [userProfile, setUserProfile] = useState<{
    username?: string;
    profile_icon_url?: string;
  } | null>(null);
  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isUpdateUsernameOpen, setIsUpdateUsernameOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isEditInterestsOpen, setIsEditInterestsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const allInterests = [
    "Sleep & Rest",
    "Stress & Anxiety",
    "Intimacy & Libido",
    "Hormonal Changes",
    "Pain Relief",
    "Focus & Creativity",
    "I'm Not Sure Yet",
  ];
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = await createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser(authUser);

          // Create cache key for profile data
          const cacheKey = `profile:${authUser.id}`;

          // Check cache first
          const cachedPreferences = pageCache.get(cacheKey) as string[] | null;
          if (cachedPreferences) {
            setSelectedInterests(cachedPreferences);
          }

          // Load user profile data
          const supabase = await createClient();
          const { data: userData, error: userError } = await supabase.rpc(
            "get_user",
            {
              user_id: authUser.id,
            }
          );

          if (!userError && userData && userData.length > 0) {
            setUserProfile({
              username: userData[0].username,
              profile_icon_url: userData[0].profile_icon_url,
            });
          }

          // Load user preferences if not cached
          if (!cachedPreferences) {
            const response = await fetch("/api/v0/preferences");
            if (response.ok) {
              const { preferences } = await response.json();
              const interestNames = preferences
                .filter(
                  (p: { tag?: { category?: string } }) =>
                    p.tag?.category === "topic"
                )
                .map(
                  (p: { tag?: { display_name?: string } }) =>
                    p.tag?.display_name
                )
                .filter(Boolean);

              // Cache the preferences before setting state
              pageCache.set(cacheKey, interestNames);
              setSelectedInterests(interestNames);
              console.log("Loaded user preferences:", interestNames);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const menuItems = [
    {
      id: "account-settings",
      label: "Account Settings",
      icon: HiOutlineCog,
      action: () => console.log("Account Settings"),
    },
    {
      id: "update-username",
      label: "Update Username",
      icon: HiOutlineUser,
      action: () => setIsUpdateUsernameOpen(true),
    },
    // {
    //   id: "update-email",
    //   label: "Update Email",
    //   icon: HiOutlineMail,
    //   action: () => setIsUpdateEmailOpen(true),
    // },
    // {
    //   id: "change-password",
    //   label: "Change Password",
    //   icon: HiOutlineKey,
    //   action: () => setIsUpdatePasswordOpen(true),
    // },
    {
      id: "edit-interests",
      label: "Edit Interests",
      icon: HiOutlineHeart,
      action: () => setIsEditInterestsOpen(true),
    },
    {
      id: "log-out",
      label: "Log Out",
      icon: HiOutlineLogout,
      action: () => setIsLogoutOpen(true),
    },
    {
      id: "delete-account",
      label: "Delete Account",
      icon: HiOutlineTrash,
      action: () => setIsDeleteAccountOpen(true),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-0 py-6 max-w-2xl screen flex flex-col">
        <h1 className="text-4xl font-bold text-foreground mb-6">Profile</h1>
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-0 py-6 max-w-2xl screen flex flex-col">
        <h1 className="text-4xl font-bold text-foreground mb-6">Profile</h1>
        <div className="text-center py-8">
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-0 py-6 max-w-2xl screen flex flex-col">
      <h1 className="text-4xl font-bold text-foreground mb-6">Profile</h1>

      {/* Profile Info Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <div
              className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: "var(--accent-light)" }}
            >
              {userProfile?.profile_icon_url ||
              user.user_metadata?.avatar_url ? (
                <Image
                  src={
                    userProfile?.profile_icon_url ||
                    user.user_metadata?.avatar_url ||
                    ""
                  }
                  alt={
                    userProfile?.username || user.user_metadata?.name || "User"
                  }
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <HiOutlineUser className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {userProfile?.username ||
                user.user_metadata?.name ||
                user.email ||
                "User"}
            </h2>
            {userProfile?.username && (
              <p className="text-[12px] text-gray-600">
                @{userProfile.username}
              </p>
            )}
            <p className="text-[12px] text-gray-600">{user.email}</p>
            <p className="text-[12px] text-gray-600">
              Member since{" "}
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Unknown"}
            </p>
            {/* <button
              onClick={handleProfileImageEdit}
              className="text-[10px] mt-1 hover:underline flex items-center text-gray-500"
            >
              <HiOutlineCog className="w-3 h-3 mr-1" />
              <span className="leading-none">Edit Profile Image</span>
            </button> */}
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Settings Menu */}
      <div className="space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="block text-left w-full md:hover:shadow-md md:transition-shadow md:duration-200 md:rounded-lg md:p-2 md:-m-2"
          >
            <span
              className={`text-base ${
                item.id === "account-settings" ? "font-[550]" : "font-normal"
              } text-gray-800`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Modals */}
      <UpdateEmailModal
        isOpen={isUpdateEmailOpen}
        onClose={() => setIsUpdateEmailOpen(false)}
        onSubmit={async () => {}}
      />
      <UpdatePasswordModal
        isOpen={isUpdatePasswordOpen}
        onClose={() => setIsUpdatePasswordOpen(false)}
        onSubmit={async () => {}}
      />
      <UpdateUsernameModal
        isOpen={isUpdateUsernameOpen}
        onClose={() => setIsUpdateUsernameOpen(false)}
        currentUsername={userProfile?.username || ""}
        onSubmit={async (newUsername: string) => {
          try {
            const formData = new FormData();
            formData.append("username", newUsername);

            const response = await fetch("/api/v0/user/username", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              // Update local state
              setUserProfile((prev) =>
                prev
                  ? { ...prev, username: newUsername }
                  : { username: newUsername }
              );
              console.log("Username updated successfully");
            } else {
              const error = await response.json();
              throw new Error(error.error || "Failed to update username");
            }
          } catch (error) {
            console.error("Error updating username:", error);
            throw error;
          }
        }}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={async () => {}}
      />
      <EditInterestsModal
        isOpen={isEditInterestsOpen}
        onClose={() => setIsEditInterestsOpen(false)}
        availableInterests={allInterests}
        selected={selectedInterests}
        onSubmit={async (sel) => {
          try {
            const response = await fetch("/api/v0/preferences", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                interests: sel,
              }),
            });

            if (response.ok) {
              // Invalidate cache when preferences change
              pageCache.invalidate("feed:");
              pageCache.invalidate("profile:");
              pageCache.invalidate("favorites:");
              setSelectedInterests(sel);
              console.log("Preferences updated successfully");
            } else {
              const error = await response.json();
              console.error("Failed to update preferences:", error);
              alert("Failed to update preferences. Please try again.");
            }
          } catch (error) {
            console.error("Error updating preferences:", error);
            alert("Failed to update preferences. Please try again.");
          }
        }}
      />
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={async () => {
          try {
            const supabase = await createClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
              console.error("Error logging out:", error);
              alert("Failed to log out. Please try again.");
            } else {
              // Redirect to login page after successful logout
              window.location.href = "/login";
            }
          } catch (error) {
            console.error("Error during logout:", error);
            alert("Failed to log out. Please try again.");
          }
        }}
      />
    </div>
  );
}
