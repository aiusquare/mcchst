import React, { useState } from "react";
import "./style.css";
import menuicon from "../../../../pictures/menu_icon.png";
import { useNavigate } from "react-router-dom";

export const MobileMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mobile-menu">
      <img
        onClick={(e) => {
          if (showMenu) {
            setShowMenu(false);
          } else {
            setShowMenu(true);
          }
        }}
        className="menu-icon"
        alt="Menu icon"
        src={menuicon}
      />
      {showMenu && (
        <div>
          <div className="main-menu-bg">
            <div
              onClick={() => {
                navigate("apply");
                setShowMenu(false);
              }}
              className="menu-bg"
            >
              Apply
            </div>

            <div
              onClick={() => {
                navigate("login");
                setShowMenu(false);
              }}
              className="menu-bg"
            >
              Login
            </div>

            <div
              // onClick={() => {
              //   navigate("about");
              //   setShowMenu(false);
              // }}
              className="menu-bg"
            >
              E-Library
            </div>

            <div
              onClick={() => {
                navigate("about");
                setShowMenu(false);
              }}
              className="menu-bg"
            >
              Our History
            </div>

            <div
              onClick={() => {
                navigate("contact");
                setShowMenu(false);
              }}
              className="menu-bg"
            >
              Support
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
