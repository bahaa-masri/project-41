document.addEventListener('DOMContentLoaded', function () {
  const wrapper = document.getElementById('instagram-embed-wrapper');
  const fallback = document.getElementById('instagram-fallback');
  const INSTAGRAM_SCRIPT_SRC = '//www.instagram.com/embed.js';
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1500; // بين محاولتين
  const FINAL_TIMEOUT_MS = 4000; // انتظار نهائي قبل إظهار الفالباك
  let attempts = 0;
  let observer;
  let timeoutId;

  function log(...args) {
    if (window.console) console.log('[IG-Embed]', ...args);
  }

  function showFallback() {
    if (!fallback) return;
    fallback.style.display = 'flex';
    fallback.setAttribute('aria-hidden', 'false');
  }

  function hideFallback() {
    if (!fallback) return;
    fallback.style.display = 'none';
    fallback.setAttribute('aria-hidden', 'true');
  }

  function hasInstagramIframe() {
    return !!wrapper.querySelector('iframe');
  }

  function callInstagramProcessIfAvailable() {
    try {
      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
        window.instgrm.Embeds.process();
        log('Called instgrm.Embeds.process()');
      } else {
        log('instgrm.Embeds.process not available yet');
      }
    } catch (e) {
      console.warn('[IG-Embed] process error', e);
    }
  }

  function loadInstagramScript(callback) {
    // لو السكربت موجود لا نعيد تحميله
    if (document.querySelector('script[src="' + INSTAGRAM_SCRIPT_SRC + '"]') ||
        document.querySelector('script[src="https:' + INSTAGRAM_SCRIPT_SRC + '"]') ||
        document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
      log('instagram script already present');
      callback && callback();
      return;
    }

    const s = document.createElement('script');
    s.src = INSTAGRAM_SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = function () {
      log('instagram script loaded (onload)');
      callback && callback();
    };
    s.onerror = function (ev) {
      log('instagram script failed to load', ev);
      callback && callback(new Error('failed to load instagram script'));
    };
    document.head.appendChild(s);
  }

  function startObserver() {
    if (!window.MutationObserver) return;
    observer = new MutationObserver(function (mutations) {
      if (hasInstagramIframe()) {
        log('iframe detected via MutationObserver');
        hideFallback();
        clearTimeout(timeoutId);
        if (observer) observer.disconnect();
      }
    });

    observer.observe(wrapper, { childList: true, subtree: true });
  }

  function tryProcessEmbed() {
    attempts++;
    log('tryProcessEmbed attempt', attempts);
    callInstagramProcessIfAvailable();

    // إذا ظهر iframe نوقف
    if (hasInstagramIframe()) {
      log('iframe already present');
      hideFallback();
      return;
    }

    // إذا لم يظهر بعد محاولات، نعيد تحميل السكربت (مرة ثانية) كخيار
    if (attempts <= MAX_RETRIES) {
      setTimeout(function () {
        // محاولة ثانية: نعيد طلب الـ process ثم نتحقق مجدداً
        callInstagramProcessIfAvailable();
        // لو ما صار بعد delay آخر ومرّنا كل المحاولات، نظهر الفالباك
      }, RETRY_DELAY_MS);
    }
  }

  function run() {
    hideFallback();
    startObserver();

    // timeout نهائي: لو بعد FINAL_TIMEOUT_MS ما صار iframe نعرض الفالباك
    timeoutId = setTimeout(function () {
      if (!hasInstagramIframe()) {
        log('final timeout reached — showing fallback');
        showFallback();
        if (observer) observer.disconnect();
      }
    }, FINAL_TIMEOUT_MS);

    loadInstagramScript(function (err) {
      if (err) log('loadInstagramScript reported error', err);
      // بعد التحميل نعطي السكربت وقت لعمل render ثم نحاول
      setTimeout(function () {
        tryProcessEmbed();

        // نكرر محاولة إضافية بعد شوية لو ما صار
        setTimeout(function () {
          if (!hasInstagramIframe()) {
            callInstagramProcessIfAvailable();
          }
        }, RETRY_DELAY_MS);
      }, 600); // انتظار بسيط بعد التحميل
    });
  }

  // زر داخل الفالباك لإعادة المحاولة (لو بدك تضيفه داخل HTML)
  const igRetryBtn = document.getElementById('ig-retry-btn');
  if (igRetryBtn) {
    igRetryBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // أعرض رسالة قصيرة ثم أعد المحاولة
      hideFallback();
      // أعد تحميل السكربت بإزالة القديم (إذا موجود) لإجبار المتصفح على محاولة جديدة
      const existing = document.querySelector('script[src="' + INSTAGRAM_SCRIPT_SRC + '"]');
      if (existing) existing.remove();
      attempts = 0;
      run();
    });
  }

  // رابط الفالباك: لو حاب تغيّر برمجياً
  const igLink = document.getElementById('ig-open-link');
  if (igLink) {
    // igLink.href = 'https://www.instagram.com/reel/DJ_wN1vswCo/';
  }

  // أخيراً، شغّل العملية
  run();
});
