import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navbarStyles } from "../assets/dummyStyles.js";
import img1 from "../assets/logo1.png";
import { ChevronDown, LogOut, User } from "lucide-react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const Navbar = ({ user: propuser, onLogout, setUser }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = propuser || {
    name: "",
    email: "",
  };

  // to fetch the user data from server

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data.user || response.data; // Adjust based on your API response structure
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (!propuser) {
      fetchUserData();
    }
  }, [propuser,setUser]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handlelogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    onLogout?.();
    navigate("/login");
  };

  // to close the dropdown when clicking outside

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* logo */}
        <div
          onClick={() => navigate("/")}
          className={navbarStyles.logoContainer}
        >
          <div className={navbarStyles.logoImage}>
            <img src={img1} alt="logo" />
          </div>
          <span className={navbarStyles.logoText}>Expense Tracker</span>
        </div>

        {/* if the user is present */}
        {user && (
          <div className={navbarStyles.userContainer} ref={menuRef}>
            <button onClick={toggleMenu} className={navbarStyles.userButton}>
              <div className="relative">
                <div className={navbarStyles.userAvatar}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className={navbarStyles.statusIndicator}></div>
              </div>

              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName}>{user?.name || "User"}</p>
                <p className={navbarStyles.userEmail}>
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                <div className={navbarStyles.dropdownHeader}>
                  <div className="flex items-center gap-3">
                    <div className={navbarStyles.dropdownAvatar}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className={navbarStyles.dropdownName}>
                        {user?.name || "User"}
                      </div>
                      <div className={navbarStyles.dropdownEmail}>
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={navbarStyles.menuItemContainer}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className={navbarStyles.menuItem}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className={navbarStyles.menuItemContainer}>
                  <button
                    onClick={handlelogout}
                    className={navbarStyles.logoutButton}
                  >
                    <LogOut className=" w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
