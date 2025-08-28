"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiOutlineCog,
  HiOutlineMail,
  HiOutlineKey,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineTrash,
  HiOutlineUser,
} from "react-icons/hi";
import UpdateEmailModal from "@/components/site_core/UpdateEmailModal";
import UpdatePasswordModal from "@/components/site_core/UpdatePasswordModal";
import DeleteAccountModal from "@/components/site_core/DeleteAccountModal";
import EditInterestsModal from "@/components/site_core/EditInterestsModal";
import LogoutModal from "@/components/site_core/LogoutModal";

export default function Profile() {
  const [user] = useState({
    name: "Jay Johnson",
    email: "jay@example.com",
    memberSince: "June 2025",
    profileImage: "/man.jpg",
  });

  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isEditInterestsOpen, setIsEditInterestsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const allInterests = [
    "Sleep & Rest",
    "Stress & Anxiety",
    "Intimacy & Libido",
    "Hormonal Changes",
    "Pain Relief",
    "Focus & Creativity",
    "I'm Not Sure Yet",
  ];
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Sleep & Rest",
    "Stress & Anxiety",
    "Pain Relief",
  ]);

  const menuItems = [
    {
      id: "account-settings",
      label: "Account Settings",
      icon: HiOutlineCog,
      action: () => console.log("Account Settings"),
    },
    {
      id: "update-email",
      label: "Update Email",
      icon: HiOutlineMail,
      action: () => setIsUpdateEmailOpen(true),
    },
    {
      id: "change-password",
      label: "Change Password",
      icon: HiOutlineKey,
      action: () => setIsUpdatePasswordOpen(true),
    },
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

  const handleProfileImageEdit = () => {
    console.log("Edit profile image");
  };

  return (
    <div className="container mx-auto px-8 py-6 max-w-2xl screen flex flex-col">
      <h1 className="text-4xl font-bold text-foreground mb-6">Profile</h1>

      {/* Profile Info Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <div
              className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: "var(--accent-light)" }}
            >
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
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
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-[12px] text-gray-600">
              Member since {user.memberSince}
            </p>
            <button
              onClick={handleProfileImageEdit}
              className="text-[10px] mt-1 hover:underline flex items-center text-gray-500"
            >
              <HiOutlineCog className="w-3 h-3 mr-1" />
              <span className="leading-none">Edit Profile Image</span>
            </button>
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
        onSubmit={(sel) => setSelectedInterests(sel)}
      />
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={async () => {}}
      />
    </div>
  );
}
