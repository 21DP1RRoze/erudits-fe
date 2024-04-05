import React, { useState, useEffect } from "react";

const Countdown = ({ done }) => {
  const [second, setSecond] = useState(3);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (second > 1) {
        setSecond((prevSecond) => prevSecond - 1);
      } else {
        clearInterval(interval);
        finishCountdown();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [second]);

  const finishCountdown = () => {
    done(true);
    setIsVisible(false);
  };

  return (
    isVisible && (
      <div className="timerContainer">
        <div className="timerCircle">
          <div className="timerNumber">{second}</div>
        </div>
      </div>
    )
  );
};

export default Countdown;