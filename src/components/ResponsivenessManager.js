import React, { useState, useEffect } from "react";
import { HomeMobile } from "./home/mobile";
import { HomeDesktop } from "./home/desktop";

const ResponsiveManager = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (windowWidth >= 1024) {
    return <HomeDesktop />;
  } else {
    return <HomeMobile />;
  }
};

export default ResponsiveManager;
