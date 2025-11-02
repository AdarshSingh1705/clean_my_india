import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

const quotes = [
  "Your help inspires us!",
  "Every small effort counts!",
  "Together we make a difference!",
  "Clean India, Green India!",
];

const SplashScreen = ({ onFinish }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 400);
    }, 2000);

    const timeout = setTimeout(() => {
      onFinish();
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="splash-bg">
      <div className="glass-card">
        <span className={`quote-text ${fade ? "fade-in" : "fade-out"}`}>
          {quotes[currentQuote]}
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
