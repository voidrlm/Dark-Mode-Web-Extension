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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addDomain") {
    const hostname = new URL(tab.url).hostname;
    const { excludedDomainsForDarkTheme = [] } = await chrome.storage.local.get(
      "excludedDomainsForDarkTheme"
    );

    if (excludedDomainsForDarkTheme.includes(hostname)) {
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
