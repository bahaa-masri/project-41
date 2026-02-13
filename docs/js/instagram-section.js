(function(){
      const wrapper = document.getElementById('instagram-wrapper');
      const fallback = document.getElementById('instagram-fallback');
      const instaScriptUrl = 'https://www.instagram.com/embed.js';

      function showFallback(){
        fallback.style.display = 'flex';
      }

      // insert script
      try{
        const s = document.createElement('script');
        s.src = instaScriptUrl;
        s.async = true;
        s.onload = function(){
          // The script replaces blockquote with iframe; give it a moment
          setTimeout(()=>{
            const iframe = wrapper.querySelector('iframe');
            if(!iframe) showFallback();
            else {
              fallback.style.display = 'none';
              // make sure iframe fills container
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.border = '0';
            }
          },500);
        };
        s.onerror = showFallback;
        document.body.appendChild(s);

        // safety: if not loaded within 2.2s, show fallback
        setTimeout(()=>{
          const iframe = wrapper.querySelector('iframe');
          if(!iframe) showFallback();
        },2200);
      }catch(e){ showFallback(); }

      // copy link buttons
      function copyToClipboard(text, el){
        if(navigator.clipboard){
          navigator.clipboard.writeText(text).then(()=>{ el.textContent = 'تم النسخ'; setTimeout(()=>el.textContent='انسخ الرابط',1400); });
        }else{
          // legacy
          const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); el.textContent='تم النسخ'; }catch(e){ alert('انسخ يدوياً: '+text)} ta.remove(); setTimeout(()=>el.textContent='انسخ الرابط',1400);
        }
      }

      const url = 'https://www.instagram.com/p/DJRkIIIsFVG/';
      document.getElementById('copy-link')?.addEventListener('click', function(e){ copyToClipboard(url,this); });
      document.getElementById('copy-link-2')?.addEventListener('click', function(e){ copyToClipboard(url,this); });
      document.getElementById('view-on-instagram')?.addEventListener('click', ()=> window.open(url,'_blank'));
      document.getElementById('open-link')?.addEventListener('click', ()=> {});

      // native share
      document.getElementById('share-native')?.addEventListener('click', async ()=>{
        try{
          if(navigator.share){
            await navigator.share({title:'Instagram post', text:'تفقد هذا المنشور', url});
          }else{
            alert('المشاركة غير متاحة في هذا المتصفح. انسخ الرابط ومشاركته يدوياً.');
          }
        }catch(e){ console.error(e); }
      });

      // simple action examples
      document.getElementById('action-like')?.addEventListener('click', function(){ this.textContent = 'تم الإعجاب'; this.disabled = true; });
      document.getElementById('action-save')?.addEventListener('click', function(){ this.textContent = 'تم الحفظ'; this.disabled = true; });
      document.getElementById('action-comment')?.addEventListener('click', function(){ window.open(url,'_blank'); });
    })();