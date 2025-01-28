import React from "react";
import "../css/style.css";
import c1 from "../pictures/c1.jpg";
import c2 from "../pictures/c2.jpg";
import c3 from "../pictures/c3.jpg";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

export default function ImageSlider() {
  const imagesArr = [{ image: c1 }, { image: c2 }, { image: c3 }];

  return (
    <div
      style={{
        position: "absolute",

        width: "100%",
        height: "280px",
        overflow: "hidden",
      }}
      className="card"
    >
      <Fade style={{ width: "100%", height: "100%" }} indicators={true}>
        {imagesArr.map((glry_img, index) => (
          <div className="slide-img-container">
            <img
              className="w-100 img-fluid"
              style={{ maxHeight: "100%" }}
              src={glry_img.image}
              alt="galary image"
            />
          </div>
        ))}
      </Fade>
    </div>
  );
}
