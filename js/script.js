/* ============================================================
   NEO NITIN FOUNDATION — Site script
   Vanilla JS, no build step, no dependencies.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
      });
    });
  }

  /* ---------- Highlight active nav link ---------- */
  const here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
      const duration = 1600;
      const start = performance.now();
      const suffixEl = el;
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        suffixEl.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const countIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => countIo.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Testimonial carousel ---------- */
  const testiWrap = document.querySelector('.testi-wrap');
  if (testiWrap) {
    const slides = testiWrap.querySelectorAll('.testi-slide');
    const dotsWrap = testiWrap.querySelector('.testi-dots');
    let active = 0;
    let timer;

    const show = (idx) => {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      if (dotsWrap) {
        dotsWrap.querySelectorAll('button').forEach((d, i) => d.classList.toggle('is-active', i === idx));
      }
      active = idx;
    };

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        dot.addEventListener('click', () => { show(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      });
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => show((active + 1) % slides.length), 6000);
    }

    if (slides.length) {
      show(0);
      resetTimer();
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Donation tier selector ---------- */
  document.querySelectorAll('.donate-tiers').forEach(group => {
    const tiers = group.querySelectorAll('.tier');
    tiers.forEach(tier => {
      tier.addEventListener('click', () => {
        tiers.forEach(t => t.classList.remove('is-selected'));
        tier.classList.add('is-selected');
        const radio = tier.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        const customField = document.querySelector('[data-custom-amount]');
        if (customField) {
          const isCustom = tier.hasAttribute('data-custom');
          customField.style.display = isCustom ? 'block' : 'none';
        }
      });
    });
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Netlify form success handling ----------
     Netlify intercepts the POST when data-netlify="true" is on the
     <form>. We enhance it slightly so users get a friendly inline
     confirmation instead of a full page reload/redirect. ---------- */
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    form.addEventListener('submit', (e) => {
      // Basic required-field check for a nicer inline message.
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(f => { if (!f.value.trim()) valid = false; });
      if (!valid) return; // let native validation handle it

      e.preventDefault();
      const data = new FormData(form);
      // Send a copy to Supabase via our serverless function (non-blocking)
      fetch('/.netlify/functions/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formName: form.getAttribute('name'), fields: Object.fromEntries(data) })
      }).catch(()=>{});

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      })
        .then(() => {
          const successBox = form.parentElement.querySelector('.form-success');
          if (successBox) {
            successBox.classList.add('is-visible');
            successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          form.reset();
          form.querySelectorAll('.tier').forEach(t => t.classList.remove('is-selected'));
        })
        .catch(() => {
          alert('Something went wrong sending the form. Please try again or email us directly.');
        });
    });
  });

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
