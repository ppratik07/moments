let HTTP_BACKEND = "https://memorylane-preview.onrender.com";
// let HTTP_BACKEND = 'http://localhost:8080'; // default for local

if (typeof window !== "undefined") {
  const hostname = window.location.hostname;

  if (hostname === "memorylane.appx.live") {
    HTTP_BACKEND = "https://memorylane-g4wd.onrender.com";
  }
}

export { HTTP_BACKEND };
