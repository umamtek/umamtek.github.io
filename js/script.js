/* ============================================================
   UMAMTEK â€” Shared script.js
   Include on every page AFTER style.css and (if the page uses
   Firebase) after firebase-config.js:
     <script src="script.js"></script>
   ============================================================ */

// ---- CONFIG: update these once you have the real values ----
const UMAMTEK_WHATSAPP_NUMBER = "919065760751"; // country code + number, no + or spaces
const UMAMTEK_PHONE_DISPLAY   = "90657 60751";
const UMAMTEK_EMAIL           = "owner@umamtek.com";

// ---- Mobile nav toggle ----
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav.main-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Highlight the current page in the nav automatically
  const here = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === here) a.classList.add('active');
  });

  // Inject the WhatsApp floating button on every page that includes this script
  if(!document.querySelector('.wa-float')){
    const wa = document.createElement('a');
    wa.href = `https://wa.me/${UMAMTEK_WHATSAPP_NUMBER}`;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.className = 'wa-float';
    wa.setAttribute('aria-label', 'Chat on WhatsApp');
    wa.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9s.8 2.2 1 2.4c.1.1 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.8-1.3C8.4 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.5-1.2l-.3-.2-3.2.8.9-3.1-.2-.3C3.9 14.6 3.4 13.3 3.4 12c0-4.7 3.9-8.6 8.6-8.6s8.6 3.9 8.6 8.6-3.9 8.6-8.6 8.6z"/></svg>`;
    document.body.appendChild(wa);
  }
});

// ---- Helper: show a status message box ----
function showStatus(el, msg, type){
  el.textContent = msg;
  el.className = 'status ' + type;
  el.style.display = 'block';
}

// ---- Helper: validate a 10-digit Indian mobile number ----
function validPhone(v){ return /^[6-9]\d{9}$/.test(v); }

// ---- Helper: turn a 10-digit phone into the hidden synthetic email
//      used for Firebase email/password auth (see firebase-config.js) ----
function phoneToEmail(tenDigits){ return 'p' + tenDigits + '@umamtek-users.app'; }

// ---- Helper: wire up auto-advance + backspace behaviour on a set of
//      6 single-digit OTP <input> boxes inside a container ----
function attachOtpAutoAdvance(containerEl){
  const boxes = [...containerEl.querySelectorAll('input')];
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '');
      if(box.value && i < boxes.length - 1) boxes[i+1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace' && !box.value && i > 0) boxes[i-1].focus();
    });
  });
  return boxes;
}

// ---- Helper: wire a show/hide toggle button next to a password input ----
function attachPasswordToggle(toggleBtn, inputEl){
  toggleBtn.addEventListener('click', () => {
    const isPass = inputEl.type === 'password';
    inputEl.type = isPass ? 'text' : 'password';
    toggleBtn.textContent = isPass ? 'Hide' : 'Show';
  });
}

// ---- Helper: simple password strength score (0-4) + bar painter ----
function passwordScore(v){
  let score = 0;
  if(v.length >= 8) score++;
  if(/[A-Z]/.test(v)) score++;
  if(/[0-9]/.test(v)) score++;
  if(/[^A-Za-z0-9]/.test(v)) score++;
  return score;
}
function paintStrength(barContainerEl, value){
  const bars = [...barContainerEl.querySelectorAll('div')];
  const score = passwordScore(value);
  bars.forEach((bar, i) => {
    bar.style.background = i < score ? 'var(--copper)' : 'rgba(20,24,31,0.12)';
  });
}

// ---- Reusable circuit-schematic SVG background (used in hero sections) ----
function circuitSchematicSVG(){
  return `<svg viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
    <g stroke="rgba(217,148,79,0.28)" stroke-width="1.2" fill="none">
      <path d="M50 80 H220 V260"/>
      <path d="M220 260 H420"/>
      <path d="M220 260 V460 H90"/>
      <path d="M420 260 V520 H260 V620"/>
    </g>
    <g fill="#0B1220" stroke="#D9944F" stroke-width="1.4">
      <circle cx="50" cy="80" r="6"/><circle cx="220" cy="260" r="6"/>
      <circle cx="420" cy="260" r="6"/><circle cx="90" cy="460" r="6"/>
      <circle cx="260" cy="620" r="6"/>
    </g>
  </svg>`;
}