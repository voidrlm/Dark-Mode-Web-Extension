// Initialize dark mode state from localStorage
let isDarkMode = false;
let isExcluded = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleTheme") {
    if (!isExcluded) {
      isDarkMode = !isDarkMode;
      localStorage.setItem("darkMode", isDarkMode); // Save the state to localStorage
      if (isDarkMode) {
        setTheme();
      } else {
        removeDarkMode();
      }
    } else {
      chrome.runtime.sendMessage({ action: "changeIcon", icon: "pause" });
    }
  }
  //When user right clicks and starts and stops the dark mode service
  if (request.action === "starStopService") {
    if (request.valueSetOnChromStorage) {
      removeDarkMode();

      chrome.runtime.sendMessage({ action: "changeIcon", icon: "pause" });
    } else {
      setTheme();
    }
    isExcluded = request.valueSetOnChromStorage == true;
  }
});

function setTheme() {
  document.documentElement.style.setProperty(
    "background-color",
    "#121212",
    "important"
  );
  document.body.style.setProperty("background-color", "#121212", "important");

  const excludeSelectors = [
    "img",
    "video",
    "svg",
    "iframe",
    "embed",
    "picture",
    "path",
    ".button .avatar",
    ".picker",
    "canvas",
    ".bg-light",
    ".sparkline-wrapper",
    "code",
    ".feature",
    '[style*="background-image"]',
    "#ktplayer",
    ".down",
    ".up",
    ".video-js",
  ];

  const excludeQuery = excludeSelectors.join(", ");

  document
    .querySelectorAll(`html *, body *:not(${excludeQuery})`)
    .forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;

      // Handle background color
      if (isWhiteBasedColor(backgroundColor)) {
        element.style.setProperty("background-color", "#121212", "important");
      } else if (!isDarkColor(backgroundColor)) {
        element.style.setProperty("background-color", "#1e1e1e", "important"); // Slightly lighter dark
      }

      // Handle text color: Only change if the color is dark
      if (isDarkColor(color)) {
        element.style.setProperty("color", lightenColor(color), "important");
      }
    });
  isDarkMode = true;
  localStorage.setItem("darkMode", true);
  chrome.runtime.sendMessage({ action: "changeIcon", icon: "dark" });
}

function removeDarkMode() {
  document.documentElement.style.removeProperty("background-color");
  document.body.style.removeProperty("background-color");
  document.querySelectorAll("html *, body *").forEach((element) => {
    element.style.removeProperty("background-color");
    element.style.removeProperty("color");
  });
  isDarkMode = false;
  localStorage.setItem("darkMode", false);
  chrome.runtime.sendMessage({ action: "changeIcon", icon: "light" });
}

// Helper function to determine if a color is close to white
function isWhiteBasedColor(color) {
  const rgb = color.match(/\d+/g).map(Number);
  const threshold = 230;
  return rgb[0] > threshold && rgb[1] > threshold && rgb[2] > threshold;
}

// Helper function to determine if a color is dark
function isDarkColor(color) {
  const rgb = color.match(/\d+/g).map(Number);
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 150;
}

// Helper function to lighten a color
function lightenColor(color) {
  const rgb = color.match(/\d+/g).map(Number);
  return `rgb(${Math.min(rgb[0] + 100, 255)}, ${Math.min(
    rgb[1] + 100,
    255
  )}, ${Math.min(rgb[2] + 100, 255)})`;
}

// Observer to monitor changes in the document
function monitor() {
  const observer = new MutationObserver(() => {
    if (isDarkMode) {
      setTheme();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
function isDarkModeInLocalStorage() {
  return (
    localStorage.getItem("darkMode") == "true" ||
    localStorage.getItem("darkMode") == null
  );
}

function checkBody() {
  if (document.body) {
    isDarkMode = isDarkModeInLocalStorage();
    if (isDarkMode) {
      monitor();
      setTheme();
    } else {
      chrome.runtime.sendMessage({ action: "changeIcon", icon: "light" });
    }
  } else {
    console.log("Document body not yet available. Retrying...");
    setTimeout(checkBody, 100); // Retry after 50ms
  }
}

chrome.runtime.sendMessage({ action: "checkDomain" }, (response) => {
  isExcluded = response.exists;
  if (!response.exists) {
    checkBody();
  } else {
    chrome.runtime.sendMessage({ action: "changeIcon", icon: "pause" });
  }
});
