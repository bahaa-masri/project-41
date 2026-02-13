document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('instagram-wrapper');
  const fallback = document.getElementById('instagram-fallback');

  function showFallback() {
    fallback.style.display = 'flex';
  }

  function hideFallback() {
    fallback.style.display = 'none';
  }

  function hasIframe() {
    return !!wrapper.querySelector('iframe');
  }

  function loadInstagram() {
    // تحقق إن السكربت غير موجود بالفعل
    if (!document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
      const s = document.createElement('script');
      s.src = "//www.instagram.com/embed.js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    // بعد ثواني تحقق إذا ظهر iframe
    setTimeout(() => {
      if (hasIframe()) {
        hideFallback();
      } else {
        showFallback();
      }
    }, 2000); // 2 ثواني انتظار
  }

  loadInstagram();
});
