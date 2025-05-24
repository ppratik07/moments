// Utility function to strip query parameters from a URL
function stripQueryParams(url: string): string {
    const index = url.indexOf('?');
    return index !== -1 ? url.substring(0, index) : url;
  }
  