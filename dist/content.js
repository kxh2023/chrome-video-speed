// Global variables for the gamble feature
let isGambleActive = false;
let gambleEndTime = 0;
let gambleSpeed = 1.0;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const videos = document.querySelectorAll("video");

  if (request.action === "setSpeed" && !isGambleActive) {
    const speed = request.speed;

    videos.forEach((video) => {
      video.playbackRate = speed;
    });

    sendResponse({ success: true, count: videos.length });
  } else if (request.action === "getSpeed") {
    let speed = 1.0;

    if (videos.length > 0) {
      speed = videos[0].playbackRate;
    }

    // Check if gamble is still active
    if (isGambleActive) {
      const currentTime = Date.now();
      const timeRemaining = Math.max(
        0,
        Math.floor((gambleEndTime - currentTime) / 1000)
      );

      // If gamble has expired, reset it
      if (currentTime >= gambleEndTime) {
        isGambleActive = false;
      }

      sendResponse({
        speed: gambleSpeed,
        count: videos.length,
        gambleActive: isGambleActive,
        gambleTimeRemaining: timeRemaining,
      });
    } else {
      sendResponse({
        speed,
        count: videos.length,
        gambleActive: false,
      });
    }
  } else if (request.action === "startGamble") {
    // Generate a random speed between 0.25 and 3.0
    gambleSpeed = Math.random() * 2.75 + 0.25;
    gambleSpeed = Math.round(gambleSpeed * 100) / 100; // Round to 2 decimal places

    // Set the gamble timer for 5 minutes
    isGambleActive = true;
    gambleEndTime = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds

    // Apply the gamble speed to all videos
    videos.forEach((video) => {
      video.playbackRate = gambleSpeed;
    });

    // Send back the gamble details
    const timeRemaining = 5 * 60; // 5 minutes in seconds
    sendResponse({
      success: true,
      gambleSpeed: gambleSpeed,
      count: videos.length,
      gambleActive: true,
      gambleTimeRemaining: timeRemaining,
    });
  }

  return true; // Keep the message channel open for async response
});
