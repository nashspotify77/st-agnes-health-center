// scripts.js
document.addEventListener('DOMContentLoaded', function () {
  // language links (existing placeholders)
  const en = document.getElementById('english-link');
  const fr = document.getElementById('french-link');
  if (en) en.addEventListener('click', function (e) { e.preventDefault(); /* switch to English */ });
  if (fr) fr.addEventListener('click', function (e) { e.preventDefault(); /* switch to French */ });

  // Compact search button opens modal; modal form performs the redirect
  const searchBtn = document.getElementById('search-button');
  const modalSearchInput = document.getElementById('modal-site-search');
  const modalSearchForm = document.getElementById('modal-search-form');
  let searchModal;
  if (searchBtn) {
    // initialize Bootstrap modal when available
    const modalEl = document.getElementById('searchModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      searchModal = new bootstrap.Modal(modalEl);
      searchBtn.addEventListener('click', () => {
        searchModal.show();
        // small timeout to ensure modal is visible then focus input
        setTimeout(() => { if (modalSearchInput) modalSearchInput.focus(); }, 200);
      });
    } else {
      // fallback: use prompt
      searchBtn.addEventListener('click', () => {
        const q = prompt('Search services, doctors...');
        if (q && q.trim()) {
          const params = new URLSearchParams({ q: q.trim() });
          window.location.href = `services.html?${params.toString()}`;
        }
      });
    }
  }

  if (modalSearchForm) {
    modalSearchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = (modalSearchInput && modalSearchInput.value) ? modalSearchInput.value.trim() : '';
      if (!q) {
        if (modalSearchInput) modalSearchInput.focus();
        return;
      }
      const params = new URLSearchParams({ q });
      // hide modal first if we have it
      if (searchModal) searchModal.hide();
      window.location.href = `services.html?${params.toString()}`;
    });
  }

  // ---------- Profile / Account management ----------
  const profileBtn = document.getElementById('open-profile');
  const profileModalEl = document.getElementById('profileModal');
  let profileModal;
  if (profileModalEl && typeof bootstrap !== 'undefined') {
    profileModal = new bootstrap.Modal(profileModalEl);
  }

  const profileAvatar = document.getElementById('profile-avatar');
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');

  function loadCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (!currentUser) {
      if (profileNameEl) profileNameEl.textContent = 'Guest';
      if (profileEmailEl) profileEmailEl.textContent = 'Not signed in';
      if (profileAvatar) profileAvatar.textContent = 'G';
      return null;
    }
    const user = users.find(u => u.username === currentUser);
    if (user) {
      if (profileNameEl) profileNameEl.textContent = user.username;
      if (profileEmailEl) profileEmailEl.textContent = user.email || '';
      if (profileAvatar) profileAvatar.textContent = (user.username || 'U').charAt(0).toUpperCase();
      return user;
    } else {
      // fallback
      if (profileNameEl) profileNameEl.textContent = currentUser;
      if (profileAvatar) profileAvatar.textContent = currentUser.charAt(0).toUpperCase();
      return null;
    }
  }

  // initialize profile summary on page load
  loadCurrentUser();

  // Open profile modal and populate fields
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const user = loadCurrentUser();
      if (!user) {
        alert('You are not signed in. Please log in via the Patient Portal.');
        return;
      }
      document.getElementById('profile-username').value = user.username || '';
      document.getElementById('profile-email-input').value = user.email || '';
      // hide password change area by default
      document.getElementById('password-change-area').style.display = 'none';
      document.getElementById('profile-password').value = '';
      document.getElementById('profile-password-confirm').value = '';
      const toggleBtn = document.getElementById('toggle-password-change');
      if (toggleBtn) toggleBtn.textContent = 'Show';
      if (profileModal) profileModal.show();
    });
  }

  // Toggle password change area
  const togglePasswordBtn = document.getElementById('toggle-password-change');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      const area = document.getElementById('password-change-area');
      if (!area) return;
      if (area.style.display === 'none' || area.style.display === '') {
        area.style.display = 'block';
        this.textContent = 'Hide';
      } else {
        area.style.display = 'none';
        this.textContent = 'Show';
      }
    });
  }

  // Password strength validator
  function isStrongPassword(pw) {
    if (!pw || pw.length < 8) return false;
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);
    return hasLetter && hasNumber && hasSymbol;
  }

  // live feedback on password
  const pwInput = document.getElementById('profile-password');
  const pwStrength = document.getElementById('password-strength');
  if (pwInput && pwStrength) {
    pwInput.addEventListener('input', () => {
      const v = pwInput.value;
      if (isStrongPassword(v)) {
        pwStrength.textContent = 'Strong password ✔';
        pwStrength.classList.remove('text-danger');
        pwStrength.classList.add('text-success');
      } else {
        pwStrength.textContent = 'Password must be at least 8 characters and include letters, numbers and a symbol.';
        pwStrength.classList.remove('text-success');
        pwStrength.classList.add('text-danger');
      }
    });
  }

  // Handle profile form submit
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        alert('Not signed in.');
        return;
      }
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.username === currentUser);
      if (userIndex === -1) {
        alert('User record not found.');
        return;
      }

      const newUsername = document.getElementById('profile-username').value.trim();
      const newEmail = document.getElementById('profile-email-input').value.trim();

      // ensure username not taken by others
      const usernameTaken = users.some((u, idx) => idx !== userIndex && u.username === newUsername);
      if (usernameTaken) {
        alert('Username already taken. Choose another.');
        return;
      }

      // password change handling
      const changePwArea = document.getElementById('password-change-area');
      let newPassword = null;
      if (changePwArea && changePwArea.style.display !== 'none') {
        newPassword = document.getElementById('profile-password').value;
        const confirm = document.getElementById('profile-password-confirm').value;
        if (!newPassword) {
          alert('Enter a new password or hide the password change area.');
          return;
        }
        if (newPassword !== confirm) {
          alert('Password confirmation does not match.');
          return;
        }
        if (!isStrongPassword(newPassword)) {
          alert('Password is not strong enough. Use at least 8 chars with letters, numbers and a symbol.');
          return;
        }
      }

      // apply updates
      users[userIndex].username = newUsername;
      users[userIndex].email = newEmail;
      if (newPassword !== null) users[userIndex].password = newPassword;

      localStorage.setItem('users', JSON.stringify(users));
      // update currentUser key if username changed
      localStorage.setItem('currentUser', newUsername);

      // update profile summary immediately
      loadCurrentUser();

      if (profileModal) profileModal.hide();
      alert('Profile updated successfully.');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      // optionally redirect to portal/login
      window.location.href = 'patient-portal.html';
    });
  }

  // refresh profile summary when coming back to page (optional)
  window.addEventListener('storage', function (e) {
    if (e.key === 'users' || e.key === 'currentUser') loadCurrentUser();
  });

  // Sidebar hamburger menu logic (enhanced accessibility & responsiveness)
  function openSidebarMenu() {
    document.body.classList.add('sidebar-open');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarMenuOverlay');
    const menuBtnEl = document.getElementById('mainMenuBtn');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    if (menuBtnEl) menuBtnEl.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // trap focus inside sidebar
    const focusable = sidebar.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    if (firstFocusable) firstFocusable.focus();

    function handleKey(e) {
      if (e.key === 'Escape') closeSidebarMenu();
      if (e.key === 'Tab') {
        if (focusable.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    sidebar.__keyHandler = handleKey;
    document.addEventListener('keydown', handleKey);
  }
  function closeSidebarMenu() {
    document.body.classList.remove('sidebar-open');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarMenuOverlay');
    const menuBtnEl = document.getElementById('mainMenuBtn');
    if (sidebar) {
      sidebar.classList.remove('active');
      // remove key handler if any
      if (sidebar.__keyHandler) {
        document.removeEventListener('keydown', sidebar.__keyHandler);
        delete sidebar.__keyHandler;
      }
    }
    if (overlay) overlay.classList.remove('active');
    if (menuBtnEl) menuBtnEl.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (menuBtnEl) menuBtnEl.focus();
  }
  // Sidebar menu event listeners (robust): attach overlay & close button listeners regardless of mainMenuBtn presence
  const menuBtn = document.getElementById('mainMenuBtn');
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarMenuOverlay');

  // Attach overlay and close button listeners when sidebar exists
  if (sidebar && overlay) {
    overlay.addEventListener('click', closeSidebarMenu);

    // Ensure close button always closes the sidebar (works even when mainMenuBtn was not present)
    const closeBtn = document.getElementById('sidebarMenuClose');
    if (closeBtn) {
      // defensive: ensure it's a button and has type to avoid form submit side-effects
      try { closeBtn.setAttribute('type', 'button'); } catch (e) {}
      closeBtn.addEventListener('click', closeSidebarMenu);
    }
  }

  // If a hero/mainMenuBtn exists, wire it up (keeps previous behavior)
  if (menuBtn && sidebar && overlay) {
    // ensure ARIA attributes exist
    menuBtn.setAttribute('aria-controls', 'sidebarMenu');
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const expanded = this.getAttribute('aria-expanded') === 'true';
      if (expanded) closeSidebarMenu(); else openSidebarMenu();
    });

    // auto-close on resize beyond mobile breakpoint
    window.addEventListener('resize', () => {
      try {
        if (window.innerWidth > 900 && sidebar.classList.contains('active')) closeSidebarMenu();
      } catch (e) {}
    });
  }

  // New: navbar hamburger (mobile) should toggle the same sidebar
  const navbarHamburger = document.getElementById('navbarHamburgerBtn');
  if (navbarHamburger) {
    navbarHamburger.setAttribute('aria-controls', 'sidebarMenu');
    navbarHamburger.setAttribute('aria-expanded', 'false');
    navbarHamburger.addEventListener('click', function (e) {
      e.preventDefault();
      const expanded = this.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeSidebarMenu();
        this.setAttribute('aria-expanded', 'false');
      } else {
        openSidebarMenu();
        this.setAttribute('aria-expanded', 'true');
      }
    });

    // keep ARIA state in sync when sidebar closed via other controls
    const origClose = document.getElementById('sidebarMenuClose');
    if (origClose) origClose.addEventListener('click', () => {
      if (navbarHamburger) navbarHamburger.setAttribute('aria-expanded', 'false');
    });
    if (overlay) overlay.addEventListener('click', () => {
      if (navbarHamburger) navbarHamburger.setAttribute('aria-expanded', 'false');
    });
  }

  // Password visibility toggle helper (applies to profile modal and any password input with .pw-toggle)
  function installPasswordToggles(scope=document) {
    const pwInputs = scope.querySelectorAll('input[type="password"]');
    pwInputs.forEach(input => {
      if (input.__hasToggle) return;
      // create small toggle button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary ms-2 pw-visibility-toggle';
      btn.setAttribute('aria-pressed', 'false');
      btn.style.verticalAlign = 'middle';
      btn.textContent = 'Show';
      btn.addEventListener('click', () => {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = 'Hide';
          btn.setAttribute('aria-pressed', 'true');
          input.focus();
        } else {
          input.type = 'password';
          btn.textContent = 'Show';
          btn.setAttribute('aria-pressed', 'false');
          input.focus();
        }
      });
      // insert after input if parent allows
      if (input.parentNode) input.parentNode.appendChild(btn);
      input.__hasToggle = true;
    });
  }

  // install toggles on profile modal inputs and sign-up/login forms
  installPasswordToggles(document);
  // also run after dynamic content load (e.g., patient portal sign-up area)
  document.addEventListener('DOMContentLoaded', () => installPasswordToggles(document));

  // Footer newsletter handler
  const footerForm = document.getElementById('footer-newsletter-form');
  const footerEmail = document.getElementById('footer-newsletter-email');
  const footerMsg = document.getElementById('footer-newsletter-message');
  if (footerForm && footerEmail) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = (footerEmail.value || '').trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const lang = localStorage.getItem('lang') || 'en';
      if (!emailRe.test(email)) {
        if (footerMsg) footerMsg.textContent = (translations[lang] && translations[lang]['newsletter.invalid']) || 'Invalid email';
        return;
      }
      const subs = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
      if (!subs.includes(email)) subs.push(email);
      localStorage.setItem('newsletterSubscribers', JSON.stringify(subs));
      if (footerMsg) footerMsg.textContent = (translations[lang] && translations[lang]['newsletter.success']) || 'Subscribed';
      footerEmail.value = '';
      // clear message after 4s
      setTimeout(() => { if (footerMsg) footerMsg.textContent = ''; }, 4000);
    });
  }

  (function () {
    const nav = document.getElementById('mainNavbar');
    if (!nav) return;

    let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    window.addEventListener('scroll', () => {
      const current = window.pageYOffset || document.documentElement.scrollTop;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (current > lastScroll && current > 100) {
            // scrolling down
            nav.classList.add('navbar-hidden');
          } else {
            // scrolling up
            nav.classList.remove('navbar-hidden');
          }
          lastScroll = current <= 0 ? 0 : current;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Ensure navbar is visible when sidebar/menu opens (non-intrusive attempt)
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar) {
      new MutationObserver(() => {
        if (sidebar.classList.contains('open') || sidebar.classList.contains('show')) {
          nav.classList.remove('navbar-hidden');
        }
      }).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
  })();
});