// Social sharing
export const shareOnTwitter = () => {
  const text = encodeURIComponent(
    `Check out my memory book project on Moments Memory Books!`
  );
  const url = encodeURIComponent("https://momentsmemorybooks.com");
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    "_blank"
  );
};

export const shareOnFacebook = () => {
  const url = encodeURIComponent("https://momentsmemorybooks.com");
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
};

export const shareOnInstagram = () => {
  // Instagram doesn't have a direct share URL; redirect to app or website
  const url = encodeURIComponent("https://momentsmemorybooks.com");
  window.open(`https://www.instagram.com/?url=${url}`, "_blank");
};

export const shareOnTikTok = () => {
  // TikTok doesn't have a direct share URL; redirect to app or website
  const url = encodeURIComponent("https://momentsmemorybooks.com");
  window.open(`https://www.tiktok.com/?url=${url}`, "_blank");
};
