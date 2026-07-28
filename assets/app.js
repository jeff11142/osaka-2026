/* 大阪導覽站 — 漸進增強 JS。核心資訊已在 HTML，關掉 JS 也能看。 */
(function(){
  "use strict";

  /* 大字模式：長輩可一鍵放大，記憶於 localStorage */
  try{
    if(localStorage.getItem('bigfont')==='1'){ document.body.classList.add('big'); }
  }catch(e){}
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-bigfont]');
    if(t){
      document.body.classList.toggle('big');
      try{ localStorage.setItem('bigfont', document.body.classList.contains('big')?'1':'0'); }catch(e){}
    }
  });

  /* 展開/收合全部（每日行程頁） */
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-bulk]');
    if(!t) return;
    var open = t.getAttribute('data-bulk')==='open';
    document.querySelectorAll('details.stop').forEach(function(d){ d.open = open; });
  });

  /* 日別導覽：捲動時高亮目前日；點擊平滑捲動已由 CSS 處理 */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.daynav a[href^="#"]'));
  if(navLinks.length && 'IntersectionObserver' in window){
    var map = {};
    navLinks.forEach(function(a){
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if(sec) map[id] = a;
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          navLinks.forEach(function(a){ a.classList.remove('active'); });
          var a = map[en.target.id];
          if(a){ a.classList.add('active');
            a.scrollIntoView({inline:'center', block:'nearest', behavior:'smooth'}); }
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    Object.keys(map).forEach(function(id){ io.observe(document.getElementById(id)); });
  }

  /* 回到頂部 */
  document.addEventListener('click', function(e){
    if(e.target.closest('[data-top]')){ window.scrollTo({top:0, behavior:'smooth'}); }
  });
})();
