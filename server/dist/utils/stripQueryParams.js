"use strict";
// Utility function to strip query parameters from a URL
function stripQueryParams(url) {
    const index = url.indexOf('?');
    return index !== -1 ? url.substring(0, index) : url;
}
