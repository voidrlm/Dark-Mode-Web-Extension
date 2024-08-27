async function setTheme() {
  console.log("setting");
  if (document.body) applyDarkMode();
}
function applyDarkMode() {
  // Ensure the html and body elements cover the full height of the page

  document.documentElement.style.height = "100%";
  document.body.style.height = "100%";
  document.documentElement.style.backgroundColor = "#121212"; // Dark background for html
  document.body.style.backgroundColor = "#121212"; // Dark background for body
  document.body.style.color = "#e0e0e0"; // Light text color for the body
  // Array of selectors to exclude from dark mode
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

  // Convert array to a single string of selectors
  const excludeQuery = excludeSelectors.join(", ");

  // Apply dark mode to all elements except the excluded ones
  document
    .querySelectorAll(`html *, body *:not(${excludeQuery})`)
    .forEach((element) => {
      // Get the current background color
      const backgroundColor = window.getComputedStyle(element).backgroundColor;

      // Check if the background color is white or near-white
      if (isWhiteBasedColor(backgroundColor)) {
        element.style.backgroundColor = "#121212"; // Dark background color
        element.style.color = "#e0e0e0"; // Light text color
      }
    });

  // Explicitly reset styles for video and its overlay
  const videoElements = document.querySelectorAll("video, #vidcontent");
  videoElements.forEach((element) => {
    element.style.backgroundColor = ""; // Reset background color
    element.style.color = ""; // Reset text color if needed
    element.style.filter = ""; // Ensure no filters are applied
  });

  // Adjust dark text colors to lighter shades
  document
    .querySelectorAll("body *:not(" + excludeQuery + ")")
    .forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;

      // Check if the text color is dark and adjust it
      if (isDarkColor(color)) {
        element.style.color = lightenColor(color);
      }
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

async function monitor() {
  const observer = new MutationObserver(setTheme);
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
    setTimeout(checkBody, 50); // Retry after 100ms
  }
}

setTimeout(checkBody, 50);
setTheme();
