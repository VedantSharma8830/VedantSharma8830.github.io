/* App logic: renders CV data (data.js) and powers the Customise panel. */
(function () {
  "use strict";
  var CV = window.CV, DEF = window.SITE_DEFAULTS, KEY = "vs-prefs", OWN = "vs-owner";
  var EDIT_HASH = "f5518bb0c93704618f580f49faed2256f5f9b37072859f0f3ded4aca7ba5930d";
  var owner = false; try { owner = localStorage.getItem(OWN) === "1"; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var ICONS = {
    bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/></svg>',
    chip: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>'
  };

  var SECTIONS = [
    ["about", "About"], ["education", "Education"], ["experience", "Training"], ["projects", "Projects"],
    ["skills", "Skills"], ["interests", "Interests"], ["professional", "Pro skills"], ["contact", "Contact"]
  ];
  var ACCENTS = [
    ["#22d3ee", "Electric cyan"], ["#3b82f6", "Volt blue"], ["#a855f7", "Plasma violet"],
    ["#22c55e", "Circuit green"], ["#f59e0b", "Copper amber"], ["#ef4444", "Live red"]
  ];

  /* ---------- render content ---------- */
  function render() {
    document.title = CV.name + " · " + CV.title;
    $("#brandMark").textContent = CV.initials; $("#heroInitials").textContent = CV.initials;
    (function () { var av = $("#heroAvatar"), pic = $("#heroPic"), img = $("#heroPhoto");
      if (!av || !img) return;
      if (!CV.photo) { av.classList.remove("has-photo"); if (pic) pic.remove(); return; }
      var src = pic && pic.querySelector("source"); if (src) src.srcset = CV.photo;
      img.src = CV.photoFallback || CV.photo; img.alt = "Photo of " + CV.name;
      img.onerror = function () { av.classList.remove("has-photo"); if (pic) pic.remove(); }; })();
    $("#brandName").textContent = CV.name.split(" ")[0];
    $("#heroName").textContent = CV.name; $("#heroTitle").textContent = CV.title;
    $("#heroTagline").textContent = CV.tagline; $("#heroLoc").textContent = CV.location;
    ["#ctaCall", "#cPhone"].forEach(function (s) { $(s).href = CV.phoneHref; });
    ["#ctaMail", "#cMail"].forEach(function (s) { $(s).href = "mailto:" + CV.email; });
    ["#ctaCv", "#cCv"].forEach(function (s) { $(s).href = CV.cvFile; $(s).setAttribute("download", CV.cvFile); });
    $("#cPhoneTxt").textContent = CV.phone; $("#cMailTxt").textContent = CV.email; $("#cLoc").textContent = CV.location;
    $("#year").textContent = new Date().getFullYear(); $("#footName").textContent = CV.name;

    $("#stats").innerHTML = CV.stats.map(function (s) { return '<div class="stat reveal"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"; }).join("");
    $("#objective").textContent = CV.objective;
    $("#summary").innerHTML = CV.summary.map(function (s) { return '<li class="reveal">' + esc(s) + "</li>"; }).join("");

    $("#education-list").innerHTML = CV.education.map(function (e) {
      return '<li class="card edu reveal"><span class="badge">' + esc(e.score) + "</span><h3>" + esc(e.degree) + '</h3><p class="sub">' + esc(e.school) + "</p>" +
        (e.points.length ? '<ul class="pts">' + e.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : "") + "</li>";
    }).join("");

    $("#experience-list").innerHTML = CV.experience.map(function (x, i) {
      return expandCard("xp" + i, ICONS.tool, x.role, x.org + " · " + x.duration,
        '<ul class="pts">' + x.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>", true);
    }).join("");

    $("#projects-list").innerHTML = CV.projects.map(function (p, i) {
      var body = '<dl class="kv"><div><dt>Objective</dt><dd>' + esc(p.objective) + '</dd></div><div><dt>Concept</dt><dd>' + esc(p.concept) +
        '</dd></div><div><dt>Benefit</dt><dd>' + esc(p.benefit) + "</dd></div></dl>";
      var sub = '<span class="tags">' + p.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</span>";
      return expandCard("pr" + i, ICONS[p.icon] || ICONS.bolt, p.name, sub, body, false, true);
    }).join("");

    $("#skills-list").innerHTML = CV.skills.map(function (g) {
      return '<div class="card skill-card"><h3><span class="pi">' + (ICONS[g.icon] || ICONS.bolt) + "</span>" + esc(g.group) + '</h3><div class="pills">' +
        g.items.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div></div>";
    }).join("");
    $("#skills-dots").innerHTML = CV.skills.map(function (_, i) { return "<i" + (i ? "" : ' class="on"') + "></i>"; }).join("");

    $("#interests-list").innerHTML = CV.interests.map(function (t) { return '<button type="button" class="reveal" aria-pressed="false">⚡ ' + esc(t) + "</button>"; }).join("");
    $("#professional-list").innerHTML = CV.professionalSkills.map(function (s) { return '<div class="card ps reveal"><h3>' + esc(s.name) + "</h3><p>" + esc(s.text) + "</p></div>"; }).join("");
    $("#additional").innerHTML = Object.keys(CV.additional).map(function (k) { return "<dt>" + esc(k) + "</dt><dd>" + esc(CV.additional[k]) + "</dd>"; }).join("");

    $("#chips").innerHTML = SECTIONS.map(function (s) { return '<a class="chip" href="#' + s[0] + '" data-chip="' + s[0] + '">' + s[1] + "</a>"; }).join("");
  }
  function expandCard(id, icon, title, sub, body, open, subHtml) {
    return '<article class="card expand reveal' + (open ? " open" : "") + '"><button class="expand-head" aria-expanded="' + !!open + '" aria-controls="' + id + '">' +
      '<span class="pi">' + icon + '</span><span class="tt"><span class="h3">' + esc(title) + "</span>" + (subHtml ? sub : '<span class="sub">' + esc(sub) + "</span>") +
      '<span class="tap-hint">Tap to see details</span></span>' + ICONS.chev + "</button>" +
      '<div class="expand-body" id="' + id + '"><div><div class="expand-inner">' + body + "</div></div></div></article>";
  }

  /* ---------- interactions ---------- */
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1800); }

  function wire() {
    document.addEventListener("click", function (e) {
      var h = e.target.closest(".expand-head");
      if (h) { var c = h.parentNode, o = !c.classList.contains("open"); c.classList.toggle("open", o); h.setAttribute("aria-expanded", o); if (navigator.vibrate) navigator.vibrate(8); }
      var tg = e.target.closest(".tag-cloud button");
      if (tg) { var on = !tg.classList.contains("lit"); tg.classList.toggle("lit", on); tg.setAttribute("aria-pressed", on); }
      var b = e.target.closest(".btn,.fab,.chip");
      if (b && prefs.motion) ripple(b, e);
    });

    // reveal on scroll
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
      $$(".reveal").forEach(function (n) { io.observe(n); });
      // active chip
      var so = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) setChip(x.target.id); });
      }, { rootMargin: "-40% 0px -55% 0px" });
      SECTIONS.forEach(function (s) { so.observe(document.getElementById(s[0])); });
    } else { $$(".reveal").forEach(function (n) { n.classList.add("in"); }); }

    // carousel dots
    var car = $("#skills-list");
    car.addEventListener("scroll", function () {
      var w = car.firstElementChild ? car.firstElementChild.offsetWidth + 12 : 1, i = Math.round(car.scrollLeft / w);
      $$("#skills-dots i").forEach(function (d, k) { d.classList.toggle("on", k === i); });
    }, { passive: true });

    $("#copyEmail").addEventListener("click", function () {
      var done = function () { toast("Email copied"); };
      if (navigator.clipboard) navigator.clipboard.writeText(CV.email).then(done, function () { toast(CV.email); }); else toast(CV.email);
    });
    $("#shareBtn").addEventListener("click", function () {
      var data = { title: CV.name + " · Portfolio", text: CV.name + " — " + CV.title, url: location.origin + location.pathname };
      if (navigator.share) navigator.share(data).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function () { toast("Link copied"); });
    });
    $("#themeQuick").addEventListener("click", function () {
      var cur = root.getAttribute("data-theme"), nt = cur === "dark" ? "light" : "dark";
      if (owner) setPref("theme", nt); else { prefs.theme = nt; apply(); }
    });
  }
  function setChip(id) {
    $$(".chip").forEach(function (c) {
      var on = c.getAttribute("data-chip") === id; c.classList.toggle("on", on);
      if (on) { var bar = $("#chips"); bar.scrollTo({ left: c.offsetLeft - 16, behavior: prefs.motion ? "smooth" : "auto" }); }
    });
  }
  function ripple(b, e) {
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = el("span", { class: "ripple" });
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    b.style.overflow = "hidden";
    d.style.width = d.style.height = s + "px";
    d.style.left = ((e.clientX || r.left + r.width / 2) - r.left - s / 2) + "px";
    d.style.top = ((e.clientY || r.top + r.height / 2) - r.top - s / 2) + "px";
    b.appendChild(d); setTimeout(function () { d.remove(); }, 600);
  }

  /* ---------- customise ---------- */
  var prefs;
  function load() {
    var saved = {}; if (owner) { try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {} }
    var p = {}; for (var k in DEF) p[k] = DEF[k];
    for (var j in saved) if (j in DEF) p[j] = saved[j];
    if (!Array.isArray(p.hidden)) p.hidden = [];
    return p;
  }
  function save() { if (!owner) return; try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} var n = $("#savedNote"); n.classList.add("show"); clearTimeout(save._t); save._t = setTimeout(function () { n.classList.remove("show"); }, 1400); }
  function lum(hex) {
    var m = hex.replace("#", ""); if (m.length === 3) m = m.split("").map(function (c) { return c + c; }).join("");
    var rgb = [0, 2, 4].map(function (i) { var v = parseInt(m.substr(i, 2), 16) / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  }
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
  function apply() {
    var t = prefs.theme === "auto" ? (mq && mq.matches ? "light" : "dark") : prefs.theme;
    root.setAttribute("data-theme", t);
    root.style.setProperty("--accent", prefs.accent);
    root.style.setProperty("--on-accent", lum(prefs.accent) > .32 ? "#04121a" : "#ffffff");
    root.setAttribute("data-font", prefs.font);
    root.setAttribute("data-density", prefs.density);
    root.setAttribute("data-motion", prefs.motion ? "on" : "off");
    root.setAttribute("data-circuit", prefs.circuit ? "on" : "off");
    var meta = $('meta[name="theme-color"]'); if (meta) meta.content = t === "light" ? "#f5f8fc" : "#0b1220";
    SECTIONS.forEach(function (s) {
      var hide = prefs.hidden.indexOf(s[0]) > -1;
      document.getElementById(s[0]).classList.toggle("hidden-sec", hide);
      var c = $('[data-chip="' + s[0] + '"]'); if (c) c.style.display = hide ? "none" : "";
    });
    // reflect controls
    $$(".seg").forEach(function (seg) { var k = seg.getAttribute("data-pref"); $$("button", seg).forEach(function (b) { var on = b.getAttribute("data-v") === prefs[k]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); });
    $$(".swatch").forEach(function (s) { var on = s.getAttribute("data-c").toLowerCase() === prefs.accent.toLowerCase(); s.classList.toggle("on", on); s.setAttribute("aria-pressed", on); });
    $("#accentPicker").value = prefs.accent; $("#accentHex").textContent = prefs.accent.toUpperCase();
    $("#motionToggle").checked = prefs.motion; $("#circuitToggle").checked = prefs.circuit;
    $$("#sectionToggles input").forEach(function (i) { i.checked = prefs.hidden.indexOf(i.value) < 0; });
  }
  function setPref(k, v) { prefs[k] = v; apply(); save(); }

  function buildPanel() {
    $("#swatches").innerHTML = ACCENTS.map(function (a) { return '<button class="swatch" data-c="' + a[0] + '" style="background:' + a[0] + '" aria-label="' + a[1] + '" title="' + a[1] + '"></button>'; }).join("");
    $("#sectionToggles").innerHTML = SECTIONS.map(function (s) { return '<label class="switch"><input type="checkbox" value="' + s[0] + '"><i></i><span>' + s[1] + "</span></label>"; }).join("");
    $$(".seg").forEach(function (seg) { seg.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setPref(seg.getAttribute("data-pref"), b.getAttribute("data-v")); }); });
    $("#swatches").addEventListener("click", function (e) { var s = e.target.closest(".swatch"); if (s) setPref("accent", s.getAttribute("data-c")); });
    $("#accentPicker").addEventListener("input", function (e) { setPref("accent", e.target.value); });
    $("#motionToggle").addEventListener("change", function (e) { setPref("motion", e.target.checked); });
    $("#circuitToggle").addEventListener("change", function (e) { setPref("circuit", e.target.checked); });
    $("#sectionToggles").addEventListener("change", function (e) {
      var v = e.target.value, h = prefs.hidden.filter(function (x) { return x !== v; });
      if (!e.target.checked) h.push(v); setPref("hidden", h);
    });
    $("#resetPrefs").addEventListener("click", function () { prefs = JSON.parse(JSON.stringify(DEF)); apply(); try { localStorage.removeItem(KEY); } catch (e) {} toast("Back to default"); });
    if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (prefs.theme === "auto") apply(); });

    var panel = $("#panel"), scrim = $("#scrim"), fab = $("#fab");
    function openP() { scrim.hidden = false; requestAnimationFrame(function () { scrim.classList.add("show"); panel.classList.add("open"); }); panel.setAttribute("aria-hidden", "false"); fab.setAttribute("aria-expanded", "true"); fab.style.visibility = "hidden"; setTimeout(function () { $("#panelClose").focus({ preventScroll: true }); }, 50); }
    function closeP() { panel.classList.remove("open"); scrim.classList.remove("show"); panel.style.transform = ""; panel.setAttribute("aria-hidden", "true"); fab.setAttribute("aria-expanded", "false"); fab.style.visibility = ""; setTimeout(function () { scrim.hidden = true; }, 300); }
    fab.addEventListener("click", openP);
    $("#lockPrefs").addEventListener("click", function () { try { localStorage.removeItem(OWN); } catch (e) {} owner = false; closeP(); prefs = load(); apply(); setTimeout(function () { fab.hidden = true; panel.hidden = true; }, 320); toast("Customise hidden on this device"); }); scrim.addEventListener("click", closeP); $("#panelClose").addEventListener("click", closeP);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) closeP(); });
    // swipe down to close
    var y0 = null, dy = 0;
    [$("#grab"), $(".panel-head")].forEach(function (h) {
      h.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; dy = 0; panel.style.transition = "none"; }, { passive: true });
      h.addEventListener("touchmove", function (e) { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); panel.style.transform = "translateY(" + dy + "px)"; }, { passive: true });
      h.addEventListener("touchend", function () { panel.style.transition = ""; if (dy > 90) closeP(); else panel.style.transform = ""; y0 = null; });
    });
  }

  prefs = load();
  if ("IntersectionObserver" in window) root.classList.add("js");
  render();
  buildPanel();
  apply();
  wire();
  function showOwner() { $("#fab").hidden = false; $("#panel").hidden = false; }
  if (owner) showOwner();
  (function () {
    var q = new URLSearchParams(location.search), code = q.get("edit");
    if (!code || !window.crypto || !crypto.subtle || !window.TextEncoder) return;
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(code)).then(function (buf) {
      var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      if (hex !== EDIT_HASH) return;
      try { localStorage.setItem(OWN, "1"); } catch (e) {}
      q.delete("edit"); var s = q.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
      if (!owner) { owner = true; prefs = load(); apply(); }
      showOwner(); toast("Customise unlocked on this device");
    }).catch(function () {});
  })();
  window.__vsPrefs = function () { return prefs; };
})();
