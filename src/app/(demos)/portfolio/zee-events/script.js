(() => {
  const root = document.documentElement;
  const section = document.querySelector(".cinema-scroll");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const track = document.querySelector(".sights-track");
  const sightsControls = document.querySelector(".sights-controls");
  const sightPrev = document.querySelector(".sight-prev");
  const sightNext = document.querySelector(".sight-next");
  const originalCards = Array.from(document.querySelectorAll(".sight-card"));
  const originalSightCount = originalCards.length;

  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetScroll = 0;
  let smoothScroll = 0;
  let initialized = false;
  let rafPending = false;
  let sightCards = [];
  let activeSight = originalSightCount;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = (e0, e1, v) => {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const segmentInOut = (s, a, b, c, d) => {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter, exit, active: enter * (1 - exit) };
  };
  const getScrollDistance = () => {
    if (!section) return 0;
    return clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);
  };

  function update() {
    rafPending = false;

    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

    const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1660);
    const frame3 = segmentInOut(smoothScroll, 1660, 2000, 3300, 3400);
    const progress = clamp(smoothScroll / 3300);
    const introExit = smoothstep(90, 650, smoothScroll);
    const splitDrift = smoothstep(60, 600, smoothScroll);
    const splitOpacity = 1 - smoothstep(180, 600, smoothScroll);
    const sightsEnter = smoothstep(1660, 2000, smoothScroll);
    const sightsControlsEnter = smoothstep(1880, 2020, smoothScroll);
    const blurActive = clamp(frame2.active + frame3.active);
    const frame2Opacity = frame2.active * (1 - frame3.enter);
    const panel2Opacity = frame2.active * (1 - frame2.exit);
    const panel3Opacity = frame3.active;
    const backScale = 1 + progress * 0.16 + frame2.enter * 0.12 + frame3.enter * 0.12;
    const sharedHeroY = progress * -74;
    const sharedHeroScale = progress * 0.23;

    // CSS Custom Property Writes
    root.style.setProperty("--mx", (reduceMotion.matches ? 0 : mouseX).toFixed(4));
    root.style.setProperty("--my", (reduceMotion.matches ? 0 : mouseY).toFixed(4));

    root.style.setProperty("--back-opacity", (1 - frame2.active * 0.06).toFixed(4));
    root.style.setProperty("--back-x", "0px");
    root.style.setProperty("--back-y", "0px");
    root.style.setProperty("--back-scale", backScale.toFixed(4));
    root.style.setProperty("--four-y", `${(0 + progress * 10).toFixed(4)}vh`);
    root.style.setProperty("--four-scale", (1 + progress * 0.14).toFixed(4));
    root.style.setProperty("--bazaar-y", `${(0 - progress * 8).toFixed(4)}vh`);
    root.style.setProperty("--blur-px", `${(blurActive * 14).toFixed(4)}px`);
    root.style.setProperty("--back-brightness", (1 - blurActive * 0.255).toFixed(4));
    root.style.setProperty("--bazaar-blur-px", `${(frame2.active * 14).toFixed(4)}px`);
    const bazaarOpacity = 1 - introExit;
    root.style.setProperty("--bazaar-opacity", bazaarOpacity.toFixed(4));
    root.style.setProperty("--bazaar-saturation", (1 + frame3.active * 0.18).toFixed(4));
    root.style.setProperty("--shade-opacity", "1");
    root.style.setProperty("--shade-z", frame2.active > 0.02 ? "2" : "0");
    root.style.setProperty("--shade-top-alpha", (blurActive * 0.465).toFixed(4));
    root.style.setProperty("--shade-mid-alpha", (blurActive * 0.42).toFixed(4));
    root.style.setProperty("--shade-bottom-alpha", (blurActive * 0.51).toFixed(4));

    root.style.setProperty("--title-y", `${(introExit * -210).toFixed(4)}px`);
    root.style.setProperty("--title-scale", (1 - introExit * 0.08).toFixed(4));
    root.style.setProperty("--title-opacity", (1 - introExit).toFixed(4));

    root.style.setProperty("--bridge-x", "-50%");
    root.style.setProperty("--bridge-y", `calc(-50% + ${(sharedHeroY - frame2.exit * 760).toFixed(4)}px)`);
    root.style.setProperty("--bridge-width", `${(50 + frame2.enter * 24).toFixed(4)}vw`);
    root.style.setProperty("--bridge-scale", (1 + sharedHeroScale * 0.35 + frame2.exit * 0.25).toFixed(4));

    root.style.setProperty("--split-left-x", `${(-splitDrift * 65).toFixed(4)}vw`);
    root.style.setProperty("--split-left-y", `${(sharedHeroY - splitDrift * 80).toFixed(4)}px`);
    root.style.setProperty("--split-left-scale", (1 + sharedHeroScale * 0.15).toFixed(4));
    root.style.setProperty("--split-right-x", `${(splitDrift * 65).toFixed(4)}vw`);
    root.style.setProperty("--split-right-y", `${(sharedHeroY - splitDrift * 80).toFixed(4)}px`);
    root.style.setProperty("--split-right-scale", (1 + sharedHeroScale * 0.15).toFixed(4));
    root.style.setProperty("--split-opacity", splitOpacity.toFixed(4));

    root.style.setProperty("--frame2-opacity", frame2Opacity.toFixed(4));
    root.style.setProperty("--frame2-x", "-50%");
    root.style.setProperty("--frame2-y", `calc(-50% + ${(-frame2.exit * 150).toFixed(4)}px)`);
    root.style.setProperty("--frame2-scale", (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

    root.style.setProperty("--intro-copy-y", `${(introExit * 90).toFixed(4)}px`);
    root.style.setProperty("--intro-copy-opacity", (1 - introExit).toFixed(4));
    root.style.setProperty("--panel2-opacity", panel2Opacity.toFixed(4));
    root.style.setProperty("--panel2-y", `calc(-50% + ${(-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(4)}px)`);
    root.style.setProperty("--panel3-opacity", panel3Opacity.toFixed(4));
    root.style.setProperty("--panel3-y", `${(-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(4)}px`);

    root.style.setProperty("--sights-opacity", sightsEnter.toFixed(4));
    root.style.setProperty("--sights-controls-opacity", sightsControlsEnter.toFixed(4));
    if (sightsControls) {
      sightsControls.classList.toggle("is-ready", sightsControlsEnter > 0.9);
    }
    root.style.setProperty("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
    root.style.setProperty("--sights-y", `${((1 - sightsEnter) * 50).toFixed(4)}px`);
    root.style.setProperty("--sights-enter-x", `${((1 - sightsEnter) * 45).toFixed(4)}vw`);
    root.style.setProperty("--sights-scale", "1");

    // Bazaar horizontal card scroll scrubbing (reaches 100% on card 4):
    const cardProgress = clamp((smoothScroll - 2000) / 1300);
    if (sightCards.length > 0 && track) {
      const cardWidth = sightCards[0].offsetWidth || 600;
      const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "24");
      const scrollShift = -(cardWidth + gap) * (cardProgress * (sightCards.length - 1));
      root.style.setProperty("--sights-shift", `${scrollShift.toFixed(2)}px`);

      const currentActiveIndex = Math.min(sightCards.length - 1, Math.round(cardProgress * (sightCards.length - 1)));
      activeSight = currentActiveIndex;
      sightCards.forEach((card, index) => {
        card.classList.toggle("is-active", index === activeSight);
      });
      if (sightPrev) sightPrev.style.opacity = activeSight === 0 ? "0.35" : "1";
      if (sightNext) sightNext.style.opacity = activeSight === sightCards.length - 1 ? "0.35" : "1";
    }

    if (Math.abs(smoothScroll - targetScroll) > 0.08) {
      requestTick();
    }
  }

  function requestTick() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }

  function setupSightSlider() {
    if (!track) return;
    sightCards = Array.from(track.querySelectorAll(".sight-card"));
    activeSight = 0;
    sightCards.forEach((card, index) => {
      card.dataset.sightIndex = index.toString();
      card.addEventListener("click", () => selectSightCard(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectSightCard(card);
        }
      });
    });
    if (sightCards.length > 0) {
      sightCards[0].classList.add("is-active");
    }
    if (sightPrev) sightPrev.style.opacity = "0.35";
  }

  function moveSightSlider(dir) {
    if (!sightCards.length) return;
    const next = Math.max(0, Math.min(sightCards.length - 1, activeSight + dir));
    const targetScrollPos = 2000 + (next / (sightCards.length - 1)) * 1300;
    window.scrollTo({ top: targetScrollPos, behavior: "smooth" });
  }

  function selectSightCard(card) {
    const index = Number(card.dataset.sightIndex);
    if (Number.isFinite(index) && sightCards.length > 1) {
      const targetScrollPos = 2000 + (index / (sightCards.length - 1)) * 1300;
      window.scrollTo({ top: targetScrollPos, behavior: "smooth" });
    }
  }

  const sectionScrollMap = {
    home: 0,
    about: 1100,
    services: 2000,
  };

  function setupNavigation() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    const mobileOverlay = document.querySelector(".mobile-menu-overlay");

    if (mobileToggle && mobileOverlay) {
      mobileToggle.addEventListener("click", () => {
        const isOpen = mobileOverlay.classList.toggle("is-open");
        mobileToggle.classList.toggle("is-open", isOpen);
        mobileToggle.setAttribute("aria-expanded", isOpen.toString());
      });
    }

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const targetId = href.slice(1);
        if (sectionScrollMap[targetId] !== undefined) {
          e.preventDefault();
          if (mobileOverlay && mobileToggle) {
            mobileOverlay.classList.remove("is-open");
            mobileToggle.classList.remove("is-open");
            mobileToggle.setAttribute("aria-expanded", "false");
          }
          window.scrollTo({ top: sectionScrollMap[targetId], behavior: "smooth" });
        }
      });
    });
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  if (sightPrev) {
    sightPrev.addEventListener("click", () => moveSightSlider(-1));
  }
  if (sightNext) {
    sightNext.addEventListener("click", () => moveSightSlider(1));
  }

  function init() {
    setupSightSlider();
    setupNavigation();
    requestTick();
  }

  document.addEventListener("DOMContentLoaded", init);

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  }
})();
