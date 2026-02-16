// document.addEventListener("DOMContentLoaded", async function () {

//   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";
//   const wrapper = document.getElementById("social-wrapper");
//   if (!wrapper) return console.error("Social wrapper not found");

//   wrapper.innerHTML = "<p>Loading social post...</p>";

//   try {
//     const res = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now());
//     const data = await res.json();
//     console.log("Sheet response:", data);
//     if (!data || !data.length) throw new Error("No data returned from sheet");

//     const row = data[0];
//     let linkedinLink = (row["linkedin-link"] || "").toString().trim();
//     const instagramLink = (row["ig-link"] || "").toString().trim();

//     wrapper.innerHTML = "";

//     // helper to insert iframe element node
//     function insertIframeNode(iframeNode) {
//       const node = document.importNode(iframeNode, true);
//       // set some safe defaults if missing
//       if (!node.getAttribute("title")) node.setAttribute("title", "Embedded post");
//       wrapper.appendChild(node);
//       console.log("Inserted iframe node:", node);
//       return node;
//     }

//     // helper to create iframe from src
//     function createAndInsertIframe(src, width = "504", height = "1027") {
//       const iframe = document.createElement("iframe");
//       iframe.src = src;
//       iframe.width = width;
//       iframe.height = height;
//       iframe.frameBorder = "0";
//       iframe.allowFullscreen = true;
//       iframe.title = "Embedded post";
//       wrapper.appendChild(iframe);
//       console.log("Iframe inserted (from src):", src);
//       return iframe;
//     }

//     // helper to watch for nodes added
//     function waitForNode(root, timeout = 5000) {
//       return new Promise(resolve => {
//         const obs = new MutationObserver((mutations, o) => {
//           if (root.querySelector("iframe") || root.children.length > 0) {
//             o.disconnect();
//             resolve(true);
//           }
//         });
//         obs.observe(root, { childList: true, subtree: true });
//         setTimeout(() => {
//           try { obs.disconnect(); } catch(e){}
//           resolve(Boolean(root.querySelector("iframe") || root.children.length > 0));
//         }, timeout);
//       });
//     }

//     // -------- LinkedIn logic --------
//     if (linkedinLink) {

//       // --- 0) if the cell contains a full <iframe> tag, parse and insert it directly
//       if (linkedinLink.toLowerCase().includes("<iframe")) {
//         try {
//           const parser = new DOMParser();
//           const doc = parser.parseFromString(linkedinLink, "text/html");
//           const iframeEl = doc.querySelector("iframe");
//           if (iframeEl) {
//             insertIframeNode(iframeEl);
//             console.log("Inserted LinkedIn iframe from raw HTML found in sheet.");
//             return;
//           } else {
//             console.warn("No iframe element found inside provided HTML string; falling back to normal parsing.");
//           }
//         } catch (e) {
//           console.warn("Failed to parse iframe HTML from sheet:", e);
//         }
//       }

//       let finalLink = "";

//       // 1) direct embed URL
//       if (linkedinLink.includes("/embed/feed/")) {
//         finalLink = linkedinLink;

//       } else {
//         // 2) check if URN exists
//         const urnMatch = linkedinLink.match(/urn:li:[^\s/]+:[0-9]+/);
//         if (urnMatch) {
//           finalLink = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urnMatch[0]);

//         } else if (/^\d+$/.test(linkedinLink)) {
//           // 3) just a number -> convert to URN
//           const urn = "urn:li:ugcPost:" + linkedinLink;
//           finalLink = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urn);

//         } else {
//           // fallback: treat as public post URL -> use IN/Share
//           const script = document.createElement("script");
//           script.type = "IN/Share";
//           script.setAttribute("data-url", linkedinLink);
//           wrapper.appendChild(script);

//           if (window.IN && typeof window.IN.parse === "function") {
//             window.IN.parse(wrapper);
//             console.log("Used IN.parse() for LinkedIn share.");
//           } else {
//             console.log("LinkedIn platform script not ready; ensure <script src=\"https://platform.linkedin.com/in.js\"> is on the page.");
//           }

//           waitForNode(wrapper, 5000).then(ok => {
//             if (ok) console.log("LinkedIn embed loaded (via IN.parse).");
//             else console.warn("LinkedIn embed did not appear within timeout.");
//           });

//           return;
//         }
//       }

//       // insert iframe for direct/embed/URN cases
//       if (finalLink) {
//         createAndInsertIframe(finalLink);
//         console.log("LinkedIn iframe inserted ✅", finalLink);
//       }

//       return;
//     }

//     // -------- Instagram fallback --------
//     if (instagramLink) {
//       const blockquote = document.createElement("blockquote");
//       blockquote.className = "instagram-media";
//       blockquote.setAttribute("data-instgrm-permalink", instagramLink);
//       blockquote.setAttribute("data-instgrm-version", "14");
//       blockquote.style.margin = "0 auto";
//       blockquote.style.width = "100%";
//       blockquote.style.maxWidth = "540px";

//       const a = document.createElement("a");
//       a.href = instagramLink;
//       a.target = "_blank";
//       a.rel = "noopener noreferrer";
//       a.textContent = "View on Instagram";
//       blockquote.appendChild(a);
//       wrapper.appendChild(blockquote);

//       if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
//         window.instgrm.Embeds.process();
//       } else {
//         // load Instagram embed.js if missing
//         if (!Array.from(document.scripts).some(s => s.src.includes("instagram.com/embed.js"))) {
//           const s = document.createElement("script");
//           s.src = "https://www.instagram.com/embed.js";
//           s.async = true;
//           s.onload = () => window.instgrm && window.instgrm.Embeds && window.instgrm.Embeds.process && window.instgrm.Embeds.process();
//           document.head.appendChild(s);
//         }
//       }

//       console.log("Instagram embed inserted.");
//       return;
//     }

//     // nothing found
//     wrapper.innerHTML = "<p>No social link available.</p>";
//     console.warn("No linkedin-link or ig-link in sheet.");

//   } catch (err) {
//     console.error("Error loading social post:", err);
//     wrapper.innerHTML = `<p>Failed to load social post.</p>`;
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
    if (!data || !data.length) throw new Error("No data returned from sheet");

    const row = data[0];
    let linkedinLink = (row["linkedin-link"] || "").toString().trim();
    const instagramLink = (row["ig-link"] || "").toString().trim();

    wrapper.innerHTML = "";

    // helper to create a scrollable embed container
    function wrapEmbed(element) {
      const container = document.createElement("div");
      container.className = "embed-container";
      container.appendChild(element);
      wrapper.appendChild(container);
      return container;
    }

    // helper to insert iframe node from raw HTML
    function insertIframeNode(iframeNode) {
      const node = document.importNode(iframeNode, true);
      if (!node.getAttribute("title")) node.setAttribute("title", "Embedded post");
      return wrapEmbed(node);
    }

    // helper to create iframe from src
    function createAndInsertIframe(src, width = "100%", height = "600") {
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.width = width;
      iframe.height = height;
      iframe.frameBorder = "0";
      iframe.allowFullscreen = true;
      iframe.title = "Embedded post";
      return wrapEmbed(iframe);
    }

    // helper to watch for nodes added (LinkedIn fallback)
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

    // -------- LinkedIn logic --------
    if (linkedinLink) {

      // 0) If the cell contains a full <iframe> tag
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
        // 2) check for URN
        const urnMatch = linkedinLink.match(/urn:li:[^\s/]+:[0-9]+/);
        if (urnMatch) {
          finalLink = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urnMatch[0]);

        } else if (/^\d+$/.test(linkedinLink)) {
          // 3) just a number
          const urn = "urn:li:ugcPost:" + linkedinLink;
          finalLink = "https://www.linkedin.com/embed/feed/update/" + encodeURIComponent(urn);

        } else {
          // 4) fallback: public post URL -> IN/Share
          const script = document.createElement("script");
          script.type = "IN/Share";
          script.setAttribute("data-url", linkedinLink);
          wrapper.appendChild(script);

          if (window.IN && typeof window.IN.parse === "function") {
            window.IN.parse(wrapper);
            console.log("Used IN.parse() for LinkedIn share.");
          } else {
            console.log("LinkedIn platform script not ready; ensure <script src=\"https://platform.linkedin.com/in.js\"> is on the page.");
          }

          waitForNode(wrapper, 5000).then(ok => {
            if (ok) console.log("LinkedIn embed loaded (via IN.parse).");
            else console.warn("LinkedIn embed did not appear within timeout.");
          });

          return;
        }
      }

      if (finalLink) {
        createAndInsertIframe(finalLink);
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
      blockquote.style.maxWidth = "540px";

      const a = document.createElement("a");
      a.href = instagramLink;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "View on Instagram";
      blockquote.appendChild(a);

      wrapEmbed(blockquote);

      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
        window.instgrm.Embeds.process();
      } else if (!Array.from(document.scripts).some(s => s.src.includes("instagram.com/embed.js"))) {
        const s = document.createElement("script");
        s.src = "https://www.instagram.com/embed.js";
        s.async = true;
        s.onload = () => window.instgrm && window.instgrm.Embeds && window.instgrm.Embeds.process && window.instgrm.Embeds.process();
        document.head.appendChild(s);
      }

      console.log("Instagram embed inserted.");
      return;
    }

    wrapper.innerHTML = "<p>No social link available.</p>";
    console.warn("No linkedin-link or ig-link in sheet.");

  } catch (err) {
    console.error("Error loading social post:", err);
    wrapper.innerHTML = `<p>Failed to load social post.</p>`;
  }

});
