import React, { useState, useEffect } from "react";
import moment from "moment";
import "./style.css";

const Countdown = ({ targetDate, handleExpire = () => {} }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  function calculateTimeRemaining() {
    const now = moment();
    const target = moment(targetDate);
    const duration = moment.duration(target.diff(now));

    // Return zero if time has expired
    if (duration.asMilliseconds() <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(duration.asDays()),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
    };
  }

  useEffect(() => {
    // Initial calculation
    const initialTime = calculateTimeRemaining();
    setTimeRemaining(initialTime);

    // Only start timer if time hasn't expired
    if (
      initialTime.days > 0 ||
      initialTime.hours > 0 ||
      initialTime.minutes > 0 ||
      initialTime.seconds > 0
    ) {
      const interval = setInterval(() => {
        const remainingTime = calculateTimeRemaining();
        setTimeRemaining(remainingTime);

        if (
          remainingTime.days <= 0 &&
          remainingTime.hours <= 0 &&
          remainingTime.minutes <= 0 &&
          remainingTime.seconds <= 0
        ) {
          handleExpire(true);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      handleExpire(true);
    }
  }, [handleExpire, targetDate]);

  return (
    <div className="counter-container">
      <span
        className={`countdown-item ${timeRemaining.days <= 0 ? "expired" : ""}`}
      >
        {timeRemaining.days} days
      </span>
      <span
        className={`countdown-item ${
          timeRemaining.hours <= 0 ? "expired" : ""
        }`}
      >
        {timeRemaining.hours} hours
      </span>
      <span
        className={`countdown-item ${
          timeRemaining.minutes <= 0 ? "expired" : ""
        }`}
      >
        {timeRemaining.minutes} minutes
      </span>
      <span
        className={`countdown-item ${
          timeRemaining.seconds <= 0 ? "expired" : ""
        }`}
      >
        {timeRemaining.seconds} seconds
      </span>
    </div>
  );
};

export default Countdown;
