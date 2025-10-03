import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const quotes = [
  "Your help inspires us!",
  "Every small effort counts!",
  "Together we make a difference!",
  "Clean India, Green India!",
];

const SplashScreen = ({ onFinish }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [fade, setFade] = useState(true); // For fade effect

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setFade(true); // Fade in new quote
      }, 500); // fade-out duration
    }, 2000); // change quote every 2s

    // Finish splash after total time
    const timeout = setTimeout(() => {
      onFinish();
    }, 4000); // splash screen duration

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="splash-container">
      <span className={`quote ${fade ? 'fade-in' : 'fade-out'}`}>
        {quotes[currentQuote]}
      </span>
    </div>
  );
};



export default SplashScreen;
