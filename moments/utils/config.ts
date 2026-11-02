const PRODUCTION_BACKEND = 'https://memorylane-preview.onrender.com';
const LOCAL_BACKEND =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function resolveBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_BACKEND;
    }
    if (hostname === 'memorylane.appx.live') {
      return 'https://memorylane-g4wd.onrender.com';
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return LOCAL_BACKEND;
  }

  return PRODUCTION_BACKEND;
}

const HTTP_BACKEND = resolveBackendUrl();

export { HTTP_BACKEND };
