import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import TabPanel from "../TabPanel";

const RegistrarDashboard = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Registrar's Office Overview</MDBCardTitle>
      <MDBCardText>Academic records and administrative functions</MDBCardText>
      {/* Add dashboard stats here */}
    </MDBCardBody>
  </MDBCard>
);

const AdmissionsManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Admissions</MDBCardTitle>
      <div className="mb-3">
        <MDBBtn color="primary" className="me-2">
          Process Applications
        </MDBBtn>
        <MDBBtn color="secondary">Generate Letters</MDBBtn>
      </div>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Application ID</th>
            <th>Candidate</th>
            <th>Program</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {/* Admissions data will be populated here */}
        </MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const TranscriptManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Transcript Processing</MDBCardTitle>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Request ID</th>
            <th>Student</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {/* Transcript requests will be populated here */}
        </MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const GraduationManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Graduation Processing</MDBCardTitle>
      <div className="mb-3">
        <MDBBtn color="primary" className="me-2">
          Process Graduates
        </MDBBtn>
        <MDBBtn color="secondary">Generate Certificates</MDBBtn>
      </div>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Program</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {/* Graduation data will be populated here */}
        </MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const DocumentManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Document Management</MDBCardTitle>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Document Type</th>
            <th>Student</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {/* Document requests will be populated here */}
        </MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const ExitCardListTab = () => {
  const navigate = useNavigate();

  return (
    <MDBCard>
      <MDBCardBody>
        <MDBCardTitle>Hostel Exit Card List</MDBCardTitle>
        <MDBCardText>
          View and download exit card list for hostel students
        </MDBCardText>
        <MDBBtn
          color="primary"
          onClick={() => navigate("/admin/exit-card-list")}
        >
          View Exit Card List
        </MDBBtn>
      </MDBCardBody>
    </MDBCard>
  );
};

const RegistrarPanel = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="registrar management tabs"
        >
          <Tab label="Dashboard" />
          <Tab label="Admissions" />
          <Tab label="Transcripts" />
          <Tab label="Graduation" />
          <Tab label="Documents" />
          <Tab label="Exit Card" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <RegistrarDashboard />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <AdmissionsManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <TranscriptManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <GraduationManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        <DocumentManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={5}>
        <ExitCardListTab />
      </TabPanel>
    </div>
  );
};

export default RegistrarPanel;
