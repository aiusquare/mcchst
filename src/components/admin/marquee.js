import React from "react";
import "../css/marquee.css"; // Import your CSS file for styling

const Marquee = ({ text }) => {
  return (
    <div className="marquee-container">
      <marquee behavior="scroll" scrollamount="5" direction="left">
        {text}
      </marquee>
    </div>
  );
};

export default Marquee;
