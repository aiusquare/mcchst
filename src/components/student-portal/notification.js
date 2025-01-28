import { Avatar, Badge } from "@mui/material";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import userLogo from "../../pictures/user.png";
import notifIcon from "../../pictures/alarm.png";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
// import { ServiceComContext } from "./dashboard";
import { styled } from "@mui/material/styles";
import { firebase } from "../../services/config";
import { useEffect } from "react";
import { Menu, MenuItem } from "react-pro-sidebar";

export default function Notification() {
  const navigate = useNavigate();
  // const { agent } = useContext(ServiceComContext);
  const [init, setInit] = useState(false);
  const [message, setMessage] = useState({});

  const db = firebase.database();

  useEffect(() => {
    if (init === true) return;
    if (navigator.onLine) {
      fetch("https://www.google.com/", { mode: "no-cors" }).then(() => {
        db.ref("Admin/").on("value", function (snap) {
          try {
            setMessage(snap.child("notification").val());

            setInit(true);
          } catch (e) {
            console.log("Error loging:", e);
          }
        });
      });
    }
  }, [init]);

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));

  return (
    <div>
      <Menu
        menuButton={
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            variant="dot"
            style={{ cursor: "pointer" }}
          >
            <Avatar
              sx={{ width: 30, height: 30 }}
              src={notifIcon}
              variant="rounded"
            />
          </StyledBadge>
        }
        arrow={"arrow"}
        transition
      >
        <MenuItem
        //   onClick={() => {
        //     navigate("settings");
        //   }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              color: "white",
              backgroundColor: "GrayText",
            }}
          >
            <b>{}</b>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
