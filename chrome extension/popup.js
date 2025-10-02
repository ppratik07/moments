document.getElementById("openApp").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://memorylane.appx.live/" });
  
});
