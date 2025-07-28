import React from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";

const RegistrarPanel = () => {
  return (
    <div>
      <MDBCard>
        <MDBCardBody>
          <MDBCardTitle>Registrar Dashboard</MDBCardTitle>
          <MDBCardText>
            Manage academic records and administrative functions
          </MDBCardText>
        </MDBCardBody>
      </MDBCard>

      <MDBCard className="mt-4">
        <MDBCardBody>
          <MDBTable hover>
            <MDBTableHead>
              <tr>
                <th>Document Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {/* Table content will be populated here */}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default RegistrarPanel;
