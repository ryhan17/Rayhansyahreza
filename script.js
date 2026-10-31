/* Layar memuat */
(function(){
  var l=document.getElementById('loading'),n=document.getElementById('ld-n'),bar=document.getElementById('ld-bar');
  if(!l){document.body.classList.remove('memuat');return;}
  var kurang=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var min=kurang?250:1600,t0=performance.now(),siap=document.readyState==='complete',p=0,selesai=false;
  window.addEventListener('load',function(){siap=true;});
  function langkah(now){
    var el=now-t0;if(el>6000)siap=true;
    var target=Math.min(el/min,1)*100;if(!siap)target=Math.min(target,90);
    p=Math.min(target,p+3);
    n.textContent=('00'+Math.floor(p)).slice(-3);bar.style.transform='scaleX('+(p/100)+')';
    if(p>=100&&!selesai){
      selesai=true;
      setTimeout(function(){
        l.classList.add('selesai');document.body.classList.remove('memuat');
        setTimeout(function(){l.remove();},kurang?0:900);
      },200);
      return;
    }
    requestAnimationFrame(langkah);
  }
  requestAnimationFrame(langkah);
})();

/* Mode terang / gelap */
(function(){
  var root=document.documentElement,b=document.getElementById('tema');
  function gelap(){var t=root.getAttribute('data-tema');return t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;}
  function label(){b.textContent=gelap()?'Terang':'Gelap';b.setAttribute('aria-label',gelap()?'Pindah ke mode terang':'Pindah ke mode gelap');}
  b.addEventListener('click',function(){
    var t=gelap()?'light':'dark';root.setAttribute('data-tema',t);
    try{localStorage.setItem('tema',t);}catch(e){}
    label();
  });
  label();
})();

/* Filter karya multimedia */
(function(){
  var tombol=document.querySelectorAll('.filter button'),karya=document.querySelectorAll('.karya');
  tombol.forEach(function(b){
    b.addEventListener('click',function(){
      tombol.forEach(function(x){x.setAttribute('aria-pressed','false')});
      b.setAttribute('aria-pressed','true');
      var f=b.getAttribute('data-f');
      karya.forEach(function(k){k.classList.toggle('hilang',f!=='semua'&&k.getAttribute('data-k')!==f);});
    });
  });
})();

/* Wipe, navigasi, dan jendela informasi karya */
(function(){
  var wipe=document.getElementById('wipe'),detail=document.getElementById('detail');
  var kurang=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sibuk=false,terakhir=null,EASE='cubic-bezier(.7,0,.2,1)',MS=480;
  function sapu(tengah){
    if(kurang){tengah();return;}
    if(sibuk)return; sibuk=true;
    wipe.getAnimations().forEach(function(a){a.cancel()});
    wipe.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:MS,easing:EASE,fill:'forwards'}).finished
    .then(function(){
      tengah();
      return wipe.animate([{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 0 100%)'}],{duration:MS,easing:EASE,fill:'forwards'}).finished;
    }).then(function(){sibuk=false;});
  }

  var layar=document.querySelectorAll('.layar'),menu=document.querySelectorAll('.nav ul a');
  function tampil(id){
    var t=document.getElementById(id);
    if(!t||!t.classList.contains('layar'))id='beranda';
    layar.forEach(function(l){l.classList.toggle('aktif',l.id===id);});
    menu.forEach(function(a){if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.body.setAttribute('data-v',id);
    window.scrollTo(0,0);
  }
  function pergi(id,dorong){
    if(document.body.getAttribute('data-v')===id)return;
    sapu(function(){tampil(id);if(dorong){try{history.pushState(null,'','#'+id);}catch(e){}}});
  }
  document.querySelectorAll('.nav a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){e.preventDefault();pergi(a.getAttribute('href').slice(1),true);});
  });
  window.addEventListener('popstate',function(){pergi(location.hash.slice(1)||'beranda',false);});
  tampil(location.hash.slice(1)||'beranda');

  function isi(id,teks){document.getElementById(id).textContent=teks;}
  function buka(el){
    terakhir=el;
    sapu(function(){
      var d=el.dataset,media=document.getElementById('d-media'),meta=document.getElementById('d-meta');
      isi('d-kat',d.kat);isi('d-judul',d.judul);isi('d-info',d.info);
      media.textContent='';
      var m=el.querySelector('img'),ada=!!m;
      if(d.yt){
        var f=document.createElement('iframe');
        f.src='https://www.youtube-nocookie.com/embed/'+d.yt+'?autoplay=1&rel=0';
        f.title=d.judul;f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
        media.appendChild(f);ada=true;
      }else if(d.video){
        var v=document.createElement('video');
        v.src=d.video;v.controls=true;v.autoplay=true;v.playsInline=true;if(m)v.poster=m.getAttribute('src');
        media.appendChild(v);ada=true;
      }else if(m){var c=m.cloneNode(true);c.alt=d.judul||'';media.appendChild(c);}
      document.getElementById('d-isi').classList.toggle('tanpa-media',!ada);
      meta.textContent='';
      [['Tahun',d.tahun],['Alat',d.alat],['Peran',d.peran]].forEach(function(p){
        if(!p[1])return;
        var dt=document.createElement('dt'),dd=document.createElement('dd');
        dt.textContent=p[0];dd.textContent=p[1];meta.appendChild(dt);meta.appendChild(dd);
      });
      var l=document.getElementById('d-link');
      if(d.link){l.href=d.link;l.hidden=false;}else{l.hidden=true;}
      detail.hidden=false;document.body.style.overflow='hidden';detail.scrollTop=0;
      document.getElementById('tutup').focus();
    });
  }
  function tutup(){
    if(detail.hidden)return;
    sapu(function(){
      var v=detail.querySelector('video');if(v)v.pause();
      var fr=detail.querySelector('iframe');if(fr)fr.remove();
      detail.hidden=true;document.body.style.overflow='';
      if(terakhir)terakhir.focus();
    });
  }
  document.querySelectorAll('.karya,.proyek').forEach(function(el){
    el.addEventListener('click',function(e){e.preventDefault();buka(el);});
    el.addEventListener('keydown',function(e){if(e.key===' '){e.preventDefault();buka(el);}});
  });
  document.getElementById('tutup').addEventListener('click',tutup);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')tutup();});
})();

/* Tentang: tab Profil / CV */
(function(){
  var tb=document.querySelectorAll('.tab button');
  tb.forEach(function(b){b.addEventListener('click',function(){
    tb.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    var cv=b.getAttribute('data-t')==='cv';
    document.querySelectorAll('.p-profil').forEach(function(e){e.hidden=cv});
    document.querySelector('.p-cv').hidden=!cv;
  });});
  var c=document.getElementById('cetak');if(c)c.addEventListener('click',function(){window.print();});
})();
