document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('instagram-wrapper');
  const fallback = document.getElementById('instagram-fallback');

  if (!wrapper || !fallback) return;

  function showFallback() {
    fallback.style.display = 'flex';
    console.log('[IG Debug] Fallback shown — iframe did NOT load.');
  }

  function hideFallback() {
    fallback.style.display = 'none';
    console.log('[IG Debug] Embed iframe loaded — fallback hidden.');
  }

  function callProcess() {
    if (window.instgrm &&
        window.instgrm.Embeds &&
        typeof window.instgrm.Embeds.process === 'function') {

      console.log('[IG Debug] Calling instgrm.Embeds.process()');
      window.instgrm.Embeds.process();
      watchForIframe(); // نبدأ المراقبة بعد المعالجة
    } else {
      console.log('[IG Debug] instgrm not ready yet');
      showFallback();
    }
  }

  function watchForIframe() {
    const observer = new MutationObserver((mutations, obs) => {
      if (wrapper.querySelector('iframe')) {
        console.log('[IG Debug] iframe detected');
        hideFallback();
        obs.disconnect();
      }
    });

    observer.observe(wrapper, { childList: true, subtree: true });

    // fallback بعد 5 ثواني إذا ما انضاف iframe
    setTimeout(() => {
      if (!wrapper.querySelector('iframe')) {
        observer.disconnect();
        showFallback();
      }
    }, 5000);
  }

  function loadInstagram() {
    const existing = Array.from(document.scripts)
      .some(s => s.src.includes('instagram.com/embed.js'));

    if (!existing) {
      console.log('[IG Debug] Adding Instagram embed.js script');

      const s = document.createElement('script');
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;

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
      console.log('[IG Debug] Script already exists');
      callProcess();
    }
  }

  loadInstagram();
});
