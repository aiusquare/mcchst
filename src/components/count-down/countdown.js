import React, { useState, useEffect } from "react";
import moment from "moment";
import "./style.css";

const Countdown = ({ targetDate, handleExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  function calculateTimeRemaining() {
    const now = moment();
    const target = moment(targetDate);
    const duration = moment.duration(target.diff(now));

    return {
      days: duration.days(),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = calculateTimeRemaining();
      setTimeRemaining(remainingTime);

      if (
        remainingTime.days <= 0 &&
        remainingTime.hours <= 0 &&
        remainingTime.minutes <= 0 &&
        remainingTime.seconds <= 0
      ) {
        // Notify the calling component when time is expired
        handleExpire(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
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
