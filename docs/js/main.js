
        (function () {
            'use strict';

            // --- helpers ---
            const $ = (s, root = document) => root.querySelector(s);
            const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
            const createOverlayIfMissing = () => {
                let ov = $('#overlay');
                if (!ov) {
                    ov = document.createElement('div');
                    ov.id = 'overlay';
                    ov.className = 'overlay';
                    ov.setAttribute('aria-hidden', 'true');
                    document.body.appendChild(ov);
                }
                return ov;
            };

            // wait for DOM
            document.addEventListener('DOMContentLoaded', () => {
                try {
                    initMobileDrawer();
                    initPartnersCarousel();
                    initJoinUsForm();
                    initReadMoreToggles();
                    console.log('Frontend: all initializers ran (where applicable).');
                } catch (err) {
                    console.error('Frontend init error:', err);
                }
            });

            // ----------------------------------------
            // Mobile drawer (robust, accessible)
            // ----------------------------------------
            function initMobileDrawer() {
                try {
                    const hamburger = document.querySelector('.hamburger');
                    const drawer = document.getElementById('mobile-menu');
                    if (!hamburger || !drawer) {
                        // nothing to do
                        console.info('Mobile drawer: missing .hamburger or #mobile-menu — skipped');
                        return;
                    }
                    const closeBtn = document.getElementById('close-drawer') || drawer.querySelector('[aria-label="Close menu"]');
                    const overlay = createOverlayIfMissing();
                    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

                    // sane attributes
                    if (!hamburger.hasAttribute('aria-expanded')) hamburger.setAttribute('aria-expanded', 'false');
                    if (!drawer.hasAttribute('aria-hidden')) drawer.setAttribute('aria-hidden', 'true');
                    if (!overlay.hasAttribute('aria-hidden')) overlay.setAttribute('aria-hidden', 'true');

                    let lastFocused = null;
                    let hiddenEls = [];

                    const findElementsToHide = () => Array.from(document.body.children).filter(ch =>
                        ch !== drawer && ch !== overlay && !ch.contains(drawer) && !ch.contains(overlay)
                    );

                    function setHiddenOn(el, val) {
                        if (!el) return;
                        if (val) el.setAttribute('aria-hidden', 'true');
                        else el.removeAttribute('aria-hidden');
                    }

                    function trapTab(e) {
                        if (e.key === 'Escape') { closeMenu(); return; }
                        if (e.key !== 'Tab') return;
                        const focusables = Array.from(drawer.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
                        if (!focusables.length) return;
                        const first = focusables[0], last = focusables[focusables.length - 1];
                        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
                    }

                    function openMenu() {
                        lastFocused = document.activeElement;
                        hamburger.setAttribute('aria-expanded', 'true');
                        drawer.classList.add('open');
                        overlay.classList.add('open');
                        drawer.setAttribute('aria-hidden', 'false');
                        overlay.setAttribute('aria-hidden', 'false');
                        document.body.style.overflow = 'hidden';

                        hiddenEls = findElementsToHide();
                        hiddenEls.forEach(el => setHiddenOn(el, true));

                        const focusables = Array.from(drawer.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
                        (focusables[0] || closeBtn || drawer).focus();

                        document.addEventListener('keydown', trapTab, true);
                    }

                    function closeMenu() {
                        hamburger.setAttribute('aria-expanded', 'false');
                        drawer.classList.remove('open');
                        overlay.classList.remove('open');
                        drawer.setAttribute('aria-hidden', 'true');
                        overlay.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';

                        hiddenEls.forEach(el => setHiddenOn(el, false));
                        hiddenEls = [];

                        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
                        document.removeEventListener('keydown', trapTab, true);
                    }

                    hamburger.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
                        expanded ? closeMenu() : openMenu();
                    });

                    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });
                    overlay.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });

                    // close on link click (nice UX)
                    drawer.addEventListener('click', (e) => {
                        if (e.target.closest('a')) closeMenu();
                    });

                    // ensure close on resize to avoid stuck state
                    window.addEventListener('resize', () => {
                        if (window.innerWidth >= 820 && drawer.classList.contains('open')) closeMenu();
                    });

                    console.log('Mobile drawer initialized');
                } catch (err) {
                    console.error('initMobileDrawer error', err);
                }
            }

            // ----------------------------------------
            // Partners carousel (safe init)
            // ----------------------------------------
            function initPartnersCarousel() {
                try {
                    const partnersRow = document.querySelector('.partners-row');
                    const leftBtn = document.querySelector('.scroll-btn.left');
                    const rightBtn = document.querySelector('.scroll-btn.right');
                    if (!partnersRow || !leftBtn || !rightBtn) {
                        console.info('Partners carousel: required elements missing — skipped');
                        return;
                    }

                    // config
                    const clickScroll = 120;
                    const holdSpeed = 6;
                    const holdDelay = 200;
                    let holdInterval = null;
                    let holdTimeout = null;
                    let isHolding = false;

                    function startHold(direction) {
                        holdInterval = setInterval(() => { partnersRow.scrollLeft += direction * holdSpeed; }, 16);
                    }
                    function stopHold() {
                        clearInterval(holdInterval);
                        clearTimeout(holdTimeout);
                        holdInterval = null;
                        holdTimeout = null;
                        isHolding = false;
                    }

                    function setupButton(btn, direction) {
                        if (!btn) return;
                        btn.addEventListener('pointerdown', () => {
                            isHolding = false;
                            holdTimeout = setTimeout(() => { isHolding = true; startHold(direction); }, holdDelay);
                        });
                        btn.addEventListener('pointerup', () => {
                            if (!isHolding) {
                                partnersRow.scrollBy({ left: direction * clickScroll, behavior: 'smooth' });
                            }
                            stopHold();
                        });
                        btn.addEventListener('pointerleave', () => stopHold());
                        btn.addEventListener('touchcancel', stopHold);
                    }

                    setupButton(leftBtn, -1);
                    setupButton(rightBtn, 1);

                    // subtle auto-scroll
                    let autoSpeed = 0.03;
                    let autoDirection = 1;
                    let isPaused = false;
                    let lastTime = null;
                    let resumeTimeout = null;

                    function pauseAuto() {
                        isPaused = true;
                        if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }
                    }
                    function resumeAuto(shortDelay = 2000) {
                        if (resumeTimeout) clearTimeout(resumeTimeout);
                        resumeTimeout = setTimeout(() => { isPaused = false; lastTime = null; }, shortDelay);
                    }

                    function autoStep(ts) {
                        if (!lastTime) lastTime = ts;
                        const delta = ts - lastTime;
                        lastTime = ts;
                        if (!isPaused) {
                            partnersRow.scrollLeft += autoSpeed * delta * autoDirection;
                            // bounce at ends
                            if (partnersRow.scrollLeft <= 0) {
                                partnersRow.scrollLeft = 0;
                                autoDirection = 1;
                            } else if (partnersRow.scrollLeft + partnersRow.clientWidth >= partnersRow.scrollWidth) {
                                partnersRow.scrollLeft = partnersRow.scrollWidth - partnersRow.clientWidth;
                                autoDirection = -1;
                            }
                        }
                        requestAnimationFrame(autoStep);
                    }
                    requestAnimationFrame(autoStep);

                    // interaction pauses
                    ['mouseenter', 'focusin', 'pointerdown', 'touchstart'].forEach(ev => {
                        partnersRow.addEventListener(ev, pauseAuto, { passive: true });
                    });
                    ['mouseleave', 'focusout', 'pointerup', 'touchend'].forEach(ev => {
                        partnersRow.addEventListener(ev, () => resumeAuto(1500), { passive: true });
                    });

                    // attach pause/resume to buttons too
                    [leftBtn, rightBtn].forEach(btn => {
                        btn.addEventListener('pointerdown', pauseAuto);
                        btn.addEventListener('pointerup', () => resumeAuto(1500));
                        btn.addEventListener('mouseleave', () => resumeAuto(1000));
                    });

                    console.log('Partners carousel initialized');
                } catch (err) {
                    console.error('initPartnersCarousel error', err);
                }
            }

            // ----------------------------------------
            // Join-us: drag/drop file + client validation + submit hook
            // ----------------------------------------
            function initJoinUsForm() {
                try {
                    const form = document.getElementById('apply-form');
                    const drop = document.getElementById('drop');
                    const cvInput = document.getElementById('cv');
                    const fileStatus = document.getElementById('file-status');
                    const fileError = document.getElementById('file-error');
                    if (!form || !drop || !cvInput || !fileStatus || !fileError) {
                        console.info('Join-us form: required elements missing — skipped');
                        return;
                    }

                    const submitBtn = form.querySelector('button[type="submit"]');
                    const sending = document.getElementById('sending'); // optional
                    const result = document.getElementById('result'); // optional

                    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
                    const allowedExt = ['pdf', 'doc', 'docx'];

                    let file = null;

                    function setError(msg) { fileError.textContent = msg || ''; }
                    function setStatus(msg) { fileStatus.textContent = msg || ''; }

                    function validateFile(f) {
                        if (!f) return 'Please attach a CV.';
                        if (f.size > MAX_SIZE) return 'File is too large (max 2 MB).';
                        const ext = (f.name || '').split('.').pop().toLowerCase();
                        if (!allowedExt.includes(ext)) return 'Unsupported file type.';
                        return '';
                    }

                    function updateUI() {
                        const err = validateFile(file);
                        if (err) { setError(err); if (submitBtn) submitBtn.disabled = true; }
                        else { setError(''); if (submitBtn) submitBtn.disabled = false; }
                        setStatus(file ? `${file.name} — ${Math.round(file.size / 1024)} KB` : 'No file chosen');
                    }

                    // interactions
                    drop.addEventListener('click', () => cvInput.click());
                    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cvInput.click(); } });

                    cvInput.addEventListener('change', (e) => { file = e.target.files[0]; updateUI(); });

                    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
                    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
                    drop.addEventListener('drop', (e) => {
                        e.preventDefault(); drop.classList.remove('dragover');
                        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                        if (f) { file = f; cvInput.files = e.dataTransfer.files; updateUI(); }
                    });

                    // submit handler
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        setError(''); if (result) result.textContent = '';
                        const name = (form.querySelector('#name')?.value || '').trim();
                        const email = (form.querySelector('#email')?.value || '').trim();
                        if (!name) { setError('Please type your full name.'); return; }
                        if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setError('Please provide a valid email.'); return; }
                        const fileErr = validateFile(file);
                        if (fileErr) { setError(fileErr); return; }

                        // show sending UI if present
                        if (submitBtn) submitBtn.disabled = true;
                        if (sending) sending.style.display = 'block';

                        const fd = new FormData(form);
                        if (file && !fd.get('cv')) fd.append('cv', file);

                        // NOTE: uses the form.action endpoint — adjust server to accept multipart/form-data
                        fetch(form.action, { method: 'POST', body: fd })
                            .then(async (res) => {
                                if (sending) sending.style.display = 'none';
                                if (submitBtn) submitBtn.disabled = false;
                                if (res.ok) {
                                    if (result) result.textContent = 'Application sent — thank you!';
                                    form.reset();
                                    file = null;
                                    updateUI();
                                } else {
                                    const txt = await res.text();
                                    if (result) result.textContent = 'Server error: ' + (txt || res.statusText);
                                }
                            })
                            .catch((err) => {
                                if (sending) sending.style.display = 'none';
                                if (submitBtn) submitBtn.disabled = false;
                                if (result) result.textContent = 'Network error: ' + err.message;
                            });
                    });

                    // initialise UI
                    updateUI();
                    console.log('Join-us form initialized');
                } catch (err) {
                    console.error('initJoinUsForm error', err);
                }
            }

            // ----------------------------------------
            // Read-more toggles (delegated)
            // ----------------------------------------
            function initReadMoreToggles() {
                try {
                    // delegation: handle both .read-more and .csr-read-more
                    document.addEventListener('click', (e) => {
                        const rm = e.target.closest('.read-more, .csr-read-more');
                        if (!rm) return;
                        const isCSR = rm.classList.contains('csr-read-more');
                        const wrapper = rm.closest(isCSR ? '.csr-description' : '.partner-description');
                        if (!wrapper) return;
                        const text = wrapper.querySelector(isCSR ? '.csr-text-preview' : '.text-preview');
                        if (!text) return;
                        const expanded = text.classList.toggle('expanded');
                        rm.textContent = expanded ? 'Read less' : 'Read more';
                    });
                    console.log('Read-more toggles ready');
                } catch (err) {
                    console.error('initReadMoreToggles error', err);
                }
            }

        })();