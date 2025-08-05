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

export default function Profile() {
  const [user] = useState({
    name: "Jay Johnson",
    email: "jay@example.com",
    memberSince: "June 2025",
    profileImage: "/man.jpg",
  });

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
      action: () => console.log("Update Email"),
    },
    {
      id: "change-password",
      label: "Change Password",
      icon: HiOutlineKey,
      action: () => console.log("Change Password"),
    },
    {
      id: "edit-interests",
      label: "Edit Interests",
      icon: HiOutlineHeart,
      action: () => console.log("Edit Interests"),
    },
    {
      id: "log-out",
      label: "Log Out",
      icon: HiOutlineLogout,
      action: () => console.log("Log Out"),
    },
    {
      id: "delete-account",
      label: "Delete Account",
      icon: HiOutlineTrash,
      action: () => console.log("Delete Account"),
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
    </div>
  );
}
