// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
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

export const dynamic = "force-dynamic";

/* ---------- small helper so preview builds can read prod APIs ---------- */
async function fetchJSONFromProdFirst(path: string) {
  const urls = [path];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      /* try next */
    }
  }
  return null;
}

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

        // Initial user (no live listener needed on this page)
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          return;
        }

        setUser(authUser);

        // ---- Cached preferences
        const cacheKey = `profile:${authUser.id}`;
        const cachedPrefs = pageCache.get(cacheKey) as string[] | null;
        if (cachedPrefs) setSelectedInterests(cachedPrefs);

        // ---- Load user profile from RPC
        const { data: userData, error: userError } = await supabase.rpc(
          "get_user",
          { user_id: authUser.id }
        );
        if (!userError && userData?.length) {
          setUserProfile({
            username: userData[0].username,
            profile_icon_url: userData[0].profile_icon_url,
          });
        }

        // ---- Load preferences if not cached (prod-first to avoid preview cookie issues)
        if (!cachedPrefs) {
          const prefJSON = await fetchJSONFromProdFirst("/api/v0/preferences");
          if (prefJSON?.preferences) {
            const interestNames = prefJSON.preferences
              .filter((p: { tag?: { category?: string } }) => p.tag?.category === "topic")
              .map((p: { tag?: { display_name?: string } }) => p.tag?.display_name)
              .filter(Boolean);

            pageCache.set(cacheKey, interestNames);
            setSelectedInterests(interestNames);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const primaryMenuItems = [
    { id: "update-username", label: "Update Username", icon: HiOutlineUser, action: () => setIsUpdateUsernameOpen(true) },
    { id: "edit-interests", label: "Edit Interests", icon: HiOutlineHeart, action: () => setIsEditInterestsOpen(true) },
    { id: "log-out", label: "Log Out", icon: HiOutlineLogout, action: () => setIsLogoutOpen(true) },
  ];
  const destructiveMenuItems = [
    { id: "delete-account", label: "Delete Account", icon: HiOutlineTrash, action: () => setIsDeleteAccountOpen(true) },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-0 py-6 max-w-3xl screen flex flex-col">
        <h1 className="text-4xl font-bold text-foreground mb-6">Profile</h1>
        <div className="text-center py-8"><p>Loading...</p></div>
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 md:px-0 py-6 max-w-3xl screen flex flex-col">
      <h1 className="text-4xl font-bold text-foreground mb-6">Profile</h1>

      {/* Profile Info */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <div
              className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: "var(--accent-light)" }}
            >
              {userProfile?.profile_icon_url || user.user_metadata?.avatar_url ? (
                <Image
                  src={userProfile?.profile_icon_url || user.user_metadata?.avatar_url || ""}
                  alt={userProfile?.username || user.user_metadata?.name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <HiOutlineUser className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <h2
              className="text-2xl font-bold text-gray-800"
              style={{ color: "var(--accent-light)" }}
            >
              {userProfile?.username || user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name?.split(" ")[0] || "Friend"}
            </h2>
            {userProfile?.username ? (
              <p className="text-[12px]" style={{ color: "var(--accent-light)" }}>@{userProfile.username}</p>
            ) : (
              <p className="text-[12px]" style={{ color: "var(--subtext)" }}>Add a username in settings</p>
            )}
            <p className="text-[12px]" style={{ color: "#666666" }}>{user.email}</p>
            <p className="text-[12px]" style={{ color: "#666666" }}>
              Member since{" "}
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "Unknown"}
            </p>
          </div>
        </div>
      </div>

      <hr className="mb-6" style={{ borderColor: "var(--rule)" }} />

      {/* ── Guide card ── */}
      <a
        href="/profile/guide"
        style={{ textDecoration: "none" }}
      >
        <div
          className="mb-6 rounded-xl p-5"
          style={{
            backgroundColor: "#1a3a3a",
            borderBottom: "3px solid #4a8b8c",
            cursor: "pointer",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}>
                Your guide
              </p>
              <h3 className="text-base font-semibold text-white mb-1">
                You&apos;re ready to start
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Everything you need for your next dispensary visit, in one place.
              </p>
            </div>
            <span style={{
              fontSize: "1.2rem",
              color: "var(--accent)",
              marginLeft: 16,
              flexShrink: 0,
            }}>
              →
            </span>
          </div>
        </div>
      </a>
      {/* ── End guide card ── */}

      {selectedInterests.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Your Interests</h3>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full text-sm font-medium text-foreground bg-accent"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-sm text-gray-500">No interests selected yet.</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {primaryMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="block text-left w-full md:hover:shadow-md md:transition-shadow md:duration-200 md:rounded-lg md:p-2 md:-m-2"
          >
            <span className="text-base font-normal text-gray-800">{item.label}</span>
          </button>
        ))}
      </div>

      <hr className="mb-6" style={{ borderColor: "var(--rule)" }} />
      <div className="space-y-4">
        {destructiveMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="block text-left w-full md:hover:shadow-md md:transition-shadow md:duration-200 md:rounded-lg md:p-2 md:-m-2"
          >
            <span className="text-base font-normal text-red-500">{item.label}</span>
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
            const response = await fetch("/api/v0/user/username", { method: "POST", body: formData });
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err.error || "Failed to update username");
            }
            setUserProfile((prev) => (prev ? { ...prev, username: newUsername } : { username: newUsername }));
            pageCache.invalidate("profile:");
          } catch (error) {
            console.error("Error updating username:", error);
            throw error;
          }
        }}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={async () => {
          try {
            const response = await fetch("/api/v0/user/delete", { method: "DELETE", headers: { "Content-Type": "application/json" } });
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `Server error (${response.status}): ${response.statusText}`);
            }
            const supabase = await createClient();
            await supabase.auth.signOut();
            pageCache.clear();
            window.location.href = "/login";
          } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete account. Please try again.");
          } finally {
            setIsDeleteAccountOpen(false);
          }
        }}
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
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ interests: sel, overwrite: true }),
            });
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              console.error("Failed to update preferences:", err);
              alert("Failed to update preferences. Please try again.");
              return;
            }
            pageCache.invalidate("feed:");
            pageCache.invalidate("profile:");
            pageCache.invalidate("favorites:");
            setSelectedInterests(sel);
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
