/* =========================================================
   Shared behaviour: nav, reveal-on-scroll, search tabs,
   testimonials carousel, lazy video, listing cards.
   ========================================================= */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const A = window.AGENT || {};

  /* ---- Fill agent details anywhere data-agent="key" is used ---- */
  $$("[data-agent]").forEach(el => { if (A[el.dataset.agent]) el.textContent = A[el.dataset.agent]; });
  $$("[data-agent-tel]").forEach(el => el.href = "tel:" + A.phoneRaw);
  $$("[data-agent-mail]").forEach(el => el.href = "mailto:" + A.email);
  $$("[data-agent-wa]").forEach(el => el.href = "https://wa.me/" + A.whatsapp + "?text=" + encodeURIComponent("Hi, I found you on your website and I'd like to chat about real estate."));
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  /* ---- Nav ---- */
  const nav = $(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 30);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    const toggle = $(".nav__toggle");
    toggle && toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$(".nav a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-open"); toggle && toggle.setAttribute("aria-expanded", false);
    }));

    // Active section highlight
    const links = $$('.nav__menu a[href^="#"]');
    const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(s => io.observe(s));
    }
  }

  /* ---- Reveal on scroll ---- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add("is-visible"));

  /* ---- Search tabs (Buy / Sell / Rent) ---- */
  const search = $(".search");
  if (search) {
    const tabs = $$(".search__tab", search);
    const modeInput = $('input[name="mode"]', search);
    const submit = $(".search__submit", search);
    tabs.forEach(tab => tab.addEventListener("click", () => {
      tabs.forEach(t => t.setAttribute("aria-selected", t === tab));
      modeInput.value = tab.dataset.mode;
      // "Sell" routes to a home-valuation conversation instead of IDX
      submit.textContent = tab.dataset.mode === "sell" ? "Get Home Value" : "Search Homes";
    }));
    $("form", search).addEventListener("submit", e => {
      if (modeInput.value === "sell") {
        e.preventDefault();
        location.href = "#contact";
      }
      // Otherwise submits via GET to listings.html — no IDX loaded on the homepage.
    });
  }

  /* ---- Testimonials: endless right-to-left scroll ---- */
  const marquee = $(".testimonials");
  const track = marquee && $(".testimonials__track", marquee);
  if (track && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const originals = [...track.children];
    const GAP = 24, SPEED = 40; // px per second
    const clone = (el) => {
      const c = el.cloneNode(true);
      c.classList.remove("reveal");
      c.setAttribute("aria-hidden", "true");
      c.dataset.clone = "";
      return c;
    };
    const build = () => {
      $$("[data-clone]", track).forEach((n) => n.remove());
      const setWidth = originals.reduce((w, el) => w + el.offsetWidth + GAP, 0);
      if (!setWidth) return;
      // Repeat the cards until one loop is wider than the visible strip…
      const repeats = Math.max(1, Math.ceil(marquee.clientWidth / setWidth));
      for (let r = 1; r < repeats; r++) originals.forEach((el) => track.appendChild(clone(el)));
      // …then add a second identical loop, so moving left by one loop is seamless
      [...track.children].forEach((el) => track.appendChild(clone(el)));
      track.style.setProperty("--marquee-duration", `${(setWidth * repeats) / SPEED}s`);
    };
    build();
    let resizeTimer;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 250); });
  }

  /* ---- Contact forms (Netlify Forms): validate, send in the background, confirm inline ---- */
  $$("form.lead-form").forEach((leadForm) => {
    const status = $(".lead-form__status", leadForm);
    const button = $(".lead-form__submit", leadForm);
    const say = (text, ok) => {
      status.textContent = text;
      status.className = "lead-form__status " + (ok ? "is-ok" : "is-error");
    };
    // No-JavaScript fallback lands back here with ?sent=1
    if (new URLSearchParams(location.search).has("sent")) say("Thanks! Your message was sent. I’ll be in touch soon.", true);

    const valid = (el) => el.type === "email"
      ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim())
      : el.value.trim().length > 0;

    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const required = $$("[required]", leadForm);
      required.forEach((el) => el.closest(".field").classList.toggle("is-invalid", !valid(el)));
      const firstBad = required.find((el) => !valid(el));
      if (firstBad) {
        const names = required.filter((el) => !valid(el)).map((el) => leadForm.querySelector(`label[for="${el.id}"]`).textContent.replace(" *", "").toLowerCase());
        say(`Please check: ${names.join(", ")}.`, false);
        firstBad.focus();
        return;
      }

      button.disabled = true;
      const label = button.firstChild.textContent;
      button.firstChild.textContent = "Sending… ";
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(leadForm)).toString(),
        });
        if (!res.ok) throw new Error(res.status);
        const first = leadForm.elements.name.value.trim().split(/\s+/)[0];
        leadForm.reset();
        say(`Thanks, ${first}! Your message was sent. I’ll be in touch soon.`, true);
      } catch {
        say(`Sorry, your message couldn’t be sent right now. Please call ${A.phone || "me"} or email ${A.email || "me"}.`, false);
      } finally {
        button.disabled = false;
        button.firstChild.textContent = label;
      }
    });
    $$("input, textarea", leadForm).forEach((el) =>
      el.addEventListener("input", () => el.closest(".field")?.classList.remove("is-invalid")));
  });

  /* ---- Lazy YouTube: load the iframe only on click ---- */
  $$("[data-youtube]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.youtube;
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    f.title = btn.getAttribute("aria-label") || "Video";
    f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    btn.appendChild(f);
  }, { once: true }));

  /* ---- Listing card renderer (shared by home + listings page) ---- */
  const ICON = {
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 17h20"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h6V3M21 15h-6v6"/></svg>'
  };
  window.renderListing = l => `
    <article class="card listing reveal">
      <span class="listing__tag ${l.status === "Featured" ? "listing__tag--red" : ""}">${l.status}</span>
      <div class="card__media">
        <img src="${l.thumb}" alt="${l.type} home at ${l.address}" loading="lazy" decoding="async" width="700" height="480">
      </div>
      <div class="card__body">
        <div class="listing__price">${window.formatPrice(l)}</div>
        <p class="listing__addr"><a class="stretched" href="property.html?id=${l.id}">${l.address}</a></p>
        <div class="listing__meta">
          <span>${ICON.bed}${l.beds} Beds</span>
          <span>${ICON.bath}${l.baths} Baths</span>
          <span>${ICON.area}${l.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </article>`;

  const featured = $("#featured-grid");
  if (featured && window.LISTINGS) {
    const count = Math.min(6, Math.max(3, (window.AGENT && AGENT.featuredCount) || 6));
    featured.innerHTML = window.LISTINGS.slice(0, count).map(window.renderListing).join("");
    const cards = $$(".reveal", featured);
    cards.forEach((el, n) => el.dataset.delay = n + 1);
    const show = () => cards.forEach(el => el.classList.add("is-visible"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { show(); io.disconnect(); } }, { threshold: .1 });
      io.observe(featured);
    } else show();
  }
})();
