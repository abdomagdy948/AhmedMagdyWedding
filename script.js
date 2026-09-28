// Poster & Background Music
(function () {
  const posterScreen = document.getElementById('poster-screen');
  const music = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  const scrollPrompt = document.getElementById('scroll-prompt');
  let opened = false;

  // Prevent scroll while invitation is closed
  document.body.style.overflow = 'hidden';

  function setToggleUI(isPlaying) {
    if (!toggle) return;
    toggle.classList.toggle('is-playing', isPlaying);
    toggle.textContent = isPlaying ? '❚❚' : '♪';
    toggle.setAttribute('aria-label', isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى');
  }

  function updateScrollPrompt() {
    if (!scrollPrompt) return;
    const atTop = window.scrollY <= 0;
    scrollPrompt.classList.toggle('visible', atTop);
    scrollPrompt.setAttribute('aria-hidden', String(!atTop));
  }

  function playMusic() {
    if (!music) return Promise.resolve(false);
    music.muted = false;
    const p = music.play();
    if (p !== undefined && p.then) {
      return p
        .then(() => {
          setToggleUI(true);
          return true;
        })
        .catch((err) => {
          console.warn('Audio playback error:', err);
          setToggleUI(false);
          return false;
        });
    }
    setToggleUI(true);
    return Promise.resolve(true);
  }

  function openInvitation() {
    if (opened) return;
    opened = true;

    // Start playing music immediately on user gesture
    playMusic();

    // Show floating music toggle
    if (toggle) {
      toggle.classList.add('visible');
    }

    // Smoothly fade out the envelope / cover
    if (posterScreen) {
      posterScreen.classList.add('closing');
      setTimeout(() => {
        posterScreen.style.display = 'none';
        document.body.style.overflow = '';
        updateScrollPrompt();
      }, 750);
    } else {
      document.body.style.overflow = '';
      updateScrollPrompt();
    }
  }

  // Handle open on poster click or keyboard enter/space
  if (posterScreen) {
    posterScreen.addEventListener('click', openInvitation);
    posterScreen.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openInvitation();
      }
    });
  }

  if (scrollPrompt) {
    window.addEventListener('scroll', updateScrollPrompt, { passive: true });
  }

  // Handle music toggle button click
  if (toggle && music) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (music.paused) {
        playMusic();
      } else {
        music.pause();
        setToggleUI(false);
      }
    });

    music.addEventListener('pause', () => setToggleUI(false));
    music.addEventListener('play', () => setToggleUI(true));
  }
})();

// Countdown (11 November 2026, 20:00)
(function () {
  const target = new Date('2026-11-11T20:00:00').getTime();
  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-min');
  const sEl = document.getElementById('cd-sec');

  if (!dEl || !hEl || !mEl || !sEl) return;

  function toArabicDigits(value) {
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(value).replace(/\d/g, (d) => arabic[d]);
  }

  function pad(n) {
    return toArabicDigits(String(Math.max(0, n)).padStart(2, '0'));
  }

  function tick() {
    const diff = Math.max(0, target - Date.now());
    dEl.textContent = pad(Math.floor(diff / 86400000));
    hEl.textContent = pad(Math.floor(diff / 3600000) % 24);
    mEl.textContent = pad(Math.floor(diff / 60000) % 60);
    sEl.textContent = pad(Math.floor(diff / 1000) % 60);
  }

  tick();
  setInterval(tick, 1000);
})();

// Reveal on scroll
(function () {
  const els = document.querySelectorAll('.fade-up:not(.in-view)');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach((el) => io.observe(el));
})();

// RSVP (store guestbook messages in Cloud Firestore)
(function () {
  const form = document.getElementById('rsvp-form');
  const thanks = document.getElementById('rsvp-thanks');
  const error = document.getElementById('rsvp-error');
  if (!form || !thanks || !error) return;

  const firebaseConfig = {
  apiKey: "AIzaSyB80ll5Z1_HLrN3mS6K1P2Hs9mW1t41FHE",
  authDomain: "ahmed-alaa-14ab6.firebaseapp.com",
  projectId: "ahmed-alaa-14ab6",
  storageBucket: "ahmed-alaa-14ab6.firebasestorage.app",
  messagingSenderId: "286755291785",
  appId: "1:286755291785:web:e4614171bd1a43711a7c58",
};

  let guestbook;
  try {
    firebase.initializeApp(firebaseConfig);
    guestbook = firebase.firestore().collection('guestbook');
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.classList.add('hidden');
    thanks.classList.add('hidden');

    if (!guestbook) {
      error.classList.remove('hidden');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const name = form.elements.name.value.trim();
    const note = form.elements.note.value.trim();
    if (!name || !note) return;

    submitButton.disabled = true;
    submitButton.textContent = 'جارٍ الإرسال...';

    try {
      await guestbook.add({
        name,
        note,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      thanks.classList.remove('hidden');
      submitButton.disabled = false;
      submitButton.textContent = 'إرسال';
    } catch (err) {
      console.error('Guestbook submission error:', err);
      error.classList.remove('hidden');
      submitButton.disabled = false;
      submitButton.textContent = 'إرسال';
    }
  });
})();
