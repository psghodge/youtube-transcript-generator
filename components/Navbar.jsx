import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-700"
          >
            YouTube Transcript Generator
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  {userProfile?.photoURL && (
                    <Image
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-gray-700">
                    {userProfile?.displayName || userProfile?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
