// document.addEventListener("DOMContentLoaded", async function () {

//   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";
//   // 👆 حط هون رابطك

//   try {
//     const response = await fetch(GOOGLE_SCRIPT_URL);
//     const data = await response.json();

//     if (!data || !data.length) {
//       console.error("No data found in sheet");
//       return;
//     }

//     // بياخد أول صف
//     const instagramLink = data[0]["ig-link"];

//     if (!instagramLink) {
//       console.error("Column 'ig-link' not found");
//       return;
//     }

//     // غيّر permalink
//     const blockquote = document.querySelector(".instagram-media");
//     if (blockquote) {
//       blockquote.setAttribute("data-instgrm-permalink", instagramLink);
//     }

//     // غيّر كل الروابط داخل الكارد
//     document.querySelectorAll(".instagram-card a").forEach(a => {
//       a.href = instagramLink;
//     });

//     // إعادة تحميل Instagram embed
//     if (window.instgrm) {
//       window.instgrm.Embeds.process();
//     }

//     console.log("Instagram link loaded from Google Sheet ✅");

//   } catch (error) {
//     console.error("Error loading sheet:", error);
//   }

// });





























































// document.addEventListener("DOMContentLoaded", async function () {

//   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";

//   try {

//     // منع الكاش
//     const response = await fetch(GOOGLE_SCRIPT_URL + "?nocache=" + Date.now());
//     const data = await response.json();

//     console.log("Full response from sheet:", data);

//     if (!data || !data.length) {
//       console.error("No data found in sheet");
//       return;
//     }

//     const instagramLink = data[0]["ig-link"];

//     console.log("Instagram link from sheet:", instagramLink);

//     if (!instagramLink) {
//       console.error("Column 'ig-link' not found");
//       return;
//     }

//     const wrapper = document.querySelector("#instagram-wrapper");

//     if (!wrapper) {
//       console.error("Instagram wrapper not found");
//       return;
//     }

//     // حذف المحتوى القديم بالكامل
//     wrapper.innerHTML = "";

//     // إنشاء embed جديد
//     const blockquote = document.createElement("blockquote");
//     blockquote.className = "instagram-media";
//     blockquote.setAttribute("data-instgrm-permalink", instagramLink);
//     blockquote.setAttribute("data-instgrm-version", "14");
//     blockquote.style.margin = "0 auto";
//     blockquote.style.width = "100%";
//     blockquote.style.maxWidth = "540px";

//     wrapper.appendChild(blockquote);

//     // إعادة تحميل Instagram embed
//     if (window.instgrm) {
//       window.instgrm.Embeds.process();
//     }

//     console.log("Instagram post refreshed successfully ✅");

//   } catch (error) {
//     console.error("Error loading sheet:", error);
//   }

// });










































//best v
// document.addEventListener("DOMContentLoaded", async function () {

//   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";

//   try {

//     // منع الكاش
//     const response = await fetch(GOOGLE_SCRIPT_URL + "?nocache=" + Date.now());
//     const data = await response.json();

//     console.log("Full response from sheet:", data);

//     if (!data || !data.length) {
//       console.error("No data found in sheet");
//       return;
//     }

//     const instagramLink = data[0]["ig-link"];

//     console.log("Instagram link from sheet:", instagramLink);

//     if (!instagramLink) {
//       console.error("Column 'ig-link' not found");
//       return;
//     }

//     const wrapper = document.querySelector("#instagram-wrapper");

//     if (!wrapper) {
//       console.error("Instagram wrapper not found");
//       return;
//     }

//     // حذف المحتوى القديم بالكامل
//     wrapper.innerHTML = "";

//     // إنشاء embed جديد
//     const blockquote = document.createElement("blockquote");
//     blockquote.className = "instagram-media";
//     blockquote.setAttribute("data-instgrm-permalink", instagramLink);
//     blockquote.setAttribute("data-instgrm-version", "14");
//     blockquote.style.margin = "0 auto";
//     blockquote.style.width = "100%";
//     blockquote.style.maxWidth = "540px";

//     wrapper.appendChild(blockquote);

//     // إعادة تحميل Instagram embed
//     if (window.instgrm) {
//       window.instgrm.Embeds.process();
//     }

//     console.log("Instagram post refreshed successfully ✅");

//   } catch (error) {
//     console.error("Error loading sheet:", error);
//   }

// });



































// //mni7
// document.addEventListener("DOMContentLoaded", async function () {

//   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";

//   const wrapper = document.getElementById("social-wrapper");
//   if (!wrapper) return console.error("Social wrapper not found");

//   // Loading
//   wrapper.innerHTML = "<p>Loading social post...</p>";

//   try {
//     const response = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now());
//     const data = await response.json();

//     console.log("Full sheet response:", data);

//     if (!data || !data.length) throw new Error("No data returned from sheet");

//     const row = data[0]; // أول صف
//     const linkedinLink = row["linkedin-link"];
//     const instagramLink = row["ig-link"];

//     wrapper.innerHTML = ""; // تنظيف المحتوى القديم

//     if (linkedinLink) {
//       // LinkedIn post
//       const script = document.createElement("script");
//       script.type = "IN/Share";
//       script.setAttribute("data-url", linkedinLink);
//       wrapper.appendChild(script);

//       if (window.IN && window.IN.parse) {
//         window.IN.parse(wrapper);
//       }

//       console.log("LinkedIn post displayed ✅", linkedinLink);
//     } else if (instagramLink) {
//       // Instagram post
//       const blockquote = document.createElement("blockquote");
//       blockquote.className = "instagram-media";
//       blockquote.setAttribute("data-instgrm-permalink", instagramLink);
//       blockquote.setAttribute("data-instgrm-version", "14");
//       blockquote.style.margin = "0 auto";
//       blockquote.style.width = "100%";
//       blockquote.style.maxWidth = "540px";

//       const link = document.createElement("a");
//       link.href = instagramLink;
//       link.target = "_blank";
//       link.rel = "noopener noreferrer";
//       link.textContent = "View on Instagram";

//       blockquote.appendChild(link);
//       wrapper.appendChild(blockquote);

//       if (window.instgrm && window.instgrm.Embeds) {
//         window.instgrm.Embeds.process();
//       }

//       console.log("Instagram post displayed ✅", instagramLink);
//     } else {
//       wrapper.innerHTML = "<p>No social link available.</p>";
//       console.warn("No linkedin-link or ig-link found in sheet");
//     }

//   } catch (error) {
//     console.error("Error loading social post:", error);
//     wrapper.innerHTML = `
//       <p>Failed to load social post.</p>
//       <a href="#" target="_blank">Try again later</a>
//     `;
//   }

// });


























































































































document.addEventListener("DOMContentLoaded", async function () {

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";
  const wrapper = document.getElementById("social-wrapper");
  if (!wrapper) return console.error("Social wrapper not found");

  wrapper.innerHTML = "<p>Loading social post...</p>";

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now());
    const data = await res.json();
    console.log("Sheet response:", data);
    if (!data || !data.length) throw new Error("No data");

    const row = data[0];
    const linkedinLink = (row["linkedin-link"] || "").toString().trim();
    const instagramLink = (row["ig-link"] || "").toString().trim();

    wrapper.innerHTML = "";

    // small helper: create iframe
    function insertIframe(src, width = "504", height = "1027") {
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.width = width;
      iframe.height = height;
      iframe.frameBorder = "0";
      iframe.allowFullscreen = true;
      iframe.title = "Embedded post";
      wrapper.appendChild(iframe);
      console.log("Inserted iframe src:", src);
      return iframe;
    }

    // detect if linkedinLink is already an embed src or contains URN
    if (linkedinLink) {
      // 1) if it's already an embed/feed URL (contains '/embed/feed/')
      if (linkedinLink.includes("/embed/feed/")) {
        insertIframe(linkedinLink);
        console.log("Used direct LinkedIn embed URL (iframe).");
        return;
      }

      // 2) if it contains a URN like 'urn:li:ugcPost:7421578241863467008'
      const urnMatch = linkedinLink.match(/urn:li:[^\s/]+:[0-9]+/);
      if (urnMatch) {
        const urn = urnMatch[0];
        const embedSrc = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urn);
        insertIframe(embedSrc);
        console.log("Built iframe from URN and inserted.");
        return;
      }

      // 3) fallback: use IN/Share (works for normal public post URLs)
      const script = document.createElement("script");
      script.type = "IN/Share";
      script.setAttribute("data-url", linkedinLink);
      wrapper.appendChild(script);

      // try parse if platform script already loaded
      if (window.IN && typeof window.IN.parse === "function") {
        window.IN.parse(wrapper);
        console.log("Used IN.parse() for LinkedIn share.");
      } else {
        console.log("LinkedIn platform script not ready; ensure <script src=\"https://platform.linkedin.com/in.js\"> is on the page.");
      }

      // optional: watch for success (iframe or generated nodes)
      waitForNode(wrapper, 5000).then(ok => {
        if (ok) console.log("LinkedIn embed loaded (via IN.parse).");
        else console.warn("LinkedIn embed did not appear within timeout.");
      });

      return;
    }

    // if no linkedinLink, try Instagram
    if (instagramLink) {
      const blockquote = document.createElement("blockquote");
      blockquote.className = "instagram-media";
      blockquote.setAttribute("data-instgrm-permalink", instagramLink);
      blockquote.setAttribute("data-instgrm-version", "14");
      blockquote.style.margin = "0 auto";
      blockquote.style.width = "100%";
      blockquote.style.maxWidth = "540px";

      const a = document.createElement("a");
      a.href = instagramLink;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "View on Instagram";
      blockquote.appendChild(a);
      wrapper.appendChild(blockquote);

      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
        window.instgrm.Embeds.process();
      } else {
        // try load script if missing
        if (!Array.from(document.scripts).some(s => s.src.includes("instagram.com/embed.js"))) {
          const s = document.createElement("script");
          s.src = "https://www.instagram.com/embed.js";
          s.async = true;
          s.onload = () => window.instgrm && window.instgrm.Embeds && window.instgrm.Embeds.process && window.instgrm.Embeds.process();
          document.head.appendChild(s);
        }
      }

      console.log("Instagram embed inserted.");
      return;
    }

    // nothing found
    wrapper.innerHTML = "<p>No social link available.</p>";
    console.warn("No linkedin-link or ig-link in sheet.");

  } catch (err) {
    console.error("Error loading social post:", err);
    wrapper.innerHTML = `<p>Failed to load social post.</p>`;
  }

  // helper to watch for nodes added (used to detect LinkedIn result)
  function waitForNode(root, timeout = 5000) {
    return new Promise(resolve => {
      const obs = new MutationObserver((mutations, o) => {
        if (root.querySelector("iframe") || root.children.length > 0) {
          o.disconnect();
          resolve(true);
        }
      });
      obs.observe(root, { childList: true, subtree: true });
      setTimeout(() => {
        try { obs.disconnect(); } catch(e){}
        resolve(Boolean(root.querySelector("iframe") || root.children.length > 0));
      }, timeout);
    });
  }

});
