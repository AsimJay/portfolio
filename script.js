(function(){
  // ---- Year ----
  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();

  // ---- Dark mode ----
  var themeToggle = document.getElementById('themeToggle');
  var root = document.documentElement;

  function setTheme(theme){
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Restore saved theme or respect system preference
  var saved = localStorage.getItem('theme');
  if(saved){
    setTheme(saved);
  } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    setTheme('dark');
  }

  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      var current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- Mobile nav ----
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navlinks');

  function setOpen(open){
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
  links.addEventListener('click', function(e){ if(e.target.tagName === 'A') setOpen(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });

  // ---- Reveal on scroll ----
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if(reduce || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function(el){ io.observe(el); });
  }

  // ---- Contact form (Web3Forms, mailto as fallback) ----
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if(form){
    var btn = form.querySelector('.btn-submit');
    var btnLabel = btn ? btn.innerHTML : '';

    // 'success' / 'error' match the .form-status modifiers already in style.css —
    // the base class is display:none, so an unrecognised name renders nothing.
    function setStatus(msg, kind){
      if(!status) return;
      status.textContent = msg;
      status.className = 'form-status' + (kind ? ' ' + kind : '');
    }

    // If the request never lands, the visitor still has a way through.
    function mailtoFallback(name, email, message){
      var subject = 'Portfolio Contact from ' + name;
      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      return 'mailto:asimnizam@icloud.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();
      if(!name || !email || !message) return;

      if(btn){ btn.disabled = true; btn.innerHTML = 'Sending…'; }
      setStatus('', '');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      })
      .then(function(res){ return res.json().then(function(data){ return { ok: res.ok, data: data }; }); })
      .then(function(r){
        if(r.ok && r.data.success){
          form.reset();
          setStatus('Thanks — your message is on its way. I usually reply within a day or two.', 'success');
        } else {
          throw new Error((r.data && r.data.message) || 'Submission failed');
        }
      })
      .catch(function(){
        setStatus('Something went wrong sending that. Opening your email client instead — or reach me directly at asimnizam@icloud.com.', 'error');
        window.location.href = mailtoFallback(name, email, message);
      })
      .finally(function(){
        if(btn){ btn.disabled = false; btn.innerHTML = btnLabel; }
      });
    });
  }
})();
