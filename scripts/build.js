#!/usr/bin/env node
/**
 * build.js — Generates index.html from TinaCMS JSON content files.
 * Run via: node scripts/build.js
 * Vercel runs this as part of the build step.
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');

// ── helpers ──────────────────────────────────────────────────────────────────

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, relPath), 'utf8'));
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function imgSrc(p) {
  if (!p) return '';
  return p.replace(/ /g, '%20');
}

// Convert TinaCMS rich-text node → HTML string
function richToHtml(node) {
  if (!node) return '';
  if (node.type === 'text') {
    let t = esc(node.text || '');
    if (node.bold)   t = `<strong>${t}</strong>`;
    if (node.italic) t = `<em>${t}</em>`;
    return t;
  }
  const inner = (node.children || []).map(richToHtml).join('');
  if (node.type === 'p')    return inner;
  if (node.type === 'root') return inner;
  return inner;
}

function stars(n) { return '&#9733;'.repeat(n || 5); }

// ── load content ─────────────────────────────────────────────────────────────

const S  = readJSON('settings/settings.json');
const HP = readJSON('homepage/homepage.json');

const services = [
  readJSON('services/registered-massage-therapy.json'),
  readJSON('services/manual-osteopathic-therapy.json'),
  readJSON('services/cupping-therapy.json'),
].sort((a, b) => a.order - b.order);

const osteo    = readJSON('osteopathy/osteopathy.json');

const training = [
  readJSON('training/advanced-massage-therapy-diploma.json'),
  readJSON('training/manual-osteopathic-therapy-diploma.json'),
  readJSON('training/professional-cupping-therapies.json'),
].sort((a, b) => a.order - b.order);

const reviews = [
  readJSON('reviews/chad-turgeon.json'),
  readJSON('reviews/supernova.json'),
  readJSON('reviews/darlene-jackson.json'),
].sort((a, b) => a.order - b.order);

// ── derived values ────────────────────────────────────────────────────────────

const BOOK_URL   = 'https://ithc.janeapp.com/locations/integrative-therapies-health-collective/book#/staff_member/11';
const phoneDigits = S.phone.replace(/\D/g, '');

// ── section generators ────────────────────────────────────────────────────────

function serviceCards() {
  const delays = ['', ' delay-1', ' delay-2'];
  return services.map((svc, i) => {
    const featured = svc.featured ? ' featured' : '';
    const imgStyle = svc.featured ? ' style="object-position: center 30%;"' : '';
    const imgTag   = svc.image
      ? `\n        <img src="${imgSrc(svc.image)}" alt="${esc(svc.title)}" class="service-img"${imgStyle} />`
      : '';
    return `      <article class="service-card${featured} fade-up${delays[i] || ''}">
        ${imgTag}
        <div class="service-body">
          <div class="service-icon">${svc.icon}</div>
          <h3 class="service-title">${esc(svc.title)}</h3>
          <p class="service-desc">${esc(svc.description)}</p>
          <a href="${BOOK_URL}" class="service-link" target="_blank" rel="noopener noreferrer">Book Now &rarr;</a>
        </div>
      </article>`;
  }).join('\n\n');
}

function osteoFeatureTiles() {
  return (osteo.features || []).map(f => `          <div class="osteo-feature">
            <div class="osteo-feature-title">${esc(f.title)}</div>
            <div class="osteo-feature-desc">${esc(f.description)}</div>
          </div>`).join('\n');
}

function trainingCards() {
  const delays = ['', ' delay-1', ' delay-2'];
  return training.map((c, i) => {
    const sub      = c.dateCompleted ? `${esc(c.institution)} &middot; ${esc(c.dateCompleted)}` : esc(c.institution);
    const imgStyle = c.title.includes('Advanced') ? ' style="object-position: center 30%;"' : '';
    const imgTag   = c.image
      ? `\n        <img src="${imgSrc(c.image)}" alt="${esc(c.title)}" class="training-card-img"${imgStyle} />`
      : '';
    return `      <article class="training-card fade-up${delays[i] || ''}">
        <div class="training-icon">${c.icon}</div>
        <h3 class="training-card-title">${esc(c.title)}</h3>
        <div class="training-card-sub">${sub}</div>${imgTag}
        <p class="training-card-desc">${esc(c.description)}</p>
        <span class="training-badge">${esc(c.badgeLabel)}</span>
      </article>`;
  }).join('\n\n');
}

function reviewCards() {
  const delays = ['', ' delay-1', ' delay-2'];
  return reviews.map((r, i) => {
    const initial = (r.reviewerName || 'G').charAt(0).toUpperCase();
    return `      <article class="review-card fade-up${delays[i] || ''}">
        <div class="review-stars" aria-label="${r.rating} stars">${stars(r.rating)}</div>
        <div class="review-quote-icon" aria-hidden="true">&ldquo;</div>
        <p class="review-text">${esc(r.reviewText)}</p>
        <div class="review-author">
          <div class="review-avatar" aria-hidden="true">${initial}</div>
          <div class="review-author-info">
            <span class="review-name">${esc(r.reviewerName)}</span>
            <span class="review-platform">${esc(r.platform)}</span>
          </div>
        </div>
      </article>`;
  }).join('\n\n');
}

// ── final HTML ────────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(S.businessName)} | Chloe Jackson-Kotko | Saskatoon, SK</title>
  <meta name="description" content="Registered massage therapy and manual osteopathic therapy in Saskatoon, SK. Chloe Jackson-Kotko helps you heal from the root cause. ${esc(S.googleReviewScore)}-star rated. Book online today." />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
  <style>
    /* ============================================================
       DESIGN TOKENS
    ============================================================ */
    :root {
      --blush:      #FAE9E9;
      --taupe:      #C1B0A3;
      --brown:      #825831;
      --dark:       #3D2B1F;
      --cream:      #FEFAF8;
      --brown-dark: #5C3D1E;
      --brown-light: #A06B3C;
      --shadow-sm:  0 2px 12px rgba(61,43,31,0.07);
      --shadow-md:  0 6px 28px rgba(61,43,31,0.11);
      --shadow-lg:  0 16px 56px rgba(61,43,31,0.14);
      --radius:     16px;
      --radius-sm:  10px;
      --transition: 0.3s ease;
    }

    /* ============================================================
       RESET & BASE
    ============================================================ */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      font-size: 16px;
    }

    body {
      font-family: 'Lato', sans-serif;
      font-weight: 400;
      color: var(--dark);
      background: var(--blush);
      line-height: 1.7;
      overflow-x: hidden;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    ul {
      list-style: none;
    }

    /* ============================================================
       TYPOGRAPHY
    ============================================================ */
    h1, h2, h3, h4 {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 500;
      line-height: 1.15;
    }

    .serif { font-family: 'Cormorant Garamond', serif; }

    em {
      font-style: italic;
      color: var(--brown);
    }

    .section-label {
      display: inline-block;
      font-family: 'Lato', sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--brown);
      margin-bottom: 0.75rem;
    }

    .section-label::before {
      content: '';
      display: inline-block;
      width: 24px;
      height: 1.5px;
      background: var(--brown);
      vertical-align: middle;
      margin-right: 10px;
      opacity: 0.6;
    }

    /* ============================================================
       BUTTONS
    ============================================================ */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.75rem 1.75rem;
      border-radius: 100px;
      font-family: 'Lato', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      border: none;
      transition: background var(--transition), color var(--transition),
                  transform var(--transition), box-shadow var(--transition),
                  border-color var(--transition), opacity var(--transition);
      text-decoration: none;
      white-space: nowrap;
    }

    .btn:hover { transform: translateY(-2px); }
    .btn:active { transform: translateY(0); }

    .btn-primary {
      background: var(--brown);
      color: var(--cream);
      box-shadow: 0 4px 18px rgba(130,88,49,0.28);
    }
    .btn-primary:hover {
      background: var(--brown-dark);
      box-shadow: 0 6px 24px rgba(130,88,49,0.38);
    }

    .btn-outline {
      background: transparent;
      color: var(--brown);
      border: 2px solid var(--brown);
    }
    .btn-outline:hover {
      background: rgba(130,88,49,0.06);
    }

    .btn-cream {
      background: var(--cream);
      color: var(--brown);
      box-shadow: 0 4px 18px rgba(254,250,248,0.2);
    }
    .btn-cream:hover {
      background: var(--blush);
      box-shadow: 0 6px 24px rgba(254,250,248,0.32);
    }

    .btn-outline-cream {
      background: transparent;
      color: var(--cream);
      border: 2px solid rgba(254,250,248,0.4);
    }
    .btn-outline-cream:hover {
      border-color: var(--cream);
      background: rgba(254,250,248,0.08);
    }

    .btn-lg {
      padding: 1rem 2.25rem;
      font-size: 0.95rem;
    }

    /* ============================================================
       FADE-UP ANIMATIONS
    ============================================================ */
    .fade-up {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .delay-1 { transition-delay: 0.1s; }
    .delay-2 { transition-delay: 0.2s; }
    .delay-3 { transition-delay: 0.3s; }
    .delay-4 { transition-delay: 0.4s; }

    /* ============================================================
       NAV
    ============================================================ */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 5%;
      background: rgba(250,233,233,0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: box-shadow var(--transition), background var(--transition);
    }

    nav.scrolled {
      box-shadow: var(--shadow-sm);
      background: rgba(250,233,233,0.97);
    }

    .nav-brand { display: flex; align-items: center; gap: 10px; }

    .nav-logo-img {
      height: 48px;
      width: auto;
      display: block;
      border-radius: 50%;
    }

    .nav-links {
      display: flex;
      gap: 2.25rem;
      list-style: none;
    }

    .nav-links a {
      font-family: 'Lato', sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--dark);
      opacity: 0.75;
      transition: opacity var(--transition), color var(--transition);
    }

    .nav-links a:hover {
      opacity: 1;
      color: var(--brown);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      background: none;
      border: none;
      padding: 4px;
    }

    .hamburger span {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--dark);
      border-radius: 2px;
      transition: all var(--transition);
    }

    .hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    .mobile-menu {
      display: none;
      flex-direction: column;
      gap: 0.5rem;
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: rgba(250,233,233,0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 1.5rem 5%;
      box-shadow: var(--shadow-md);
      z-index: 99;
      transform: translateY(-10px);
      opacity: 0;
      transition: opacity var(--transition), transform var(--transition);
      pointer-events: none;
    }

    .mobile-menu.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    .mobile-nav-link {
      font-family: 'Lato', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--dark);
      padding: 0.65rem 0;
      border-bottom: 1px solid rgba(61,43,31,0.07);
      letter-spacing: 0.04em;
      transition: color var(--transition);
    }

    .mobile-nav-link:hover { color: var(--brown); }

    .mobile-menu .btn {
      margin-top: 0.75rem;
      width: 100%;
      justify-content: center;
    }

    /* ============================================================
       HERO
    ============================================================ */
    #hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      padding-top: 72px;
    }

    .hero-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 6rem 6% 6rem 8%;
      background: var(--blush);
    }

    .hero-logo { margin-bottom: 2rem; }

    .hero-logo-img {
      height: 90px;
      width: auto;
      border-radius: 50%;
    }

    .hero-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
    }

    .hero-eyebrow-line {
      display: block;
      width: 32px;
      height: 1.5px;
      background: var(--brown);
      opacity: 0.5;
    }

    .hero-eyebrow-text {
      font-family: 'Lato', sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--brown);
      opacity: 0.75;
    }

    .hero-heading {
      font-size: clamp(2.8rem, 4.5vw, 4rem);
      font-weight: 500;
      line-height: 1.1;
      color: var(--dark);
      margin-bottom: 1.25rem;
    }

    .italic-brown {
      font-style: italic;
      color: var(--brown);
    }

    .hero-sub {
      font-size: 1.05rem;
      color: var(--dark);
      opacity: 0.7;
      line-height: 1.75;
      max-width: 440px;
      margin-bottom: 2.25rem;
    }

    .hero-ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .hero-rating {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hero-stars {
      color: #F5A623;
      font-size: 1rem;
      letter-spacing: 2px;
    }

    .hero-rating-text {
      font-family: 'Lato', sans-serif;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--dark);
      opacity: 0.6;
    }

    .hero-right {
      position: relative;
      overflow: hidden;
      background: var(--taupe);
    }

    .hero-right img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }

    .hero-fade {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, var(--blush) 0%, rgba(250,233,233,0.15) 12%, transparent 28%);
      pointer-events: none;
    }

    /* ============================================================
       ABOUT
    ============================================================ */
    #about {
      background: var(--cream);
      padding: 7rem 8%;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 0.85fr 1.15fr;
      gap: 5rem;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2%;
    }

    .about-image-wrap {
      position: relative;
    }

    .about-image-wrap img {
      width: 100%;
      height: 560px;
      object-fit: cover;
      object-position: center 65%;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
    }

    .about-badge {
      position: absolute;
      bottom: 20px;
      right: -20px;
      background: var(--brown);
      color: var(--cream);
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      text-align: center;
      box-shadow: var(--shadow-md);
    }

    .about-badge-stars {
      display: block;
      color: #F5A623;
      font-size: 0.9rem;
      letter-spacing: 3px;
      margin-bottom: 4px;
    }

    .about-badge-text {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .about-content h2 {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      margin-bottom: 1.25rem;
      color: var(--dark);
    }

    .about-body {
      font-size: 1rem;
      color: var(--dark);
      opacity: 0.75;
      line-height: 1.85;
      margin-bottom: 2rem;
    }

    .about-cards {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .about-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--blush);
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
    }

    .about-card-icon {
      font-size: 1.1rem;
      margin-top: 2px;
    }

    .about-card-text {
      font-size: 0.88rem;
      color: var(--dark);
      opacity: 0.72;
      line-height: 1.6;
    }

    .about-card-label {
      display: block;
      font-weight: 700;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brown);
      margin-bottom: 3px;
    }

    /* ============================================================
       SERVICES
    ============================================================ */
    #services {
      background: var(--blush);
      padding: 7rem 8%;
    }

    .services-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 3.5rem;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      gap: 2rem;
    }

    .services-header-left h2 {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      color: var(--dark);
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .service-card {
      background: var(--cream);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition), box-shadow var(--transition);
      display: flex;
      flex-direction: column;
    }

    .service-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
    }

    .service-card.featured {
      background: var(--brown);
    }

    .service-card.featured .service-icon,
    .service-card.featured .service-title,
    .service-card.featured .service-desc {
      color: var(--cream);
    }

    .service-card.featured .service-link {
      color: var(--blush);
      opacity: 0.9;
    }

    .service-card.featured .service-link:hover {
      opacity: 1;
    }

    .service-img {
      width: 100%;
      height: 240px;
      object-fit: cover;
      object-position: center center;
    }

    .service-body {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .service-icon {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .service-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.35rem;
      font-weight: 500;
      margin-bottom: 0.6rem;
      color: var(--dark);
    }

    .service-desc {
      font-size: 0.9rem;
      color: var(--dark);
      opacity: 0.72;
      line-height: 1.7;
      flex: 1;
    }

    .service-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 1.25rem;
      font-family: 'Lato', sans-serif;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--brown);
      transition: gap var(--transition), color var(--transition);
    }

    .service-link:hover {
      gap: 10px;
      color: var(--brown-dark);
    }

    /* ============================================================
       OSTEOPATHY SECTION
    ============================================================ */
    #osteopathy {
      background: var(--cream);
      padding: 7rem 8%;
    }

    .osteo-grid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 5rem;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .osteo-left h2 {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      margin-bottom: 1.25rem;
      color: var(--dark);
    }

    .osteo-para {
      font-size: 1rem;
      color: var(--dark);
      opacity: 0.75;
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    .osteo-para strong {
      color: var(--dark);
      opacity: 1;
      font-weight: 700;
    }

    .osteo-features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
      margin: 2rem 0;
    }

    .osteo-feature {
      background: var(--blush);
      border-left: 3px solid var(--brown);
      padding: 1rem 1.1rem;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }

    .osteo-feature-title {
      font-family: 'Lato', sans-serif;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--brown);
      letter-spacing: 0.03em;
      margin-bottom: 0.3rem;
    }

    .osteo-feature-desc {
      font-size: 0.84rem;
      color: var(--dark);
      opacity: 0.7;
      line-height: 1.55;
    }

    .osteo-right {
      position: relative;
    }

    .osteo-img-main {
      width: 100%;
      height: 580px;
      object-fit: cover;
      object-position: center 20%;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
    }

    .osteo-img-overlay {
      position: absolute;
      bottom: -30px;
      left: -30px;
      width: 48%;
      height: 220px;
      object-fit: cover;
      border-radius: var(--radius);
      border: 5px solid var(--cream);
      box-shadow: var(--shadow-md);
    }

    /* ============================================================
       TRAINING
    ============================================================ */
    #training {
      background: var(--blush);
      padding: 7rem 8%;
    }

    .training-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }

    .training-header h2 {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      color: var(--dark);
    }

    .training-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .training-card {
      background: var(--cream);
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition), box-shadow var(--transition);
      display: flex;
      flex-direction: column;
    }

    .training-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
    }

    .training-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .training-card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.35rem;
      font-weight: 500;
      color: var(--dark);
      margin-bottom: 0.25rem;
    }

    .training-card-sub {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--brown);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 0.8rem;
    }

    .training-card-img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      object-position: center center;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
    }

    .training-card-desc {
      font-size: 0.9rem;
      color: var(--dark);
      opacity: 0.72;
      line-height: 1.7;
      flex: 1;
    }

    .training-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 1.25rem;
      background: rgba(130,88,49,0.1);
      color: var(--brown);
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      align-self: flex-start;
    }

    /* ============================================================
       REVIEWS
    ============================================================ */
    #reviews {
      background: var(--cream);
      padding: 7rem 8%;
    }

    .reviews-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3.5rem;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .reviews-header h2 {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      color: var(--dark);
    }

    .reviews-score-box {
      background: var(--brown);
      color: var(--cream);
      padding: 1.25rem 1.75rem;
      border-radius: var(--radius);
      text-align: center;
      flex-shrink: 0;
    }

    .reviews-score-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.5rem;
      font-weight: 500;
      line-height: 1;
      display: block;
    }

    .reviews-score-stars {
      color: #F5A623;
      font-size: 1rem;
      letter-spacing: 2px;
      display: block;
      margin: 4px 0;
    }

    .reviews-score-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .review-card {
      background: var(--blush);
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition);
      display: flex;
      flex-direction: column;
    }

    .review-card:hover {
      transform: translateY(-4px);
    }

    .review-stars {
      color: #F5A623;
      font-size: 1rem;
      letter-spacing: 2px;
      margin-bottom: 1rem;
    }

    .review-quote-icon {
      font-family: 'Cormorant Garamond', serif;
      font-size: 4rem;
      color: var(--taupe);
      line-height: 0.6;
      opacity: 0.5;
      margin-bottom: 0.5rem;
    }

    .review-text {
      font-size: 1rem;
      font-style: italic;
      font-family: 'Cormorant Garamond', serif;
      color: var(--dark);
      line-height: 1.65;
      flex: 1;
      font-weight: 400;
    }

    .review-author {
      margin-top: 1.25rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .review-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--brown);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cream);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-weight: 500;
      flex-shrink: 0;
    }

    .review-author-info {
      display: flex;
      flex-direction: column;
    }

    .review-name {
      font-weight: 700;
      font-size: 0.88rem;
      color: var(--dark);
    }

    .review-platform {
      font-size: 0.75rem;
      color: var(--taupe);
      font-weight: 400;
    }

    /* ============================================================
       CANCELLATION POLICY
    ============================================================ */
    #cancellation {
      background: var(--blush);
      padding: 5rem 8%;
    }

    .cancel-inner {
      max-width: 860px;
      margin: 0 auto;
    }

    .cancel-inner h2 {
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      color: var(--dark);
      margin-bottom: 1rem;
    }

    .cancel-intro {
      font-size: 0.95rem;
      color: var(--dark);
      opacity: 0.7;
      margin-bottom: 2rem;
      line-height: 1.7;
    }

    .cancel-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }

    .cancel-card {
      background: var(--cream);
      border-radius: var(--radius);
      padding: 1.5rem 1.4rem;
      box-shadow: var(--shadow-sm);
      border-top: 3px solid var(--brown);
    }

    .cancel-card-pct {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.2rem;
      font-weight: 500;
      color: var(--brown);
      line-height: 1;
      margin-bottom: 0.4rem;
    }

    .cancel-card-label {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--dark);
      margin-bottom: 0.5rem;
    }

    .cancel-card-desc {
      font-size: 0.875rem;
      color: var(--dark);
      opacity: 0.68;
      line-height: 1.6;
    }

    .cancel-note {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: rgba(130,88,49,0.07);
      border-left: 3px solid var(--brown);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      padding: 1rem 1.25rem;
      font-size: 0.88rem;
      color: var(--dark);
      line-height: 1.65;
    }

    .cancel-note-icon {
      font-size: 1rem;
      margin-top: 2px;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      #cancellation { padding: 4rem 5%; }
      .cancel-cards { grid-template-columns: 1fr; }
    }

    /* ============================================================
       BOOKING CTA
    ============================================================ */
    #booking {
      background: var(--brown);
      padding: 7rem 8%;
      text-align: center;
    }

    .booking-inner {
      max-width: 700px;
      margin: 0 auto;
    }

    #booking h2 {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      color: var(--cream);
      margin-bottom: 1rem;
    }

    #booking h2 em {
      color: var(--blush);
    }

    .booking-sub {
      font-size: 1.05rem;
      color: var(--blush);
      opacity: 0.85;
      margin-bottom: 2.5rem;
      line-height: 1.7;
    }

    .booking-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .booking-location {
      font-family: 'Lato', sans-serif;
      font-size: 0.85rem;
      color: var(--blush);
      opacity: 0.7;
      letter-spacing: 0.03em;
    }

    /* ============================================================
       FOOTER
    ============================================================ */
    footer {
      background: var(--dark);
      color: var(--blush);
      padding: 5rem 8% 0;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.8fr 1fr 1fr 1.2fr;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    .footer-logo-img {
      height: 72px;
      width: auto;
      display: block;
      margin-bottom: 0.75rem;
      border-radius: 50%;
    }

    .footer-brand-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--blush);
      margin-bottom: 0.2rem;
    }

    .footer-tagline {
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--taupe);
      margin-bottom: 0.9rem;
    }

    .footer-desc {
      font-size: 0.88rem;
      color: var(--blush);
      opacity: 0.55;
      line-height: 1.75;
      margin-bottom: 1.5rem;
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1.5px solid rgba(250,233,233,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all var(--transition);
      color: var(--blush);
      opacity: 0.7;
    }

    .social-link:hover {
      opacity: 1;
      border-color: var(--taupe);
      background: rgba(250,233,233,0.08);
      transform: translateY(-2px);
    }

    .footer-col h4 {
      font-family: 'Lato', sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--taupe);
      margin-bottom: 1.25rem;
    }

    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .footer-links a {
      font-size: 0.88rem;
      color: var(--blush);
      opacity: 0.6;
      transition: opacity var(--transition), color var(--transition);
    }

    .footer-links a:hover {
      opacity: 1;
      color: var(--blush);
    }

    .footer-contact-item {
      display: flex;
      gap: 10px;
      margin-bottom: 0.85rem;
      align-items: flex-start;
    }

    .footer-contact-icon {
      font-size: 0.9rem;
      margin-top: 2px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .footer-contact-text {
      font-size: 0.88rem;
      color: var(--blush);
      opacity: 0.6;
      line-height: 1.55;
    }

    .footer-contact-text a {
      color: var(--blush);
      opacity: 0.6;
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: opacity var(--transition);
    }

    .footer-contact-text a:hover {
      opacity: 1;
    }

    .footer-note {
      font-size: 0.75rem;
      color: var(--brown);
      font-weight: 700;
      font-style: italic;
      margin-top: 2px;
      opacity: 1;
    }

    .footer-bar {
      border-top: 1px solid rgba(250,233,233,0.08);
      padding: 1.5rem 0;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-copyright {
      font-size: 0.8rem;
      color: var(--blush);
      opacity: 0.35;
    }

    .footer-made {
      font-size: 0.8rem;
      color: var(--blush);
      opacity: 0.35;
    }

    /* ============================================================
       RESPONSIVE — 1024px
    ============================================================ */
    @media (max-width: 1024px) {
      #hero {
        grid-template-columns: 1fr 1fr;
      }

      .hero-left {
        padding: 5rem 4% 5rem 5%;
      }

      .about-grid {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        padding: 0;
      }

      .osteo-grid {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
      }

      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
      }
    }

    /* ============================================================
       RESPONSIVE — 768px
    ============================================================ */
    @media (max-width: 768px) {
      .nav-links,
      .nav-right .btn {
        display: none;
      }

      .hamburger {
        display: flex;
      }

      #hero {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .hero-left {
        padding: 5rem 5% 3rem;
        order: 2;
      }

      .hero-right {
        order: 1;
        height: 55vw;
        max-height: 420px;
      }

      .hero-fade {
        background: linear-gradient(to bottom, transparent 70%, var(--blush) 100%);
      }

      .hero-ctas {
        flex-direction: column;
        align-items: flex-start;
      }

      .hero-ctas .btn {
        width: 100%;
        justify-content: center;
      }

      #about {
        padding: 5rem 5%;
      }

      .about-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }

      .about-badge {
        right: 12px;
      }

      #services {
        padding: 5rem 5%;
      }

      .services-header {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 2.5rem;
      }

      .services-grid {
        grid-template-columns: 1fr;
      }

      #osteopathy {
        padding: 5rem 5%;
      }

      .osteo-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .osteo-right {
        order: -1;
      }

      .osteo-img-main {
        height: 420px;
      }

      .osteo-img-overlay {
        width: 42%;
        height: 170px;
        bottom: -20px;
        left: -10px;
      }

      #training {
        padding: 5rem 5%;
      }

      .training-grid {
        grid-template-columns: 1fr;
      }

      #reviews {
        padding: 5rem 5%;
      }

      .reviews-header {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 2.5rem;
      }

      .reviews-grid {
        grid-template-columns: 1fr;
      }

      #booking {
        padding: 5rem 5%;
      }

      .booking-buttons {
        flex-direction: column;
        align-items: center;
      }

      .booking-buttons .btn {
        width: 100%;
        max-width: 380px;
        justify-content: center;
      }

      footer {
        padding: 4rem 5% 0;
      }

      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }

    /* ============================================================
       RESPONSIVE — 480px
    ============================================================ */
    @media (max-width: 480px) {
      .hero-heading {
        font-size: clamp(2.2rem, 9vw, 3rem);
      }

      .osteo-features {
        grid-template-columns: 1fr;
      }

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-bar {
        flex-direction: column;
        text-align: center;
      }

      .about-image-wrap img {
        height: 380px;
      }
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav id="main-nav" role="navigation" aria-label="Main navigation">
    <a href="#hero" class="nav-brand" aria-label="${esc(S.businessName)} home">
      <img src="logo.png" alt="${esc(S.businessName)}" class="nav-logo-img" />
    </a>

    <ul class="nav-links" role="list">
      <li><a href="#about">About</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#osteopathy">Manual Osteopathic Therapy</a></li>
      <li><a href="#training">Training</a></li>
      <li><a href="#reviews">Reviews</a></li>
    </ul>

    <div class="nav-right">
      <a href="${BOOK_URL}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Book Now</a>
      <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" id="mobile-menu" role="navigation" aria-label="Mobile navigation">
    <a href="#about" class="mobile-nav-link">About</a>
    <a href="#services" class="mobile-nav-link">Services</a>
    <a href="#osteopathy" class="mobile-nav-link">Manual Osteopathic Therapy</a>
    <a href="#training" class="mobile-nav-link">Training</a>
    <a href="#reviews" class="mobile-nav-link">Reviews</a>
    <a href="${BOOK_URL}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">&#128197; Book Online</a>
  </div>

  <!-- HERO -->
  <section id="hero" aria-label="Hero">
    <div class="hero-left">
      <div class="hero-logo fade-up">
        <img src="logo.png" alt="${esc(S.businessName)}" class="hero-logo-img" />
      </div>
      <div class="hero-eyebrow fade-up delay-1">
        <span class="hero-eyebrow-line"></span>
        <span class="hero-eyebrow-text">Saskatoon, Saskatchewan</span>
      </div>
      <h1 class="hero-heading fade-up delay-2">
        ${esc(HP.hero.headingLine1)}<br>
        <span class="italic-brown">${esc(HP.hero.headingLine2)}</span>
      </h1>
      <p class="hero-sub fade-up delay-3">${esc(HP.hero.subtext)}</p>
      <div class="hero-ctas fade-up delay-3">
        <a href="${BOOK_URL}" class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
          &#128197; ${esc(HP.hero.ctaPrimaryLabel)}
        </a>
        <a href="tel:${phoneDigits}" class="btn btn-outline btn-lg">
          &#128241; ${esc(HP.hero.ctaSecondaryLabel)}
        </a>
      </div>
      <div class="hero-rating fade-up delay-4">
        <span class="hero-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span class="hero-rating-text">${esc(S.googleReviewScore)} &middot; Google Reviews</span>
      </div>
    </div>

    <div class="hero-right">
      <img src="${imgSrc(HP.hero.heroImage)}" alt="Chloe Jackson-Kotko performing massage therapy" />
      <div class="hero-fade" aria-hidden="true"></div>
    </div>
  </section>

  <!-- ABOUT -->
  <section id="about" aria-label="About ${esc(HP.about.therapistName)} ${esc(HP.about.therapistNameItalic)}">
    <div class="about-grid">
      <div class="about-image-wrap fade-up">
        <img src="${imgSrc(HP.about.photo)}" alt="${esc(HP.about.therapistName)} ${esc(HP.about.therapistNameItalic)}, Registered Massage Therapist" />
        <div class="about-badge" aria-label="${esc(S.googleReviewScore)} star Google reviews">
          <span class="about-badge-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span class="about-badge-text">Google Reviews</span>
        </div>
      </div>

      <div class="about-content">
        <span class="section-label fade-up">Meet Your Therapist</span>
        <h2 class="fade-up delay-1">${esc(HP.about.therapistName)} <em>${esc(HP.about.therapistNameItalic)}</em></h2>
        <p class="about-body fade-up delay-2">${esc(HP.about.bio)}</p>
        <div class="about-cards">
          <div class="about-card fade-up delay-2">
            <span class="about-card-icon">&#128205;</span>
            <div class="about-card-text">
              <span class="about-card-label">Location</span>
              ${esc(HP.about.location)}
            </div>
          </div>
          <div class="about-card fade-up delay-3">
            <span class="about-card-icon">&#128222;</span>
            <div class="about-card-text">
              <span class="about-card-label">Contact</span>
              ${esc(S.phone)} &mdash; ${esc(HP.about.contactNote)}
            </div>
          </div>
          <div class="about-card fade-up delay-4">
            <span class="about-card-icon">&#127973;</span>
            <div class="about-card-text">
              <span class="about-card-label">Credentials</span>
              ${esc(HP.about.credentials)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section id="services" aria-label="Services">
    <div class="services-header">
      <div class="services-header-left">
        <span class="section-label fade-up">What I Offer</span>
        <h2 class="fade-up delay-1">Treatments &amp; <em>Services</em></h2>
      </div>
      <a href="${BOOK_URL}" class="btn btn-outline fade-up delay-1" target="_blank" rel="noopener noreferrer">View All &amp; Book</a>
    </div>

    <div class="services-grid">
${serviceCards()}
    </div>
  </section>

  <!-- WHAT IS MANUAL OSTEOPATHY -->
  <section id="osteopathy" aria-label="What is Manual Osteopathy">
    <div class="osteo-grid">
      <div class="osteo-left">
        <span class="section-label fade-up">${esc(osteo.sectionLabel)}</span>
        <h2 class="fade-up delay-1">${esc(osteo.heading)} <em>${esc(osteo.headingItalic)}</em></h2>
        <p class="osteo-para fade-up delay-2">${richToHtml(osteo.paragraph1)}</p>
        <p class="osteo-para fade-up delay-2">${richToHtml(osteo.paragraph2)}</p>
        <div class="osteo-features fade-up delay-3">
${osteoFeatureTiles()}
        </div>
        <a href="${BOOK_URL}" class="btn btn-primary fade-up delay-4" target="_blank" rel="noopener noreferrer">${esc(osteo.ctaLabel)}</a>
      </div>

      <div class="osteo-right fade-up delay-1">
        <img src="${imgSrc(osteo.mainImage)}" alt="Chloe performing manual osteopathic therapy" class="osteo-img-main" />
        <img src="${imgSrc(osteo.overlayImage)}" alt="Manual osteopathic spinal adjustment" class="osteo-img-overlay" style="filter: grayscale(20%); object-position: center 30%;" />
      </div>
    </div>
  </section>

  <!-- TRAINING & EDUCATION -->
  <section id="training" aria-label="Training and Education">
    <div class="training-header">
      <span class="section-label fade-up">Qualifications</span>
      <h2 class="fade-up delay-1">Training &amp; <em>Continuing Education</em></h2>
    </div>

    <div class="training-grid">
${trainingCards()}
    </div>
  </section>

  <!-- REVIEWS -->
  <section id="reviews" aria-label="Client Reviews">
    <div class="reviews-header">
      <div>
        <span class="section-label fade-up">Testimonials</span>
        <h2 class="fade-up delay-1">What Clients <em>Are Saying</em></h2>
      </div>
      <div class="reviews-score-box fade-up delay-1" aria-label="${esc(S.googleReviewScore)} stars based on Google reviews">
        <span class="reviews-score-num">${esc(S.googleReviewScore)}</span>
        <span class="reviews-score-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span class="reviews-score-label">Based on Google reviews</span>
      </div>
    </div>

    <div class="reviews-grid">
${reviewCards()}
    </div>
  </section>

  <!-- CANCELLATION POLICY -->
  <section id="cancellation" aria-label="Cancellation Policy">
    <div class="cancel-inner">
      <span class="section-label fade-up">Policies</span>
      <h2 class="fade-up delay-1">Cancellation <em>Policy</em></h2>
      <p class="cancel-intro fade-up delay-2">
        Your appointment time is reserved especially for you. To respect everyone&rsquo;s schedule, please review the cancellation policy below.
      </p>
      <div class="cancel-cards fade-up delay-2">
        <div class="cancel-card">
          <div class="cancel-card-pct">50%</div>
          <div class="cancel-card-label">Cancelled within 12 hours</div>
          <div class="cancel-card-desc">A 50% charge applies if the appointment is cancelled within 12 hours of the scheduled time.</div>
        </div>
        <div class="cancel-card">
          <div class="cancel-card-pct">100%</div>
          <div class="cancel-card-label">Cancelled within 6 hours</div>
          <div class="cancel-card-desc">The full session fee will be charged if cancelled within 6 hours of the scheduled time.</div>
        </div>
        <div class="cancel-card">
          <div class="cancel-card-pct">100%</div>
          <div class="cancel-card-label">No Show</div>
          <div class="cancel-card-desc">The full session fee will be charged for missed appointments without prior notice.</div>
        </div>
      </div>
      <div class="cancel-note fade-up delay-3">
        <span class="cancel-note-icon">&#128179;</span>
        <span>Your credit card on file will be charged within <strong>24 hours</strong> of the missed or late-cancelled appointment if I have not been contacted. Please reach out as soon as possible if you need to make changes &mdash; texting is the fastest way to reach me.</span>
      </div>
    </div>
  </section>

  <!-- BOOKING CTA -->
  <section id="booking" aria-label="Book your session">
    <div class="booking-inner">
      <img src="logo.png" alt="" aria-hidden="true" class="fade-up" style="height:100px;width:auto;margin:0 auto 1.5rem;display:block;opacity:0.9;" />
      <span class="section-label fade-up" style="color: var(--blush); opacity: 0.7;">Ready to Feel Better?</span>
      <h2 class="fade-up delay-1">${esc(HP.bookingCta.heading)} <em>${esc(HP.bookingCta.headingItalic)}</em></h2>
      <p class="booking-sub fade-up delay-2">${esc(HP.bookingCta.subtext)}</p>
      <div class="booking-buttons fade-up delay-3">
        <a href="${BOOK_URL}" class="btn btn-cream btn-lg" target="_blank" rel="noopener noreferrer">
          &#128197; Book Online &mdash; Jane App
        </a>
        <a href="sms:${phoneDigits}" class="btn btn-outline-cream btn-lg">
          &#128172; Text: ${esc(S.phone)}
        </a>
        <a href="tel:${phoneDigits}" class="btn btn-outline-cream btn-lg">
          &#128222; Call: ${esc(S.phone)}
        </a>
      </div>
      <p class="booking-location fade-up delay-4">
        &#128205; ${esc(S.address)} &middot; ${esc(S.city)}
      </p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-grid">
      <div class="footer-col-brand">
        <img src="logo.png" alt="${esc(S.businessName)}" class="footer-logo-img" />
        <div class="footer-brand-name">Bee Relieved</div>
        <div class="footer-tagline">Massage &amp; Manual Osteopathic Therapy</div>
        <p class="footer-desc">
          Registered massage and manual osteopathic therapy in Saskatoon, SK. Chloe Jackson-Kotko helps you find real, lasting relief by treating the root cause &mdash; not just the symptoms.
        </p>
        <div class="social-links">
          <a href="${esc(S.instagramUrl)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="${esc(S.facebookUrl)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul class="footer-links" role="list">
          <li><a href="#about">About Chloe</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#osteopathy">Manual Osteopathic Therapy</a></li>
          <li><a href="#training">Training &amp; Education</a></li>
          <li><a href="#reviews">Client Reviews</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Services</h4>
        <ul class="footer-links" role="list">
          <li><a href="${BOOK_URL}" target="_blank" rel="noopener noreferrer">Registered Massage Therapy</a></li>
          <li><a href="${BOOK_URL}" target="_blank" rel="noopener noreferrer">Manual Osteopathic Therapy</a></li>
          <li><a href="${BOOK_URL}" target="_blank" rel="noopener noreferrer">Cupping Therapy</a></li>
          <li><a href="${BOOK_URL}" target="_blank" rel="noopener noreferrer">Book Online</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact</h4>
        <div class="footer-contact-item">
          <span class="footer-contact-icon">&#128205;</span>
          <div class="footer-contact-text">
            ${esc(S.address)}<br>${esc(S.city)}
          </div>
        </div>
        <div class="footer-contact-item">
          <span class="footer-contact-icon">&#128222;</span>
          <div class="footer-contact-text">
            <a href="tel:${phoneDigits}">${esc(S.phone)}</a><br>
            <span class="footer-note">Texting is fastest!</span>
          </div>
        </div>
        <div class="footer-contact-item">
          <span class="footer-contact-icon">&#128197;</span>
          <div class="footer-contact-text">
            <a href="${BOOK_URL}" target="_blank" rel="noopener noreferrer">Book via Jane App</a>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span class="footer-copyright">&copy; ${new Date().getFullYear()} ${esc(S.businessName)} &middot; Chloe Jackson-Kotko &middot; Saskatoon, SK</span>
      <span class="footer-made">All rights reserved</span>
    </div>
  </footer>

  <script>
    // ---- Hamburger menu ----
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.mobile-nav-link, .mobile-menu .btn').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // ---- Nav scroll shadow ----
    var nav = document.getElementById('main-nav');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // ---- Fade-up IntersectionObserver ----
    var fadeElements = document.querySelectorAll('.fade-up');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      fadeElements.forEach(function (el) { observer.observe(el); });
    } else {
      fadeElements.forEach(function (el) { el.classList.add('visible'); });
    }

    // ---- Smooth scroll ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var navHeight = nav.offsetHeight;
          var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });
    });
  </script>
</body>
</html>`;

// ── write output ──────────────────────────────────────────────────────────────

const outPath = path.join(ROOT, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`✅  index.html generated (${(html.length / 1024).toFixed(1)} KB)`);
