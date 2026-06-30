/**
 * Built-U Gym — Premium Fitness Website
 * script.js v1.0
 */

'use strict';

/* ─────────────────────────────────────────
   UTILITY: raf-based throttle
───────────────────────────────────────── */
function rafThrottle(fn) {
  let scheduled = false;
  return function (...args) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      fn.apply(this, args);
      scheduled = false;
    });
  };
}

/* ─────────────────────────────────────────
   NAV: scroll-aware + mobile toggle
───────────────────────────────────────── */
(function initNav() {
  const header = document.getElementById('nav-header');
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  const links  = menu ? menu.querySelectorAll('.nav-link, .nav-cta') : [];

  // Scroll class
  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', rafThrottle(onScroll), { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }
})();

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
(function initScrollReveal() {
  if (!window.IntersectionObserver) {
    // Fallback: show everything
    document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right')
      .forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────
   ANIMATED COUNTERS
───────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || 0, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const current  = startVal + (target - startVal) * eased;

      el.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if (!window.IntersectionObserver) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────
   3D CARD TILT (subtle, performant)
───────────────────────────────────────── */
(function initCardTilt() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.why-card, .plan-card, .testi-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', rafThrottle(function (e) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 4;
      const rotY =  dx * 4;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    }));

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
})();

/* ─────────────────────────────────────────
   SMOOTH SECTION SCROLL (offset for nav)
───────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.getElementById('nav-header')?.offsetHeight || 70;
      const y = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

/* ─────────────────────────────────────────
   PARALLAX: subtle hero background
───────────────────────────────────────── */
(function initParallax() {
  // Only on desktop, only if reduced motion is not set
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  function onScroll() {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.3}px)`;
  }

  window.addEventListener('scroll', rafThrottle(onScroll), { passive: true });
})();

/* ─────────────────────────────────────────
   LAZY IMAGE LOADING: show placeholder
   until image loads
───────────────────────────────────────── */
(function initLazyImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  images.forEach(img => {
    if (!img.src || img.src === window.location.href) return;

    img.addEventListener('error', function () {
      // Keep placeholder visible if image fails
      this.style.display = 'none';
    });
  });
})();

/* ─────────────────────────────────────────
   ACTIVE NAV LINK on scroll
───────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', rafThrottle(updateActiveLink), { passive: true });
})();

/* ─────────────────────────────────────────
   HERO: staggered entrance animation
───────────────────────────────────────── */
(function initHeroEntrance() {
  const elements = document.querySelectorAll(
    '.hero-eyebrow, .hero-headline, .hero-sub, .hero-actions, .hero-stats, .hero-scroll'
  );

  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)`;
    el.style.transitionDelay = `${0.1 + i * 0.12}s`;

    // Trigger after a brief delay to allow paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
  });
})();


const openBtn=document.getElementById("openCeoMessage");

const modal=document.getElementById("ceoModal");

const closeBtn=document.getElementById("closeCeoModal");

openBtn.addEventListener("click",()=>{

modal.classList.add("active");

document.body.style.overflow="hidden";

});

closeBtn.addEventListener("click",()=>{

modal.classList.remove("active");

document.body.style.overflow="auto";

});

window.addEventListener("click",(e)=>{

if(e.target===modal){

modal.classList.remove("active");

document.body.style.overflow="auto";

}

});

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

modal.classList.remove("active");

document.body.style.overflow="auto";

}

});