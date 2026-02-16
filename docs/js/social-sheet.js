document.addEventListener("DOMContentLoaded", async function () {

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";
  const wrapper = document.getElementById("social-wrapper");
  if (!wrapper) return console.error("Social wrapper not found");

  // INSERT NEW LOADER MARKUP (dots + skeleton)
  wrapper.innerHTML = `
    <div class="social-loading" aria-live="polite" aria-busy="true">
      <div class="loader-dots" aria-hidden="true">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <div class="skeleton" aria-hidden="true">
        <div class="line long"></div>
        <div class="line mid"></div>
        <div class="line short"></div>
      </div>
      <div class="loading-text visually-hidden">Loading social post</div>
    </div>`;

  // small helper: wrap any node into a scrollable responsive container
  function wrapEmbed(element) {
    const container = document.createElement("div");
    container.className = "embed-container";
    container.appendChild(element);
    wrapper.appendChild(container);
    return container;
  }

  // insert an iframe node (import if provided as HTML node)
  function insertIframeNode(iframeNode) {
    const node = document.importNode(iframeNode, true);
    if (!node.getAttribute("title")) node.setAttribute("title", "Embedded post");
    return wrapEmbed(node);
  }

  // create iframe from src - responsive: width 100%, adaptive height default 600
  function createAndInsertIframe(src, height = 600) {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = "100%";
    iframe.height = String(height);
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.title = "Embedded post";
    // allow transparency & remove extra margin
    iframe.style.display = "block";
    iframe.style.maxWidth = "640px";
    iframe.style.width = "100%";
    return wrapEmbed(iframe);
  }

  // fallback watcher (for platform scripts like LinkedIn/Instagram that inject nodes)
  function waitForNode(root, timeout = 5000) {
    return new Promise(resolve => {
      const obs = new MutationObserver((mutations, o) => {
        if (root.querySelector("iframe") || root.querySelector(".instagram-media") || root.children.length > 0) {
          o.disconnect();
          resolve(true);
        }
      });
      obs.observe(root, { childList: true, subtree: true });
      setTimeout(() => {
        try { obs.disconnect(); } catch (e) {}
        resolve(Boolean(root.querySelector("iframe") || root.querySelector(".instagram-media") || root.children.length > 0));
      }, timeout);
    });
  }

  // MAIN fetch + insert flow
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now());
    const data = await res.json();
    // console.log("Sheet response:", data);
    if (!data || !data.length) throw new Error("No data returned from sheet");

    const row = data[0];
    let linkedinLink = (row["linkedin-link"] || "").toString().trim();
    const instagramLink = (row["ig-link"] || "").toString().trim();

    // clear loader before inserting real content
    wrapper.innerHTML = "";

    // -------- LinkedIn logic --------
    if (linkedinLink) {

      // 0) if the cell contains a full <iframe> tag, parse + insert
      if (linkedinLink.toLowerCase().includes("<iframe")) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(linkedinLink, "text/html");
          const iframeEl = doc.querySelector("iframe");
          if (iframeEl) {
            insertIframeNode(iframeEl);
            console.log("Inserted LinkedIn iframe from raw HTML.");
            return;
          }
        } catch (e) {
          console.warn("Failed to parse iframe HTML:", e);
        }
      }

      let finalLink = "";

      // 1) direct embed URL
      if (linkedinLink.includes("/embed/feed/")) {
        finalLink = linkedinLink;

      } else {
        // 2) check for URN-like string
        const urnMatch = linkedinLink.match(/urn:li:[^\s/]+:[0-9]+/);
        if (urnMatch) {
          finalLink = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urnMatch[0]);

        } else if (/^\d+$/.test(linkedinLink)) {
          // 3) just a numeric id -> convert to URN
          const urn = "urn:li:ugcPost:" + linkedinLink;
          finalLink = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urn);

        } else {
          // 4) fallback: treat as public URL -> use IN/Share script (platform parser)
          const script = document.createElement("script");
          script.type = "IN/Share";
          script.setAttribute("data-url", linkedinLink);
          wrapper.appendChild(script);

          if (window.IN && typeof window.IN.parse === "function") {
            window.IN.parse(wrapper);
            console.log("Used IN.parse() for LinkedIn share.");
          } else {
            // ensure dev knows platform script is recommended
            console.log("LinkedIn platform script not ready. Ensure <script src=\"https://platform.linkedin.com/in.js\"></script> exists on the page.");
          }

          // wait a bit for platform to inject node
          const ok = await waitForNode(wrapper, 6000);
          if (!ok) console.warn("LinkedIn embed did not appear within timeout.");
          return;
        }
      }

      // if we have a direct embed URL or generated URN url
      if (finalLink) {
        createAndInsertIframe(finalLink, 640);
        console.log("LinkedIn iframe inserted ✅", finalLink);
      }
      return;
    }

    // -------- Instagram fallback --------
    if (instagramLink) {
      const blockquote = document.createElement("blockquote");
      blockquote.className = "instagram-media";
      blockquote.setAttribute("data-instgrm-permalink", instagramLink);
      blockquote.setAttribute("data-instgrm-version", "14");
      blockquote.style.margin = "0 auto";
      blockquote.style.width = "100%";
      blockquote.style.maxWidth = "640px";

      const a = document.createElement("a");
      a.href = instagramLink;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      // a.textContent = "View on Instagram";
      a.textContent = "";
      blockquote.appendChild(a);

      wrapEmbed(blockquote);

      // ask Instagram platform to render if available, otherwise load it
      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
        window.instgrm.Embeds.process();
      } else if (!Array.from(document.scripts).some(s => s.src && s.src.includes("instagram.com/embed.js"))) {
        const s = document.createElement("script");
        s.src = "https://www.instagram.com/embed.js";
        s.async = true;
        s.onload = () => window.instgrm && window.instgrm.Embeds && window.instgrm.Embeds.process && window.instgrm.Embeds.process();
        document.head.appendChild(s);
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

});


