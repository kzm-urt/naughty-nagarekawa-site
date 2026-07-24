/* global React, ReactDOM, PatternBackground */

const ALT_HERO_GROUPS = [
  { positions: ["trio-left", "trio-center", "trio-right"], names: ["g1", "g2", "g3"] },
  { positions: ["duo-left", "duo-right"], names: ["g4", "g5"] }
];
const ALT_HERO_ASSETS = ["g1", "g2", "g3", "g4", "g5"].reduce((assets, name, index) => {
  const staff = (window.NTY_SOURCE_DATA?.staff || [])
    .filter((item) => item.publicVisible !== false)
    .slice(0, 5)[index] || {};
  assets[name] = {
    anime: staff.heroPhoto || `assets/cast/g${index + 1}.png`,
    real: staff.heroRealPhoto || staff.photo || `assets/cast/real-${index + 1}.png`
  };
  return assets;
}, {});

function altSanitizePublicData(input) {
  const source = input?.data || input || {};
  const shop = source.shop || {};
  return {
    updatedAt: source.updatedAt || new Date().toISOString(),
    assetVersion: source.assetVersion || 1,
    shop: {
      name: shop.name, displayName: shop.displayName, concept: shop.concept, hours: shop.hours,
      charge: shop.charge, orderRule: shop.orderRule, payment: shop.payment, address: shop.address,
      accessNote: shop.accessNote, holiday: shop.holiday, instagram: shop.instagram,
      instagramUrl: shop.instagramUrl, x: shop.x, xUrl: shop.xUrl, inquiryTemplate: shop.inquiryTemplate
    },
    staff: (source.staff || []).map((item) => ({
      id: item.id, displayName: item.displayName, romanName: item.romanName, role: item.role,
      profileText: item.profileText, shortComment: item.shortComment, photo: item.photo,
      heroPhoto: item.heroPhoto, heroRealPhoto: item.heroRealPhoto, portraitIcon: item.portraitIcon,
      tags: item.tags, publicVisible: item.publicVisible, workStatus: item.workStatus,
      instagram: item.instagram, instagramUrl: item.instagramUrl, x: item.x, xUrl: item.xUrl
    })),
    products: (source.products || []).map((item) => ({
      id: item.id, name: item.name, category: item.category, salePrice: item.salePrice,
      description: item.description, eventOnly: item.eventOnly, active: item.active
    })),
    events: (source.events || []).map((item) => ({
      id: item.id, date: item.date, title: item.title, summary: item.summary,
      kind: item.kind, tag: item.tag, linkUrl: item.linkUrl,
      instagram: item.instagram, instagramUrl: item.instagramUrl, publicVisible: item.publicVisible
    })),
    shifts: (source.shifts || []).map((item) => ({
      id: item.id, date: item.date, staffId: item.staffId, status: item.status,
      start: item.start, end: item.end, publicNote: item.publicNote
    })),
    materials: (source.materials || [])
      .filter((item) => item.publicVisible !== false && item.usageApproved === true)
      .map((item) => ({
        id: item.id, title: item.title, caption: item.caption, image: item.image,
        kind: item.kind, publicVisible: true, usageApproved: true
      }))
  };
}

function AltHeroPoster({ tonight, shop }) {
  const [heroGroup, setHeroGroup] = React.useState(0);
  const [heroLook, setHeroLook] = React.useState("anime");
  const [isHeroSwitching, setHeroSwitching] = React.useState(false);
  const [heroSwitchKind, setHeroSwitchKind] = React.useState("materialize");

  React.useEffect(() => {
    Object.values(ALT_HERO_ASSETS).forEach((asset) => {
      [asset.anime, asset.real].forEach((src) => {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
      });
    });
  }, []);

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return undefined;

    let sequenceStep = 0;
    let swapTimer = 0;
    let settleTimer = 0;
    const frameTimer = window.setInterval(() => {
      const isGroupChange = sequenceStep % 2 === 1;
      const nextLook = isGroupChange ? "anime" : "real";

      setHeroSwitchKind(isGroupChange ? "group" : "materialize");
      setHeroSwitching(true);
      swapTimer = window.setTimeout(() => {
        if (isGroupChange) {
          setHeroGroup((current) => (current + 1) % ALT_HERO_GROUPS.length);
        }
        setHeroLook(nextLook);
      }, 470);
      settleTimer = window.setTimeout(() => {
        setHeroSwitching(false);
      }, 1080);
      sequenceStep += 1;
    }, 4600);

    return () => {
      window.clearInterval(frameTimer);
      window.clearTimeout(swapTimer);
      window.clearTimeout(settleTimer);
    };
  }, []);

  const renderHeroGroup = (groupIndex) => {
    const group = ALT_HERO_GROUPS[groupIndex];
    return group.names.map((name, index) => {
    const position = group.positions[index];
    const src = ALT_HERO_ASSETS[name][heroLook];
    return (
    <React.Fragment key={`${heroLook}-${position}-${src}-${index}`}>
      <img
        className={`alt-hero-poster__girl is-${position} is-${heroLook} is-${name}`}
        src={src}
        alt=""
        loading="eager"
        decoding="async"
        fetchpriority={position === "trio-center" ? "high" : "auto"}
      />
      <img
        className={`alt-hero-poster__girl alt-hero-poster__girl-face is-${position} is-${heroLook} is-${name}`}
        src={src}
        alt=""
        loading="eager"
        decoding="async"
      />
    </React.Fragment>
  )})};

  return (
    <section className="alt-hero-poster" aria-labelledby="alt-hero-title">
      <div className="alt-hero-poster__backdrop" aria-hidden="true">
        <span className="alt-hero-poster__mesh" />
        <span className="alt-hero-poster__halo" />
        <span className="alt-hero-poster__slash" />
        <strong>NAUGHTY</strong>
        <i>AFTER DARK / HIROSHIMA / 2026</i>
      </div>

      <div className="alt-hero-poster__fx" aria-hidden="true">
        <span className="alt-hero-poster__beam is-primary" />
        <span className="alt-hero-poster__beam is-secondary" />
        <span className="alt-hero-poster__orbit is-outer" />
        <span className="alt-hero-poster__orbit is-inner" />
        <span className="alt-hero-poster__face-light is-left" />
        <span className="alt-hero-poster__face-light is-center" />
        <span className="alt-hero-poster__face-light is-right" />
        <span className="alt-hero-poster__scan" />
        <span className="alt-hero-poster__spark-field">
          {Array.from({ length: 9 }, (_, index) => <i className={`is-${index + 1}`} key={index} />)}
        </span>
      </div>

      <div className="alt-hero-poster__meta">
        <span><i /> OPEN TONIGHT</span>
        <b>HIROSHIMA / NAGAREKAWA</b>
      </div>

      <div className="alt-hero-poster__copy">
        <p>CONCEPT CAFE / SINCE 2026</p>
        <h1 id="alt-hero-title"><span>夜は、</span><em>ここから。</em></h1>
        <small>ちょっとした、いたずらを。</small>
      </div>

      <a className="alt-hero-poster__instagram" href={shop.instagramUrl} target="_blank" rel="noreferrer">
        <span>OFFICIAL INSTAGRAM</span><b>↗</b>
      </a>

      <div className={`alt-hero-poster__cast is-${heroLook} is-count-${ALT_HERO_GROUPS[heroGroup].names.length}${isHeroSwitching ? " is-switching" : ""}`} aria-hidden="true">
        <div className="alt-hero-poster__cast-layer is-current">
          {renderHeroGroup(heroGroup)}
        </div>
      </div>

      <div className={`alt-hero-poster__switch is-${heroSwitchKind}${isHeroSwitching ? " is-active" : ""}`} aria-hidden="true">
        <span className="alt-hero-poster__switch-noise" />
        <span className="alt-hero-poster__switch-slices" />
        <span className="alt-hero-poster__switch-blocks">
          {Array.from({ length: 6 }, (_, index) => <i className={`is-${index + 1}`} key={index} />)}
        </span>
        <span className="alt-hero-poster__switch-flash" />
        <span className="alt-hero-poster__switch-veil" />
        <span className="alt-hero-poster__switch-line" />
        <span className="alt-hero-poster__switch-code">CAST // REWRITE</span>
      </div>

      <div className="alt-hero-poster__live">
        <span><i /> TONIGHT</span>
        <strong>{tonight}</strong>
        <small>CAST</small>
      </div>

      <button className="alt-hero-poster__cta" type="button" onClick={() => altGoTo("shift")}>
        <span>今夜会える女の子</span>
        <b>{shop.open}</b>
        <i>↘</i>
      </button>

      <p className="alt-hero-poster__scroll"><span /> SCROLL TO DISCOVER</p>
    </section>
  );
}

function AltExperience() {
  React.useEffect(() => {
    const root = document.querySelector(".alt-shell");
    const progress = document.querySelector(".alt-progress__bar");
    const revealItems = Array.from(document.querySelectorAll(".alt-reveal"));
    const sectionItems = Array.from(document.querySelectorAll("[data-alt-section]"));
    const recruitSection = document.getElementById("recruit");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    revealItems.forEach((item) => revealObserver.observe(item));

    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.getAttribute("data-alt-section");
      if (root) root.setAttribute("data-active-section", id);
      document.querySelectorAll(".alt-nav__links a").forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
      if (window.triggerPatternShift) window.triggerPatternShift(id);
    }, { threshold: [0.22, 0.45, 0.7], rootMargin: "-18% 0px -48%" });
    sectionItems.forEach((item) => sectionObserver.observe(item));

    const recruitObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (root) root.classList.toggle("is-recruit-visible", visible);
    }, { threshold: 0.04 });
    if (recruitSection) recruitObserver.observe(recruitSection);

    const paintScroll = () => {
      scrollFrame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (progress) progress.style.transform = `scaleX(${ratio})`;
      if (root) root.style.setProperty("--page-y", ratio.toFixed(4));
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScroll);
    };

    const onPointer = (event) => {
      if (!root || reducedMotion.matches || !window.matchMedia("(pointer: fine)").matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;
        root.style.setProperty("--pointer-x", `${pointerX}px`);
        root.style.setProperty("--pointer-y", `${pointerY}px`);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    paintScroll();

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      recruitObserver.disconnect();
      if (root) root.classList.remove("is-recruit-visible");
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return null;
}

function AltApp() {
  const [, setRemoteRevision] = React.useState(0);
  React.useEffect(() => {
    if (!window.NaughtyBackend?.enabled) return undefined;
    let active = true;
    window.NaughtyBackend.loadPublicData().then((remoteData) => {
      if (!active || !remoteData) return;
      window.NTYRefresh(altSanitizePublicData(remoteData));
      setRemoteRevision((value) => value + 1);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const shop = window.NTY.shop;
  const tonight = window.NTY.todayCounts.total;

  return (
    <div className="nty alt-shell" data-active-section="top" data-active-tone="ink">
      <PatternBackground />
      <AltNav />
      <div className="alt-progress" aria-hidden="true"><span className="alt-progress__bar" /></div>

      <div className="top-wrap" id="top" data-section-id="top" data-alt-section="top">
        <AltHeroPoster tonight={tonight} shop={shop} />
      </div>

      <main className="alt-main">
        <AltLiveDeck />
        <AltUpdates />
        <AltToday />
        <AltSchedule />
        <AltCast />
        <AltMenu />
        <AltAccess />
        <AltContact />
        <AltRecruit />
      </main>
      <button className="alt-recruit-rail" type="button" onClick={() => altGoTo("recruit")} aria-label="求人情報へ移動">
        <span>RECRUIT</span><b>求人を見る</b><i>↘</i>
      </button>
      <AltFooter />
      <AltExperience />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AltApp />);
