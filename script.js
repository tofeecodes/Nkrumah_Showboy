// scroll-triggered entrance animation for each section
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealIO.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // mobile nav toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // active-link highlight on scroll
  const sections = ['home','who','current-event','journey','sponsorship','content','ticketing','contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navAnchors = Array.from(document.querySelectorAll('nav.links a[href^="#"]'));
  const setActive = () => {
    let current = sections[0];
    const y = window.scrollY + 120;
    sections.forEach(sec => { if (sec.offsetTop <= y) current = sec; });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
  };
  window.addEventListener('scroll', setActive);
  setActive();

  // ticketing notify form — placeholder, no backend yet
  const notifyForm = document.getElementById('notifyForm');
  const notifyMsg = document.getElementById('notifyMsg');
  notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('notifyEmail').value;
    notifyMsg.textContent = "Thanks — we'll email " + email + " the moment tickets go live.";
    notifyForm.reset();
  });

  // become-a-sponsor form — placeholder, no backend yet
  const sponsorForm = document.getElementById('sponsorForm');
  const sponsorMsgOut = document.getElementById('sponsorMsgOut');
  sponsorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sponsorName').value;
    sponsorMsgOut.textContent = "Thanks, " + name + " — we've received your message and will be in touch soon.";
    sponsorForm.reset();
  });

  // Team profile carousel: fetch JSON (or use inline) and render with transitions + auto-advance
  document.querySelectorAll('.team-card').forEach(card => {
    const src = card.getAttribute('data-profiles-src');
    const inline = card.getAttribute('data-profiles');
    const frame = card.querySelector('.profile-frame');
    if (!frame) return;
    const imgEl = frame.querySelector('.profile-image');
    const nameEl = frame.querySelector('.profile-meta .name');
    const roleEl = frame.querySelector('.profile-meta .role');
    const prev = card.querySelector('.profile-nav.prev');
    const next = card.querySelector('.profile-nav.next');
    let profiles = [];
    let idx = 0;
    const TRANS_MS = 480;
    const AUTO_MS = 4500;
    let autoTimer = null;

    const startAuto = () => { stopAuto(); if (profiles.length>1) autoTimer = setInterval(()=> go(1), AUTO_MS); };
    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };

    const setContent = (p) => {
      nameEl.textContent = p.name || '';
      roleEl.textContent = p.role || '';
      imgEl.innerHTML = '';
      if (p.image) {
        const img = document.createElement('img'); img.src = p.image; img.alt = p.name || 'Profile';
        imgEl.appendChild(img);
      } else {
        const initials = (p.name||'').split(' ').map(s=>s[0]).filter(Boolean).slice(0,2).join('');
        const span = document.createElement('div'); span.className = 'initials'; span.textContent = initials;
        imgEl.appendChild(span);
      }
    };

    const animateTo = (newIdx) => {
      imgEl.classList.add('is-hidden');
      nameEl.classList.add('is-hidden');
      roleEl.classList.add('is-hidden');
      setTimeout(() => {
        idx = (newIdx + profiles.length) % profiles.length;
        setContent(profiles[idx]);
        requestAnimationFrame(() => {
          imgEl.classList.remove('is-hidden');
          nameEl.classList.remove('is-hidden');
          roleEl.classList.remove('is-hidden');
        });
        card.setAttribute('data-current', idx);
      }, TRANS_MS);
    };

    const go = (delta) => {
      animateTo(idx + delta);
      startAuto();
    };

    const attachListeners = () => {
      if (prev) prev.addEventListener('click', () => go(-1));
      if (next) next.addEventListener('click', () => go(1));
      card.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') prev && prev.click(); if (e.key === 'ArrowRight') next && next.click(); });
      card.addEventListener('mouseenter', stopAuto);
      card.addEventListener('focusin', stopAuto);
      card.addEventListener('mouseleave', startAuto);
      card.addEventListener('focusout', startAuto);
    };

    const initWithProfiles = (arr) => {
      profiles = arr || [];
      if (!profiles.length) return;
      setContent(profiles[0]);
      card.setAttribute('data-current', 0);
      attachListeners();
      startAuto();
    };

    // prefer embedded JSON inside the card when present (works with file://), then external JSON, then inline attribute
    const embeddedScript = card.querySelector('script[type="application/json"], script.team-data-embed');
    if (embeddedScript) {
      try { initWithProfiles(JSON.parse(embeddedScript.textContent)); } catch (e) { /* ignore */ }
    } else if (src) {
      fetch(src).then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); }).then(data => initWithProfiles(data)).catch(err => { if (inline) { try { initWithProfiles(JSON.parse(inline)); } catch(e){} } });
    } else if (inline) {
      try { initWithProfiles(JSON.parse(inline)); } catch(e) { /* ignore */ }
    }
  });