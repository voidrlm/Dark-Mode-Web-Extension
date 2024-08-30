// Initialize dark mode state from localStorage
let isDarkMode = localStorage.getItem("darkMode") === "true";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleTheme") {
    isDarkMode = !isDarkMode;
    localStorage.setItem("darkMode", isDarkMode); // Save the state to localStorage

    if (isDarkMode) {
      setTheme();
    } else {
      removeDarkMode();
    }

    sendResponse({ status: "Toggled", isDarkMode });
  }
});

function setTheme() {
  document.documentElement.style.height = "100%";
  document.body.style.height = "100%";
  document.documentElement.style.backgroundColor = "#121212";
  document.body.style.backgroundColor = "#121212";
  document.body.style.color = "#e0e0e0";

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
      const backgroundColor = window.getComputedStyle(element).backgroundColor;

      if (isWhiteBasedColor(backgroundColor)) {
        element.style.backgroundColor = "#121212";
        element.style.color = "#e0e0e0";
      }
    });

  document
    .querySelectorAll("body *:not(" + excludeQuery + ")")
    .forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;

      if (isDarkColor(color)) {
        element.style.color = lightenColor(color);
      }
    });
}

function removeDarkMode() {
  document.documentElement.style.removeProperty("background-color");
  document.body.style.removeProperty("background-color");
  document.body.style.removeProperty("color");

  document.querySelectorAll("body *").forEach((element) => {
    element.style.removeProperty("background-color");
    element.style.removeProperty("color");
  });
}

// Helper function to determine if a color is close to white
function isWhiteBasedColor(color) {
  const rgb = color.match(/\d+/g).map(Number);

  // Adjust these thresholds based on your requirements
  const threshold = 240;
  return rgb[0] >= threshold && rgb[1] >= threshold && rgb[2] >= threshold;
}

// Helper function to determine if a color is dark
function isDarkColor(color) {
  const rgb = color.match(/\d+/g).map(Number);
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 186;
}

// Helper function to lighten a color
function lightenColor(color) {
  const rgb = color.match(/\d+/g).map(Number);
  return `rgb(${Math.min(rgb[0] + 40, 255)}, ${Math.min(
    rgb[1] + 40,
    255
  )}, ${Math.min(rgb[2] + 40, 255)})`;
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
    attribute: true,
  });
}

function checkBody() {
  if (document.body) {
    monitor();
  } else {
    console.log("Document body not yet available. Retrying...");
    setTimeout(checkBody, 50); // Retry after 50ms
  }
}

setTimeout(checkBody, 50);
