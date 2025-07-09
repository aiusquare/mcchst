import applicationIcon from "../../pictures/application.png";
import admissionIcon from "../../pictures/admission.png";
import usersIcon from "../../pictures/users.png";
import resIcon from "../../pictures/resources.png";
import sun from "../../pictures/sun_2.png";
import afnSunIcon from "../../pictures/afn_sun.png";
import settingsIcon from "../../pictures/settings.png";
import dashboardIco from "../../pictures/dashboard.png";
import timetableIcon from "../../pictures/timetable.png";
import calenderIcon from "../../pictures/calendar.png";
import examIcon from "../../pictures/exam.png";
import logo from "../../pictures/logo.png";
import financeIcon from "../../pictures/finance.png";
import { Toast } from "../errorNotifier";

import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
} from "react-pro-sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Chip, Divider } from "@mui/material";

const SideNavBar = () => {
  const { collapsed, toggleSidebar } = useProSidebar();
  const navigate = useNavigate();

  const handleAccess = (loc) => {
    toggleSidebar();
    navigate(loc);
  };

  return (
    <div style={{  display: "flex" }}>
      <Sidebar
        breakPoint="sm"
        transitionDuration={800}
        style={{  background: "#ffffff" }}
      >
        <Menu>
          <div style={{ display: "flex" }}>
            <AppLogo />
          </div>

          <div className="mt-4">{!collapsed && <UserGreatings />}</div>

          <Divider className="my-1" />
          <MenuItem
            style={{ textAlign: "left" }}
            onClick={() => {
              handleAccess("");
            }}
            icon={<BarIcons img={dashboardIco} />}
          >
            DashBoard
          </MenuItem>
          <Divider className="my-1" />

          <MenuItem
            style={{ textAlign: "left" }}
            onClick={() => {
              // handleAccess("application");
            }}
            icon={<BarIcons img={resIcon} />}
          >
            Resources
          </MenuItem>
          <MenuItem
            style={{ textAlign: "left" }}
            onClick={() => {
              handleAccess("reg-downloads");
            }}
            icon={<BarIcons img={resIcon} />}
          >
            Registration downloads
          </MenuItem>
          <MenuItem
            style={{ textAlign: "left" }}
            onClick={() => {
              // handleAccess("admission");
            }}
            icon={<BarIcons img={timetableIcon} />}
          >
            Time table
          </MenuItem>

          <SubMenu
            icon={<BarIcons img={financeIcon} />}
            label="Payments"
            style={{ textAlign: "left" }}
          >
            <MenuItem
              style={{ textAlign: "left" }}
              onClick={() => {
                handleAccess("manage-payments");
              }}
              icon={<BarIcons img={financeIcon} />}
            >
              Manage Payments
            </MenuItem>
            <MenuItem
              style={{ textAlign: "left" }}
              onClick={() => {
                handleAccess("invoices");
              }}
              icon={<BarIcons img={financeIcon} />}
            >
              Billing
            </MenuItem>
            <MenuItem
              style={{ textAlign: "left" }}
              onClick={() => {
                handleAccess("transactions");
              }}
              icon={<BarIcons img={financeIcon} />}
            >
              Tranasactions
            </MenuItem>
          </SubMenu>

          <MenuItem
            style={{ textAlign: "left" }}
            onClick={() => {
              handleAccess("acc-calender");
            }}
            icon={<BarIcons img={calenderIcon} />}
          >
            Academic Calender
          </MenuItem>

          <MenuItem
            style={{ textAlign: "left" }}
            onClick={() => {
              // handleAccess("settings");
            }}
            icon={<BarIcons img={examIcon} />}
          >
            Exams
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

const AppLogo = () => {
  const navigate = useNavigate();
  const { collapseSidebar, collapsed } = useProSidebar();

  const toggle = () => {
    collapseSidebar();
  };

  return (
    <div>
      <div
        onClick={() => {
          navigate("/");
        }}
        className=" align-items-center"
        style={{ display: "flex", margin: "10px", justifyContent: "end" }}
      >
        <img
          style={{ cursor: "pointer", width: "50px", height: "50px" }}
          src={logo}
        />

        {!collapsed && (
          <h3 className="m-2" style={{ fontSize: "22px", fontWeight: 900 }}>
            MCCHST FUNTUA
          </h3>
        )}
      </div>
    </div>
  );
};

const BarIcons = (props) => {
  return (
    <img
      className="circle"
      style={{ width: "48px", height: "48px", padding: "15px" }}
      src={props.img}
    />
  );
};

const UserGreatings = () => {
  const [greating, setGreating] = useState("");
  const [greatingIcon, setGreatingIcon] = useState(sun);

  useEffect(() => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: "Africa/Lagos", // Set the time zone to Lagos
    });
    const time = formatter.format(date).split(" ")[1];
    const hour = formatter.format(date).split(" ")[0];
    const hourVal = parseInt(hour);

    let greeting = "";
    if (hourVal >= 5 && hourVal < 12 && time === "AM") {
      greeting = "Good Morning";
    } else if (
      (hourVal >= 1 && hourVal < 5 && time === "PM") ||
      hourVal === 12
    ) {
      greeting = "Good Afternoon";
      setGreatingIcon(afnSunIcon);
    } else {
      greeting = "Good Evening";
      setGreatingIcon(afnSunIcon);
    }

    setGreating(greeting);
  });

  return (
    <div className="greating-card p-3">
      <div
        className="center"
        style={{
          fontSize: "small",
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <b>{greating}</b>
        <Avatar
          src={greatingIcon}
          className="m-1"
          sx={{ width: 26, height: 26 }}
        >
          s
        </Avatar>
      </div>
      <div
        className="mx-4"
        style={{ display: "flex", justifyContent: "flex-start" }}
      >
        <Chip
          avatar={<Avatar sx={{ bgcolor: "#daab2a" }}>N</Avatar>}
          label={
            <div className="m-2" style={{ color: "white", fontWeight: 900 }}>
              Student
            </div>
          }
          variant="outlined"
        />
      </div>
    </div>
  );
};

export default SideNavBar;
