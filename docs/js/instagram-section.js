document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('instagram-wrapper');
  const fallback = document.getElementById('instagram-fallback');

  function showFallback() {
    fallback.style.display = 'flex';
    console.log('[IG Debug] Fallback shown — iframe did NOT load.');
  }

  function hideFallback() {
    fallback.style.display = 'none';
    console.log('[IG Debug] Embed iframe loaded — fallback hidden.');
  }

  function hasIframe() {
    const ifr = wrapper.querySelector('iframe');
    console.log('[IG Debug] Checking iframe:', ifr);
    return !!ifr;
  }

  function callProcess() {
    if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
      console.log('[IG Debug] Calling instgrm.Embeds.process()');
      window.instgrm.Embeds.process();
    } else {
      console.log('[IG Debug] instgrm.Embeds.process() not ready yet');
    }
  }

  function loadInstagram() {
    if (!document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
      console.log('[IG Debug] Adding Instagram embed.js script');
      const s = document.createElement('script');
      // s.src = "//www.instagram.com/embed.js";
      s.src = "https://www.instagram.com/embed.js";

      s.async = true;
      s.defer = true;
      s.onload = () => {
        console.log('[IG Debug] Instagram script loaded');
        callProcess();
      };
      s.onerror = () => {
        console.log('[IG Debug] Failed to load Instagram script');
        showFallback();
      };
      document.head.appendChild(s);
    } else {
      console.log('[IG Debug] Instagram script already present');
      callProcess();
    }

    // تحقق بعد ثانيتين
    setTimeout(() => {
      if (hasIframe()) {
        hideFallback();
      } else {
        showFallback();
      }
    }, 2000);
  }

  loadInstagram();
});
