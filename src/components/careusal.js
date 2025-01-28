import { MDBCard } from "mdb-react-ui-kit";
import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { useNavigate } from "react-router-dom";

export default function CarouselComp() {
  // const [init, setInit] = useState(false);
  const refPc = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!init) {
  //     refPc.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "start",
  //     });
  //     setInit(true);
  //   }
  // });
  return (
    <div ref={refPc} className="mt-2 mb-2 rounded" style={{ width: "100%" }}>
      <MDBCard
        className="m-2 p-2 rounded"
        style={{ flex: 1, background: "#f3f1f1" }}
      >
        <h1 style={{ fontWeight: 900, marginTop: "20px", padding: "20px" }}>
          COLLEGE NEWS
        </h1>
        <Carousel autoPlay infiniteLoop interval={5000} showArrows={true}>
          <div className="slide rounded" style={{ padding: "10px" }}>
            <div className="h-100" style={{ cursor: "pointer" }}>
              <CarouselItem
                title="Exciting News!"
                description=" Our admission portal opens on March 1st, 2024. Get ready to join
                our vibrant community!"
              />
            </div>
          </div>

          <div className="slide rounded">
            <div className="h-100" style={{ cursor: "pointer" }}>
              <CarouselItem
                title="Commendation for Dedication"
                description="College Provost Commends Staff for NBTE Accreditation Success. Recognizing staff cooperation and dedication during the recent NBTE Accreditation."
              />
            </div>
          </div>

          <div className="sec-slide rounded">
            <div className="h-100" style={{ cursor: "pointer" }}>
              <CarouselItem
                title="100% Success in WAHEB 2023"
                description="College Attains Perfect Success in WAHEB 2023 ND and HND Exams. Celebrating the achievement of 100% success in both ND and HND National Examinations."
              />
            </div>
          </div>

          <div className="slide rounded" style={{ padding: "10px" }}>
            <div className="h-100" style={{ cursor: "pointer" }}>
              <CarouselItem
                title="Remarkable Results in 2023 National Exams"
                description="Outstanding Success: 100% Scores in Key Disciplines. Highlighting exceptional results, including 100% scores in certain disciplines and high achievements in Pharmacy Technicians."
              />
            </div>
          </div>
        </Carousel>
      </MDBCard>
    </div>
  );
}

const CarouselItem = ({ title, description }) => (
  <div style={{ marginTop: "50px" }}>
    <h3>{title}</h3>
    <p style={{ padding: "10px" }}>{description}</p>
  </div>
);
