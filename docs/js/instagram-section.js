
document.addEventListener('DOMContentLoaded', function () {
  const wrapper = document.getElementById('instagram-embed-wrapper');
  const fallback = document.getElementById('instagram-fallback');

  const INSTAGRAM_SCRIPT_SRC = 'https://www.instagram.com/embed.js';
  const CHECK_TIMEOUT_MS = 1600; // وقت الانتظار قبل فحص الiframe (يمكن تخصيصه)

  function showFallback() {
    if (fallback) {
      fallback.style.display = 'flex';
      fallback.setAttribute('aria-hidden', 'false');
    }
  }

  function hideFallback() {
    if (fallback) {
      fallback.style.display = 'none';
      fallback.setAttribute('aria-hidden', 'true');
    }
  }

  function hasInstagramIframe() {
    // تأكد إن في iframe داخل ال-wrapper (هذا مؤشر أن السكربت نجح)
    return !!wrapper.querySelector('iframe');
  }

  function callInstagramProcessIfAvailable() {
    try {
      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
        // تطلب من السكربت معالجة الـ blockquote
        window.instgrm.Embeds.process();
      }
    } catch (e) {
      // ignore
    }
  }

  function loadInstagramScript(onLoaded) {
    // لو السكربت موجود لا نعيد تحميله
    if (document.querySelector('script[src="' + INSTAGRAM_SCRIPT_SRC + '"]')) {
      onLoaded();
      return;
    }

    const s = document.createElement('script');
    s.src = INSTAGRAM_SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = function () {
      // بعد التحميل اطلب منه معالجة الـ embeds
      callInstagramProcessIfAvailable();
      onLoaded();
    };
    s.onerror = function () {
      onLoaded(new Error('failed to load instagram script'));
    };
    document.head.appendChild(s);
  }

  // نفّذ التحميل/المعالجة ثم افحص إنو ظهر iframe
  loadInstagramScript(function (err) {
    // لنجاح أفضل، ننتظر شوية بعد التحميل لحتى السكربت يخلق الiframe
    setTimeout(function () {
      callInstagramProcessIfAvailable();
      if (!hasInstagramIframe()) {
        // إذا بعد المهلة ما ظهر iframe نعرض fallback
        showFallback();
      } else {
        hideFallback();
      }
    }, CHECK_TIMEOUT_MS);
  });

  // زر fallback link (لو حبيت تغير الرابط برمجياً)
  const igLink = document.getElementById('ig-open-link');
  if (igLink) {
    // لو بدك تحط رابط جديد حط هنا:
    // igLink.href = 'https://www.instagram.com/reel/NEW_ID/';
  }

  // — اختياري: لو تحب تتأكد من حالة الشبكة أو إعادة المحاولة عند فشل:
  // يمكنك إضافة زر "إعادة المحاولة" ليعيد تحميل السكربت ويخفي الفالباك ثم يعيد الفحص.
});
