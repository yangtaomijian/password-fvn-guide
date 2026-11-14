/* Add the decorative notebook portrait without changing guide interactions. */
(()=>{
 const root=document.getElementById('pw-home-scene');if(!root)return;
 const left=root.querySelector('.left-page'),journey=root.querySelector('.scroll-journey');
 if(!left||left.querySelector('.dave-portrait-row'))return;
 const here=new URL('.',document.currentScript.src), row=document.createElement('div');row.className='dave-portrait-row';
 const art=document.createElement('div');art.className='dave-portrait-figure';art.setAttribute('aria-hidden','true');
 art.innerHTML='<svg viewBox="270 60 640 1140" xmlns="http://www.w3.org/2000/svg"><image href="'+new URL('dave.webp',here).href+'" width="1292" height="1218"/></svg>';
 row.append(art);const note=left.querySelector('.margin-note');if(note)row.append(note);
 const old=left.querySelector('.line-art');if(old)old.replaceWith(row);else left.append(row);
 function sync(){const normal=journey?.classList.contains('normal-reading');const p=Number(journey?.style.getPropertyValue('--journey-progress')||0);root.classList.toggle('dave-reading',normal||p>=.94)}
 const observer=new MutationObserver(sync);if(journey)observer.observe(journey,{attributes:true,attributeFilter:['class','style']});sync();
})();
