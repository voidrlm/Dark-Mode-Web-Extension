setTheme();
chrome.runtime.onMessage.addListener(function (request) {
  if (request.args === "clicked") {
    setTheme("clicked");
  }
});
var currentDomain = getDomain();
var htmlBg;
var intervalId;
var isDomainExcluded = domainExcluded();
var isDarkModeOn =
  JSON.parse(localStorage.getItem("darkModeService")) === true &&
  !isDomainExcluded;

if (isDarkModeOn) {
  runService("start");
} else {
  runService("stop");
}
function setTheme(parameter) {
  const currentUrl = window.location.href;
  // Check if the URL ends with .pdf
  const isPdf = currentUrl.toLowerCase().endsWith(".pdf");
  var darkMode = JSON.parse(localStorage.getItem("darkModeService"));
  var newDomain = JSON.parse(localStorage.getItem("darkModeService")) === null;
  if (parameter === "clicked") {
    darkMode = newDomain ? true : !darkMode;
    localStorage.setItem("darkModeService", darkMode);

    if (darkMode && !isDomainExcluded) runService("start");
    else runService("stop");
    if (isDomainExcluded) {
      alert(
        "The website is either already set to the optimal configuration or has a dark theme option in-built."
      );
    }
  }
  if (!isPdf && darkMode && !isDomainExcluded) {
    if (document.body) {
      htmlBg = window.getComputedStyle(
        document.documentElement
      ).backgroundColor;
      var elementsToIgnore = `
       img,
      svg,
      video,
      iframe,
      embed,
      picture,
      path,
      .button .avatar,
      .redTxt,
      .greenTxt,
      .rdtxt,
      .grntxt,
      .advBar,
      .slick-slider,
      .arrow_class,
      .picker,
      .imgHolder,
      canvas,
      .bg-light,
      .priceChange,
      .percent-change,
      .sparkline-wrapper,
      .market-up-down,
      .positive,
      .negative,
      .index_val,
       code,
       .vjs-poster,
       .jw-preview
    `;
      const darkThemeStyles = `
  body {
    filter: invert(1);
    background-color: #121212 !important;
    background: #121212 !important;
  }

  .bg-light {
    background-color: #121212 !important;
    color: #FFFFFF;
  }

  ${elementsToIgnore} {
    filter: invert(1) !important;
  }

  code {
    filter: none !important;
  }

  .market-up-down, .index_val, .fk-modal-visible, .facets-modal-popup {
    filter: none !important;
  }

  .fk-modal-visible [style*="background-image"], picture,#video-js,.jw-media{
    filter: none !important;
  }

  .footer, footer, footer a, footer p, footer nav, .footer-bg, #c_copyright, .footer--details, .ftr-body, .ftr-cont {
    filter: none !important;
    background-color: #FFFFFF !important;
    color: #121212 !important;
  }

  [id*="cover"] {
    filter: none !important;
  }

  .feature {
    filter: invert(1) !important;
  }

  .plp-view, #app {
    background-color: #ffff !important;
  }

  ${
    htmlBg === "rgba(0, 0, 0, 0)"
      ? ""
      : "html { filter: none !important; background-color: #121212 !important; }"
  }
`;

      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      let styleSheet = document.getElementById("dark-theme-styles");
      if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = "dark-theme-styles";
        styleSheet.type = "text/css";
        document.body.appendChild(styleSheet);
      }
      styleSheet.innerText = darkThemeStyles;
    }
  } else {
    const styleSheet = document.getElementById("dark-theme-styles");
    if (styleSheet) {
      styleSheet.remove();
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    }
  }
}
function runService(action) {
  if (action == "start") {
    intervalId = setInterval(function () {
      setTheme();
    }, 100);
  } else {
    clearInterval(intervalId);
  }
}

// Function to handle fullscreen changes
const handleFullscreenChange = () => {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (isFullscreen) {
    document.querySelectorAll("video, iframe").forEach((el) => {
      el.style.setProperty("filter", "none", "important"); // Ensure correct styling for fullscreen elements
    });
  } else {
    document.querySelectorAll("video, iframe").forEach((el) => {
      el.style.filter = "invert(1)"; // Ensure correct styling for fullscreen elements
    });
  }
};
function getDomain() {
  const currentUrl = window.location.href;
  var hostname = new URL(currentUrl).hostname.toLowerCase();
  const domainParts = hostname.split(".").reverse();
  if (domainParts.length >= 2) {
    hostname = domainParts[1];
  }
  return hostname;
}

function domainExcluded() {
  currentDomain = getDomain();
  var exclusionList = [
    "google",
    "youtube",
    "x",
    "reddit",
    "facebook",
    "instagram",
    "canva",
    "github",
    "whatsapp",
    "slack",
    "trello",
    "spotify",
    "chatgpt",
    "apple",
    "coinmarketcap",
    "w3schools",
    "geeksforgeeks",
    "mozilla",
    "stackoverflow",
    "figma",
    "tradingview",
    "ndtv",
    "sciencenews",
    "usnews",
    "chartjs",
    "vuetifyjs",
    "westerndigital",
    "gopro",
    "theverge",
    "firstpost",
    "anydesk",
    "techspot",
    "yahoo",
    "hotstar",
    "netflix",
    "leetcode",
    "jio",
    "max",
    "primevideo",
    "hulu",
    "twitch",
  ];
  return exclusionList.some((domainName) => domainName == currentDomain);
}
