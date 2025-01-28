import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const logoutTimer = () => {
  //   const [timeoutId, setTimeoutId] = useState(null);
  //   const navigate = useNavigate();

  //   useEffect(() => {
  const lastActivityTime = localStorage.getItem("lastActivityTime");

  console.log("LAST ACTIVITY", lastActivityTime);

  //   calculateTimeRemaining(lastActivityTime);

  //   window.addEventListener("mousemove", handleUserActivity);
  //   window.addEventListener("keypress", handleUserActivity);

  //   resetTimer();

  //   return () => {
  //     window.removeEventListener("mousemove", handleUserActivity);
  //     window.removeEventListener("keypress", handleUserActivity);
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //   };
  //   //   }, [navigate]);

  //   return null;
};

// const calculateTimeRemaining = (lastActivityTime) => {
//   const now = Date.now();
//   const lastActivity = lastActivityTime ? parseInt(lastActivityTime, 10) : now;
//   const elapsed = now - lastActivity;
//   const timeRemaining = 30 * 60 * 1000 - elapsed; // 30 minutes in milliseconds

//   return timeRemaining > 0 ? timeRemaining : 0;
// };

// const resetTimer = (timeoutId) => {
//   if (timeoutId) {
//     clearTimeout(timeoutId);
//   }

//   const timeRemaining = calculateTimeRemaining();

//   const newTimeoutId = setTimeout(() => {
//     // onLogout();
//     navigate("/login");
//   }, timeRemaining);

//   setTimeoutId(newTimeoutId);
// };

// const handleUserActivity = () => {
//   localStorage.setItem("lastActivityTime", Date.now().toString());
//   resetTimer();
// };
