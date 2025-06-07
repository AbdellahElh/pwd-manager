import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import ProfileIcon from "./ProfileIcon";
import UserProfile from "./UserProfile";

const Layout: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const toggleModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  return (
    <div className="container mt-20 mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold my-8 text-center flex-grow">
          Password Manager with Face Recognition
        </h1>
        {isLoggedIn && user && (
          <div className="fixed top-4 right-4 z-50">
            <ProfileIcon email={user.email} onClick={toggleModal} />
          </div>
        )}
      </div>

      <Outlet />

      {isLoggedIn && user && (
        <Modal isOpen={isProfileModalOpen} onClose={toggleModal}>
          <UserProfile user={user} onLogout={logout} />
        </Modal>
      )}
    </div>
  );
};

export default Layout;
