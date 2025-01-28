import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";

export const MenuButton = ({
  label = "menu-button",
  navigateTo = "navigateTo",
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="menu-button"
      onClick={() => {
        navigate(navigateTo);
      }}
    >
      <div className="text-wrapper">{label}</div>
    </div>
  );
};

MenuButton.propTypes = {
  label: PropTypes.string,
};
