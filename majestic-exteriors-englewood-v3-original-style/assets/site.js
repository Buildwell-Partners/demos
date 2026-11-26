(function(){
  // placeholder tape toggle (remembered per browser)
  var t = document.getElementById('ph-toggle');
  if (t) {
    try { if (localStorage.getItem('me-hide-ph') === '1') t.checked = false; } catch(e){}
    var applyPh = function(){ document.body.classList.toggle('hide-ph', !t.checked); try { localStorage.setItem('me-hide-ph', t.checked ? '0' : '1'); } catch(e){} };
    t.addEventListener('change', applyPh); applyPh();
  }

  // ?need= prefill from links like "Book a free hail inspection"
  try {
    var need = new URLSearchParams(location.search).get('need');
    if (need) document.querySelectorAll('.quote input[name=need]').forEach(function(r){ r.checked = (r.value === need); });
  } catch(e){}

  // hail-size guide
  var HAIL = {
    0.25: ['Rarely damages a roof', 'Pea-size hail almost never hurts shingles. It can still shred plants and dent soft aluminum. No inspection needed unless you see a leak.'],
    0.5: ['Unlikely to damage shingles', 'Marble-size hail can dent gutters, screens and soft metal vents. Older, brittle shingles may lose granules. Worth a look if your roof is 15+ years old.'],
    0.75: ['Possible damage on older roofs', 'Penny-size hail can bruise worn asphalt shingles and dent gutters and downspouts. A free inspection is worth it before your claim window closes.'],
    1: ['Damage is common: get it inspected', 'Quarter-size hail (1 inch) is roughly where asphalt shingles start to crack and lose granules. Have the roof inspected and photographed before you call your insurer.'],
    1.5: ['Damage is likely', 'Ping-pong-ball hail usually damages asphalt shingles, gutters, siding and window screens. Book an inspection and document everything for one complete claim.'],
    1.75: ['Damage is very likely', 'Golf-ball hail damages most roofs and often siding and gutters too. Some impact-rated roofs survive it, which is why many Denver homeowners upgrade to Class 4.'],
    2.5: ['Severe damage expected', 'Tennis-ball hail can puncture roofing and break windows. Cover openings, call us for an emergency tarp, then start your claim.']
  };
  document.querySelectorAll('.hail').forEach(function(box){
    var btns = box.querySelectorAll('.hail-btn');
    function set(btn){
      btns.forEach(function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      var d = HAIL[parseFloat(btn.dataset.size)];
      box.querySelector('.hail-verdict').textContent = d[0];
      box.querySelector('.hail-text').textContent = d[1];
    }
    btns.forEach(function(b){ b.addEventListener('click', function(){ set(b); }); });
    set(box.querySelector('.hail-btn[aria-pressed=true]') || btns[0]);
  });


  // 3-step quote form
  var ZIPS = /^(80[0-2]\d\d|801[0-6]\d|8040[1-3]|8010[4-9]|80134|80138)$/;
  document.querySelectorAll('.quote').forEach(function(f){
    var steps = f.querySelectorAll('.q-step'), dots = f.querySelectorAll('.q-steps li'), i = 0;
    function go(n){
      i = n;
      steps.forEach(function(s, k){ s.hidden = k !== n; });
      dots.forEach(function(d, k){ d.classList.toggle('on', k <= n); });
      var first = steps[n].querySelector('input:not([type=radio])'); if (first && n > 0) first.focus();
    }
    function valid(){
      var ok = true;
      steps[i].querySelectorAll('input[required]').forEach(function(inp){
        var bad = !inp.value.trim() || (inp.name === 'zip' && !/^\d{5}$/.test(inp.value));
        inp.setAttribute('aria-invalid', bad ? 'true' : 'false'); if (bad) ok = false;
      });
      return ok;
    }
    f.querySelectorAll('.q-next').forEach(function(b){ b.addEventListener('click', function(){ if (valid()) go(i + 1); }); });
    f.querySelectorAll('.q-back').forEach(function(b){ b.addEventListener('click', function(){ go(i - 1); }); });
    var zip = f.querySelector('input[name=zip]'), hint = f.querySelector('.hint');
    zip.addEventListener('input', function(){
      zip.value = zip.value.replace(/\D/g, '');
      if (zip.value.length === 5) hint.textContent = ZIPS.test(zip.value) ? 'Good news: that ZIP is in our Greater Denver service area.' : 'That ZIP may be outside our usual area. Send it anyway and we will let you know.';
      else hint.textContent = '';
    });
    f.addEventListener('submit', function(ev){
      ev.preventDefault();
      if (!valid()) return;
      steps.forEach(function(s){ s.hidden = true; });
      f.querySelector('.q-steps').hidden = true;
      f.querySelector('.q-done').hidden = false;
    });
  });
})();
(function(){
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header shrinks on scroll (Divi fixed-nav behaviour)
  var hdr = document.querySelector('.site-header');
  if (hdr) { var onS = function(){ hdr.classList.toggle('shrink', window.scrollY > 60); }; addEventListener('scroll', onS, {passive:true}); onS(); }

  // mobile menu
  var mb = document.querySelector('.menu-btn'), nav = document.getElementById('main-nav');
  if (mb && nav) mb.addEventListener('click', function(){ var o = mb.getAttribute('aria-expanded') === 'true'; mb.setAttribute('aria-expanded', o ? 'false' : 'true'); nav.classList.toggle('open', !o); });

  // generic fade slider (hero + testimonials)
  function slider(root, slideSel, opts){
    if (!root) return;
    var slides = root.querySelectorAll(slideSel), n = slides.length, i = 0, timer = null;
    if (n < 2) return;
    var dots = root.querySelectorAll('[data-go]');
    function go(k){
      i = (k + n) % n;
      slides.forEach(function(s, j){ s.classList.toggle('on', j === i); s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      dots.forEach(function(d, j){ d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    }
    function play(){ if (!reduce && opts.auto) { stop(); timer = setInterval(function(){ go(i + 1); }, opts.auto); } }
    function stop(){ if (timer) clearInterval(timer); timer = null; }
    root.querySelectorAll('.prev').forEach(function(b){ b.addEventListener('click', function(){ go(i - 1); play(); }); });
    root.querySelectorAll('.next').forEach(function(b){ b.addEventListener('click', function(){ go(i + 1); play(); }); });
    dots.forEach(function(d){ d.addEventListener('click', function(){ go(+d.dataset.go); play(); }); });
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop);
    go(0); play();
  }
  slider(document.querySelector('.hero'), '.slide', {auto: 7000});
  slider(document.querySelector('.t-slider'), '.t-slide', {auto: 9000});

  // scroll reveal
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin: '0px 0px -8% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  } else rv.forEach(function(el){ el.classList.add('in'); });

  // keep old majesticexteriors.net links working: /services/#copper etc.
  var OLD = window.OLD_ANCHORS;
  if (OLD && location.hash && OLD[location.hash.slice(1)]) location.replace(OLD[location.hash.slice(1)]);
})();
