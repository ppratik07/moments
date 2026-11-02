export function getImageUrl(imageKey: string | null) {
  if (imageKey === null || imageKey === '') return null;

  const envBase = process.env.NEXT_PUBLIC_IMAGE_R2_URL?.replace(/\/$/, '');
  let baseUrl = envBase;

  if (!baseUrl) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:8080/uploads';
      }
    }
    if (!baseUrl && process.env.NODE_ENV === 'development') {
      baseUrl = 'http://localhost:8080/uploads';
    }
  }

  baseUrl =
    baseUrl || 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';

  return `${baseUrl}/${imageKey}`;
}