(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* Art deco sunburst: gold rays fanning out behind the logo ("tala" = star) */
  var rays = document.querySelector('.deco__rays');
  if (rays) {
    var n = 48, cx = 300, cy = 300;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2;
      var long = i % 2 === 0;
      var r1 = 196, r2 = long ? 246 : 228;
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', (cx + Math.cos(a) * r1).toFixed(1));
      l.setAttribute('y1', (cy + Math.sin(a) * r1).toFixed(1));
      l.setAttribute('x2', (cx + Math.cos(a) * r2).toFixed(1));
      l.setAttribute('y2', (cy + Math.sin(a) * r2).toFixed(1));
      l.setAttribute('stroke-width', long ? 1.6 : .9);
      l.style.setProperty('--len', r2 - r1);
      l.style.setProperty('--d', (0.4 + (i / n) * 0.9).toFixed(2) + 's');
      rays.appendChild(l);
    }
    // deco fans at four corners
    [[-90,0],[90,0],[0,0],[180,0]].forEach(function(p, k){
      var base = p[0] * Math.PI / 180;
      for (var j = -3; j <= 3; j++) {
        var aa = base + j * 0.09;
        var f = document.createElementNS(NS, 'line');
        f.setAttribute('x1', (cx + Math.cos(aa) * 292).toFixed(1));
        f.setAttribute('y1', (cy + Math.sin(aa) * 292).toFixed(1));
        f.setAttribute('x2', (cx + Math.cos(aa) * (318 - Math.abs(j) * 5)).toFixed(1));
        f.setAttribute('y2', (cy + Math.sin(aa) * (318 - Math.abs(j) * 5)).toFixed(1));
        f.setAttribute('stroke-width', 1.2);
        f.style.setProperty('--len', 30);
        f.style.setProperty('--d', (1.4 + k * 0.15).toFixed(2) + 's');
        rays.appendChild(f);
      }
    });
  }
  var stars = document.querySelector('.deco__stars');
  if (stars) {
    var pts = [[86,120,9],[520,96,7],[548,420,10],[70,470,7],[300,18,6],[468,548,6],[130,300,5],[480,250,5]];
    pts.forEach(function(p, i){
      var x = p[0], y = p[1], s = p[2];
      var d = 'M'+x+' '+(y-s)+' L'+(x+s*.22)+' '+(y-s*.22)+' L'+(x+s)+' '+y+' L'+(x+s*.22)+' '+(y+s*.22)+' L'+x+' '+(y+s)+' L'+(x-s*.22)+' '+(y+s*.22)+' L'+(x-s)+' '+y+' L'+(x-s*.22)+' '+(y-s*.22)+'Z';
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.style.setProperty('--d', (1.8 + i * 0.45).toFixed(2) + 's');
      stars.appendChild(path);
    });
  }

  /* Pause hero + marquee animations when offscreen or tab hidden */
  var hero = document.querySelector('.hero__art');
  var marq = document.querySelector('.marquee__track');
  function setPlay(el, on){ if (!el) return; el.querySelectorAll('*').forEach(function(c){ c.style.animationPlayState = on ? 'running' : 'paused'; }); el.style.animationPlayState = on ? 'running' : 'paused'; }
  if ('IntersectionObserver' in window) {
    var po = new IntersectionObserver(function(es){ es.forEach(function(e){ setPlay(e.target, e.isIntersecting && !document.hidden); }); });
    if (hero) po.observe(hero);
    if (marq) po.observe(marq);
  }
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { setPlay(hero, false); setPlay(marq, false); }
  });

  /* Scroll reveals */
  var rev = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    rev.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function(el, i){ el.style.transitionDelay = ((i % 3) * 80) + 'ms'; ro.observe(el); });
  }

  /* Mobile menu */
  var tog = document.querySelector('.nav__toggle'), mob = document.getElementById('mobile-menu');
  if (tog && mob) {
    tog.addEventListener('click', function(){
      var open = tog.getAttribute('aria-expanded') === 'true';
      tog.setAttribute('aria-expanded', String(!open));
      tog.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mob.hidden = open;
    });
    mob.addEventListener('click', function(e){ if (e.target.closest('a')) { mob.hidden = true; tog.setAttribute('aria-expanded', 'false'); tog.setAttribute('aria-label', 'Open menu'); } });
  }

  /* Highlight today's hours */
  var today = new Date().getDay();
  var row = document.querySelector('.hours tr[data-day="' + today + '"]');
  if (row) { row.classList.add('is-today'); row.querySelector('th').insertAdjacentHTML('beforeend', ' <span class="sr">(today)</span>'); }

  /* Sticky call bar on phones, after the hero */
  var bar = document.querySelector('.callbar');
  var heroSec = document.querySelector('.hero');
  if (bar && heroSec && 'IntersectionObserver' in window) {
    var past = false, seen = {};
    var upd = function(){ bar.classList.toggle('is-on', past && !seen.order && !seen.visit); };
    new IntersectionObserver(function(es){ past = !es[0].isIntersecting; upd(); }).observe(heroSec);
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ seen[e.target.id] = e.isIntersecting; }); upd(); });
    ['order','visit'].forEach(function(id){ var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* Active section in the top nav */
  if ('IntersectionObserver' in window) {
    var navLinks = document.querySelectorAll('.nav__links a');
    var so = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        navLinks.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function(a){ var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) so.observe(el); });
  }

  /* Menu jump bar: only the tab you tap gets highlighted */
  var jump = document.querySelector('.menu__jump');
  if (jump) {
    var chips = Array.prototype.slice.call(jump.querySelectorAll('a'));
    var groups = chips.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); });
    var setActive = function(i){
      chips.forEach(function(a, k){ a.classList.toggle('is-active', k === i); });
      var c = chips[i];
      if (c && jump.scrollWidth > jump.clientWidth) {
        var left = c.offsetLeft - jump.offsetLeft, right = left + c.offsetWidth;
        if (left < jump.scrollLeft || right > jump.scrollLeft + jump.clientWidth) jump.scrollLeft = left - 12;
      }
    };
    chips.forEach(function(a, k){
      a.addEventListener('click', function(e){
        var g = groups[k]; if (!g) return;
        e.preventDefault();
        setActive(k);
        g.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', '#' + g.id);
        groups.forEach(function(x){ x.classList.remove('is-picked'); });
        void g.offsetWidth;
        g.classList.add('is-picked');
        clearTimeout(g._pick);
        g._pick = setTimeout(function(){ g.classList.remove('is-picked'); }, 2600);
      });
    });
  }

  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
