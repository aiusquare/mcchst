import React, { useState } from "react";
import { MDBNavbar, MDBContainer, MDBNavbarNav } from "mdb-react-ui-kit";

import telIcon from "../../pictures/telephone.png";
import { useProSidebar } from "react-pro-sidebar";
import { Avatar, Badge, Menu } from "@mui/material";
import { styled } from "@mui/material/styles";
import SettingsMenu from "./dashboardMenu";
import Notification from "./notification";

export default function TopBar() {
  const { broken, toggleSidebar } = useProSidebar();

  return (
    <MDBNavbar expand="lg" light bgColor="light">
      <MDBContainer className="d-flex" fluid>
        {broken && (
          <i
            style={{ cursor: "pointer" }}
            onClick={() => {
              toggleSidebar();
            }}
            class="fas fa-bars ml-4"
          ></i>
        )}
        {!broken && <ActionTogler />}
        <MDBNavbarNav className="w-auto ">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              className="mx-2 dashboard-contact"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={telIcon}
                variant="rounded"
              />
            </div>

            <div className="mx-4">
              <SettingsMenu />
            </div>
          </div>
        </MDBNavbarNav>
      </MDBContainer>
    </MDBNavbar>
  );
}

const ActionTogler = () => {
  const { collapsed, toggled, toggleSidebar, collapseSidebar } =
    useProSidebar();

  const toggle = () => {
    toggleSidebar();
    if (toggled) {
      console.log(true);
      collapseSidebar();
    } else {
      console.log(false);
      collapseSidebar();
    }
  };

  return (
    <div>
      {!collapsed && (
        <i
          onClick={() => {
            toggle();
          }}
          style={{ cursor: "pointer" }}
          class="fas fa-angle-double-left"
        ></i>
      )}
      {collapsed && (
        <i
          onClick={() => {
            toggle();
          }}
          style={{ cursor: "pointer" }}
          class="fas fa-angle-double-right"
        ></i>
      )}
    </div>
  );
};
