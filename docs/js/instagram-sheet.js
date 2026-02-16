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











































document.addEventListener("DOMContentLoaded", async function () {

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec";

  try {

    // منع الكاش
    const response = await fetch(GOOGLE_SCRIPT_URL + "?nocache=" + Date.now());
    const data = await response.json();

    console.log("Full response from sheet:", data);

    if (!data || !data.length) {
      console.error("No data found in sheet");
      return;
    }

    const instagramLink = data[0]["ig-link"];

    console.log("Instagram link from sheet:", instagramLink);

    if (!instagramLink) {
      console.error("Column 'ig-link' not found");
      return;
    }

    const wrapper = document.querySelector("#instagram-wrapper");

    if (!wrapper) {
      console.error("Instagram wrapper not found");
      return;
    }

    // حذف المحتوى القديم بالكامل
    wrapper.innerHTML = "";

    // إنشاء embed جديد
    const blockquote = document.createElement("blockquote");
    blockquote.className = "instagram-media";
    blockquote.setAttribute("data-instgrm-permalink", instagramLink);
    blockquote.setAttribute("data-instgrm-version", "14");
    blockquote.style.margin = "0 auto";
    blockquote.style.width = "100%";
    blockquote.style.maxWidth = "540px";

    wrapper.appendChild(blockquote);

    // إعادة تحميل Instagram embed
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

    console.log("Instagram post refreshed successfully ✅");

  } catch (error) {
    console.error("Error loading sheet:", error);
  }

});
