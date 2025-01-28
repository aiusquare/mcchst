import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const Button = ({ label = "Button", handleClick }) => {
  return (
    <button onClick={handleClick} className="button">
      <div className="text-wrapper">{label}</div>
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string,
};
