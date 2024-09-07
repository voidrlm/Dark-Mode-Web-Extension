chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleTheme" });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addDomain",
    title: "Include/Exclude from Dark Mode Service",
    contexts: ["all"],
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleTheme") {
    // Correctly set the icon path based on the theme
    const iconPath =
      request.icon == "dark"
        ? "icons/moon.png"
        : request.icon == "light"
        ? "icons/sun.png"
        : "icons/pause.png";
    // Change the extension icon
    chrome.action.setIcon({ path: iconPath });
    // Returning true to indicate the response will be sent asynchronously
    return true;
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addDomain") {
    const hostname = new URL(tab.url).hostname;
    const { excludedDomainsForDarkTheme = [] } = await chrome.storage.local.get(
      "excludedDomainsForDarkTheme"
    );
    const excluded = excludedDomainsForDarkTheme.includes(hostname);
    if (excluded) {
      // Remove domain
      const updatedDomains = excludedDomainsForDarkTheme.filter(
        (domain) => domain !== hostname
      );
      await chrome.storage.local.set({
        excludedDomainsForDarkTheme: updatedDomains,
      });
    } else {
      // Add domain
      excludedDomainsForDarkTheme.push(hostname);
      await chrome.storage.local.set({ excludedDomainsForDarkTheme });
    }
    chrome.tabs.sendMessage(tab.id, {
      action: "addDomain",
      isExcluded: excluded,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkDomain") {
    const hostname = new URL(sender.tab.url).hostname;
    chrome.storage.local.get("excludedDomainsForDarkTheme", (result) => {
      const excludedDomainsForDarkTheme =
        result.excludedDomainsForDarkTheme || [];
      const exists = excludedDomainsForDarkTheme.includes(hostname);
      sendResponse({ exists });
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
});
