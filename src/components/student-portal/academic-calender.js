import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import { MDBCol } from "mdb-react-ui-kit";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set the workerSrc for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AcademicCalendar = () => {
  const pdfUrl = "https://api.mcchstfuntua.edu.ng/resources/acc_calender.pdf";
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div>
      <MDBCol className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
        <div className="m-4"></div>
        <div className="reg-captions">Academic Calendar</div>

        <Paper elevation={3} style={{ width: "100%" }}>
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </Paper>
      </MDBCol>
    </div>
  );
};

export default AcademicCalendar;
