import { Avatar } from "@mui/material";
import { Menu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import userLogo from "../../pictures/user.png";
import { useNavigate } from "react-router-dom";

export default function SettingsMenu() {
  const navigate = useNavigate();

  return (
    <div>
      <Menu
        menuButton={
          <Avatar
            style={{ cursor: "pointer" }}
            sx={{ bgcolor: "#eeeff1" }}
            src={userLogo}
            aria-label="recipe"
          />
        }
        arrow={"arrow"}
        transition
      >
        <MenuItem
          onClick={() => {
            navigate("settings");
          }}
        >
          <i class="fas fa-gear pe-2"></i>
          SETTINGS
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/");
          }}
        >
          <i class="fas fa-right-from-bracket pe-2"></i>
          LOGOUT
        </MenuItem>
      </Menu>
    </div>
  );
}
