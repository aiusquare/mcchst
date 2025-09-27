import PropTypes from "prop-types";
import "./style.css";
import { useNavigate } from "react-router-dom";

export const MenuButton = ({
  label = "menu-button",
  navigateTo = "navigateTo",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo.startsWith("http")) {
      // External link
      window.location.href = navigateTo;
    } else {
      // Internal navigation
      navigate(navigateTo);
    }
  };

  return (
    <div className="menu-button" onClick={handleClick}>
      <div className="text-wrapper">{label}</div>
    </div>
  );
};
