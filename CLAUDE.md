# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing site for **오도독 (ODODOK)**, a Korean marketing agency, hosted on GitHub Pages at `https://dongmin1.github.io/Ododok/`. There is no build step, package manager, framework, or test suite — it's hand-written HTML/CSS/vanilla JS deployed as-is.

## Working with this repo

- **No build/lint/test commands exist.** Edit files directly and preview by opening the HTML file in a browser, or serve the folder locally, e.g. `npx serve .` or `python -m http.server` from the repo root, then visit `index.html` / `project001.html`.
- Deployment is: commit and push to `main` (GitHub Pages serves directly from the repo). There is no CI.
- Site copy is entirely in Korean; preserve tone and existing phrasing style when editing content.

## File structure and what's actually live

- `index.html` — the single-page main site (header, hero, about, diagnosis form, process/difference, project showcase, blog/contact, footer). All sections are anchor-linked (`#about`, `#diagnosis`, `#project`, `#journal`, `#contact`) from the nav.
- `project001.html` — standalone detail page for "PROJECT 001", styled with its own inline `<style>` block plus the shared `css/style.css`. Linked from `index.html`'s project section.
- `css/style.css` — **the only stylesheet actually loaded by either HTML page.** It's a single dense file (minified-style, many rules per line) covering resets, layout, components, and responsive breakpoints (1000px, 720px, 380px) all in one place.
- `js/main.js` — the only script, vanilla JS, no dependencies. Handles: header scroll state + scroll-progress bar, mobile nav toggle (with Escape-to-close), scroll-reveal via `IntersectionObserver` (`.reveal`/`.visible` classes), and the diagnosis form (see below).
- `css/animation.css`, `css/blog.css`, `css/components.css`, `css/layout.css`, `css/reset.css`, `css/responsive.css`, `css/v4.css`, `css/variables.css`, `css/why.css` — **not referenced by any HTML file.** These are leftover/unused stylesheets from earlier iterations. Don't assume edits here have any effect on the live site; if consolidating or cleaning up, confirm with the user before deleting.
- `assets/` — logos, favicon, hero image, OG image, KakaoTalk QR.
- `manifest.json`, `robots.txt`, `sitemap.xml`, `google175bcd44b4633bce.html` — PWA manifest, SEO/crawler config, and Google Search Console verification file. Keep `sitemap.xml` in sync with actual pages (currently lists `index.html` and `project001.html`).
- `KAKAO_CHANNEL_SETUP.txt` — reference notes for the business's KakaoTalk channel setup (channel name, greeting message, canned replies). Not code; informational only.
- `README.md` — deployment notes describing which files to overwrite when pushing updates to the existing hosted copy, and a changelog of what the current version changed.

## Key architecture points

**No JS framework, no client routing.** Both HTML pages are fully static markup; `main.js` only progressively enhances (scroll effects, nav toggle, form handling). There's no state management beyond DOM classes.

**The diagnosis form has no backend.** `#diagnosisForm` in `index.html` collects business info, checkboxes (channels/concerns, each with an "other" free-text option toggled via `.conditional-field.show`), links, and a message. On submit, `js/main.js` builds a formatted Korean text summary (with a generated `ODR-YYYYMMDD-XXXX` reference code), copies it to the clipboard (`navigator.clipboard`, with a `document.execCommand("copy")` fallback for unsupported browsers), and opens the business's KakaoTalk chat link (`https://pf.kakao.com/_xmunxnX/chat`) in a new tab. There is no server-side form submission — the user is expected to paste the copied text into the opened KakaoTalk chat.

**External contact/content links are hardcoded** and appear in multiple places (header CTA, hero, diagnosis section, footer, mobile sticky CTA): KakaoTalk channel (`https://pf.kakao.com/_xmunxnX/chat`) and Naver blog (`https://blog.naver.com/rajkjk`). When updating one, check the others (`index.html` and `project001.html`) for consistency.

**Mobile has a persistent sticky CTA** (`.mobile-kakao`, shown only ≤720px via CSS) fixed to the bottom of the viewport, separate from the header CTA which is hidden on mobile in favor of the hamburger menu.

**`project001.html` duplicates layout patterns** (header, footer-less single-column detail page) rather than sharing a template — there's no templating system, so structural changes to shared chrome (header/nav) must be manually mirrored across `index.html` and `project001.html`.
