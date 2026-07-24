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

  // ---- Contact form (mailto fallback) ----
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();

      if(!name || !email || !message) return;

      var subject = 'Portfolio Contact from ' + name;
      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      window.location.href = 'mailto:asimnizam@icloud.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
