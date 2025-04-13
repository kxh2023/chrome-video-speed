import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [speed, setSpeed] = useState(1.0);
  const [customSpeed, setCustomSpeed] = useState("");
  const [videoCount, setVideoCount] = useState(0);
  const [isGambleActive, setIsGambleActive] = useState(false);
  const [gambleTimeRemaining, setGambleTimeRemaining] = useState(0);
  const [gambleSpeed, setGambleSpeed] = useState(0);
  const [currentSpeedLabel, setCurrentSpeedLabel] = useState("Custom");
  const timerIntervalRef = useRef<number | null>(null);

  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

  useEffect(() => {
    fetchCurrentSpeed();

    // Clear interval when component unmounts
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Update the speed label whenever speed changes
  useEffect(() => {
    updateSpeedLabel(speed);
  }, [speed]);

  const updateSpeedLabel = (currentSpeed: number) => {
    const matchedPreset = speedOptions.find(
      (option) => Math.abs(option - currentSpeed) < 0.001
    );
    setCurrentSpeedLabel(
      matchedPreset !== undefined ? `${matchedPreset}x` : "Custom"
    );
  };

  const fetchCurrentSpeed = () => {
    if (chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: "getSpeed" },
            (response) => {
              if (response) {
                setSpeed(response.speed);
                updateSpeedLabel(response.speed);
                setVideoCount(response.count);

                if (response.gambleActive) {
                  setIsGambleActive(true);
                  setGambleTimeRemaining(response.gambleTimeRemaining);
                  setGambleSpeed(response.speed);

                  // Start countdown timer
                  if (timerIntervalRef.current !== null) {
                    window.clearInterval(timerIntervalRef.current);
                  }

                  timerIntervalRef.current = window.setInterval(() => {
                    setGambleTimeRemaining((prev) => {
                      if (prev <= 1) {
                        window.clearInterval(
                          timerIntervalRef.current as number
                        );
                        setIsGambleActive(false);
                        fetchCurrentSpeed(); // Refresh speed after gamble ends
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                }
              }
            }
          );
        }
      });
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (isGambleActive) return; // Don't allow speed changes during gamble

    setSpeed(newSpeed);

    if (chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: "setSpeed", speed: newSpeed },
            (response) => {
              if (response) {
                setVideoCount(response.count);
              }
            }
          );
        }
      });
    }
  };

  const handleCustomSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSpeed(e.target.value);
  };

  const handleCustomSpeedKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      applyCustomSpeed();
    }
  };

  const applyCustomSpeed = () => {
    if (isGambleActive || !customSpeed) return;

    const newSpeed = parseFloat(customSpeed);
    if (!isNaN(newSpeed) && newSpeed >= 0.1 && newSpeed <= 16) {
      handleSpeedChange(newSpeed);
      setCustomSpeed("");
    }
  };

  const startGamble = () => {
    if (isGambleActive) return;

    if (chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: "startGamble" },
            (response) => {
              if (response && response.success) {
                setIsGambleActive(true);
                setGambleSpeed(response.gambleSpeed);
                setSpeed(response.gambleSpeed);
                setVideoCount(response.count);
                setGambleTimeRemaining(response.gambleTimeRemaining);
                setCurrentSpeedLabel("Gamble");

                // Start countdown timer
                if (timerIntervalRef.current !== null) {
                  window.clearInterval(timerIntervalRef.current);
                }

                timerIntervalRef.current = window.setInterval(() => {
                  setGambleTimeRemaining((prev) => {
                    if (prev <= 1) {
                      window.clearInterval(timerIntervalRef.current as number);
                      setIsGambleActive(false);
                      fetchCurrentSpeed(); // Refresh speed after gamble ends
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
              }
            }
          );
        }
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container">
      <h1 className="heading">Video Speed Controller</h1>

      {videoCount > 0 ? (
        <>
          <div className="video-count">
            {videoCount} video{videoCount !== 1 ? "s" : ""} found on page
          </div>

          <div className="content-wrapper">
            <div className="speed-display">
              <span className="speed-value">
                Current speed: {speed.toFixed(2)}x
              </span>
              <span className="speed-label">{currentSpeedLabel}</span>
            </div>

            {isGambleActive && (
              <div className="gamble-alert">
                <div className="gamble-title">GAMBLE MODE ACTIVE</div>
                <div className="gamble-info">
                  Locked at {gambleSpeed.toFixed(2)}x for{" "}
                  {formatTime(gambleTimeRemaining)}
                </div>
              </div>
            )}

            <input
              type="range"
              min="0.25"
              max="3"
              step="0.05"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="slider"
              disabled={isGambleActive}
            />

            <div className="speed-grid">
              {speedOptions.map((option) => (
                <button
                  key={option}
                  className={`speed-button ${
                    Math.abs(speed - option) < 0.001
                      ? "speed-button-active"
                      : "speed-button-inactive"
                  }`}
                  onClick={() => handleSpeedChange(option)}
                  disabled={isGambleActive}
                >
                  {option}x
                </button>
              ))}
            </div>

            <div className="custom-speed-container">
              <input
                type="text"
                placeholder="Custom speed (0.1 - 16)"
                value={customSpeed}
                onChange={handleCustomSpeedChange}
                onKeyDown={handleCustomSpeedKeyDown}
                className="custom-speed-input"
                disabled={isGambleActive}
              />
              <button
                onClick={applyCustomSpeed}
                className="apply-button"
                disabled={isGambleActive}
              >
                Apply
              </button>
            </div>

            <button
              onClick={startGamble}
              className="gamble-button"
              disabled={isGambleActive}
            >
              {isGambleActive ? "GAMBLING LOCKED" : "GAMBLE 🎰"}
            </button>

            {isGambleActive && (
              <div className="timer-text">
                Speed is locked for {formatTime(gambleTimeRemaining)}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-videos">
          <p className="no-videos-title">No videos found on this page.</p>
          <p className="no-videos-info">
            Open a page with videos and try again.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
