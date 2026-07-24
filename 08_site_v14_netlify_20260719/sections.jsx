/* global React */

const ALT_SECTIONS = [
  ["updates", "01", "新着情報"],
  ["shift", "02", "SHIFT"],
  ["cast", "03", "CAST"],
  ["menu", "04", "MENU"],
  ["access", "05", "ACCESS"],
  ["contact", "06", "CONTACT"]
];

function altSafeUrl(value, platform) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "");
  if (!handle || /\s/.test(handle)) return "";
  return platform === "x" ? `https://x.com/${handle}` : `https://www.instagram.com/${handle}/`;
}

function altRawShop() {
  return window.NTY.raw?.shop || {};
}

function altOfficialSocials() {
  const raw = altRawShop();
  return {
    instagram: altSafeUrl(window.NTY.shop?.instagramUrl || raw.instagramUrl || raw.instagram, "instagram"),
    x: altSafeUrl(raw.xUrl || raw.x || raw.twitterUrl || raw.twitter, "x")
  };
}

function altCastSocials(castId) {
  const staff = (window.NTY.raw?.staff || []).find((item) => item.id === castId) || {};
  const sns = typeof staff.sns === "object" && staff.sns ? staff.sns : {};
  return {
    instagram: altSafeUrl(staff.instagramUrl || staff.instagram || sns.instagram, "instagram"),
    x: altSafeUrl(staff.xUrl || staff.x || staff.twitterUrl || staff.twitter || sns.x || sns.twitter, "x")
  };
}

function altCastMedia(cast) {
  const staff = (window.NTY.raw?.staff || []).find((item) => item.id === cast?.id) || {};
  const gallery = Array.isArray(staff.galleryPhotos)
    ? staff.galleryPhotos
    : Array.isArray(staff.castGallery)
      ? staff.castGallery
      : [staff.galleryPhoto1, staff.galleryPhoto2, staff.galleryPhoto3];
  const registered = gallery
    .map((item) => typeof item === "string" ? item : item?.src || item?.image || "")
    .map((src) => String(src || "").trim())
    .filter(Boolean)
    .slice(0, 3);
  const candidates = registered.length
    ? registered.map((src) => ({ src, label: "CAST PHOTO" }))
    : [1, 2, 3].map((number) => ({
        src: `assets/placeholders/cast-gallery-${String(number).padStart(2, "0")}.svg`,
        label: "PHOTO SLOT"
      }));
  const seen = new Set();
  return candidates.filter((item) => {
    const src = String(item.src || "").trim();
    if (!src || seen.has(src)) return false;
    seen.add(src);
    item.src = src;
    return true;
  });
}

function altYen(value) {
  return `${Number(value || 0).toLocaleString("ja-JP")}円`;
}

function altUpdateDate(value) {
  const raw = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw || "INFO";
  const [, month, day] = raw.split("-");
  return `${month}.${day}`;
}

function altUpdateUrl(item) {
  const instagram = altSafeUrl(item?.instagramUrl || item?.instagram, "instagram");
  if (instagram) return instagram;
  const raw = String(item?.linkUrl || item?.url || "").trim();
  return /^https:\/\//i.test(raw) ? raw : "";
}

async function altCopyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Continue to the selection-based fallback below.
    }
  }

  const temporary = document.createElement("textarea");
  temporary.value = text;
  temporary.setAttribute("readonly", "");
  temporary.style.position = "fixed";
  temporary.style.left = "-9999px";
  temporary.style.top = "0";
  document.body.appendChild(temporary);
  temporary.focus();
  temporary.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  temporary.remove();
  return copied;
}

function altGoTo(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const y = element.getBoundingClientRect().top + window.scrollY - 74;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
}

function altGoToCast() {
  altGoTo("cast");
}

function AltNav() {
  const [open, setOpen] = React.useState(false);
  const socials = altOfficialSocials();
  React.useEffect(() => {
    document.documentElement.classList.toggle("alt-menu-open", open);
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("alt-menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const jump = (event, id) => {
    event.preventDefault();
    setOpen(false);
    altGoTo(id);
  };

  return (
    <header className={`alt-nav ${open ? "is-open" : ""}`}>
      <a href="#top" className="alt-nav__brand" onClick={(event) => jump(event, "top")} aria-label="NAUGHTY トップへ">
        <img src="assets/logo-naughty-white-transparent.png" alt="NAUGHTY" />
      </a>
      <div className="alt-nav__status"><i /><span>LIVE</span><b>{window.NTY.shop.open}</b></div>
      <nav className="alt-nav__links" aria-label="メインナビゲーション">
        {ALT_SECTIONS.map(([id, , label]) => (
          <a href={`#${id}`} onClick={(event) => jump(event, id)} key={id}>{label}</a>
        ))}
      </nav>
      <a className="alt-nav__recruit" href="#recruit" onClick={(event) => jump(event, "recruit")}>JOIN US <span>↗</span></a>
      <button className="alt-nav__toggle" type="button" aria-label="メニューを開閉" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <i /><i /><span>MENU</span>
      </button>
      <div className="alt-nav__drawer" aria-hidden={!open} onClick={() => setOpen(false)}>
        <div className="alt-nav__drawer-inner" onClick={(event) => event.stopPropagation()}>
          <p>NAVIGATION / AFTER DARK</p>
          {ALT_SECTIONS.map(([id, num, label]) => (
            <a href={`#${id}`} key={id} onClick={(event) => jump(event, id)}><small>{num}</small><span>{label}</span><b>↘</b></a>
          ))}
          <a href="#recruit" onClick={(event) => jump(event, "recruit")}><small>07</small><span>RECRUIT</span><b>↘</b></a>
          <div className="alt-nav__socials">
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer">OFFICIAL INSTAGRAM <b>↗</b></a>}
            {socials.x && <a href={socials.x} target="_blank" rel="noreferrer">OFFICIAL X <b>↗</b></a>}
          </div>
        </div>
      </div>
    </header>
  );
}

function AltHeading({ index, eyebrow, title, italic, note }) {
  return (
    <div className="alt-heading alt-reveal">
      <div className="alt-heading__index">{index}</div>
      <div className="alt-heading__body">
        <p>{eyebrow}</p>
        <span className="alt-heading__signal" aria-hidden="true" />
        <h2>{title} {italic && <em>{italic}</em>}</h2>
      </div>
      {note && <p className="alt-heading__note">{note}</p>}
    </div>
  );
}

function AltLiveDeck() {
  const counts = window.NTY.todayCounts;
  return (
    <section className="alt-live-deck" aria-label="現在の営業情報">
      <div className="alt-live-deck__pulse"><i /><span>NOW OPEN</span></div>
      <div><small>BUSINESS HOURS</small><strong>{window.NTY.shop.open}</strong></div>
      <div><small>TONIGHT</small><strong>{counts.total}<em> CAST</em></strong></div>
      <div><small>AREA</small><strong>{window.NTY.shop.areaJp}</strong></div>
      <a href={window.NTY.shop.instagramUrl} target="_blank" rel="noreferrer">INSTAGRAM <b>↗</b></a>
    </section>
  );
}

function AltUpdates() {
  const [selected, setSelected] = React.useState(null);
  const closeRef = React.useRef(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = (window.NTY.raw?.events || [])
    .filter((item) => item.publicVisible !== false && item.date && new Date(`${item.date}T00:00:00`) >= today)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 3);
  const items = upcoming.length ? upcoming : [
    { date: "UPDATE", title: "今夜の出勤を更新しました", summary: "当日の出勤写真と時間は、下のSHIFTから確認できます。", kind: "SHIFT" },
    {
      date: "INFO",
      title: "イベント情報は準備中です",
      summary: "決まり次第、公式Instagramとこのページでお知らせします。",
      kind: "新着",
      instagramUrl: window.NTY.shop.instagramUrl
    }
  ];
  const selectedUrl = altUpdateUrl(selected);

  React.useEffect(() => {
    if (!selected) return undefined;
    const previousFocus = document.activeElement;
    const close = () => setSelected(null);
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.documentElement.classList.add("alt-modal-open");
    window.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.documentElement.classList.remove("alt-modal-open");
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    };
  }, [selected]);

  return (
    <section className="alt-section alt-updates" id="updates" data-section-id="updates" data-alt-section="updates">
      <AltHeading index="01" eyebrow="UPDATE" title="新着情報" italic="" note="お知らせ・イベント情報を掲載します。" />
      <div className="alt-updates__grid alt-reveal">
        <div className="alt-updates__lead">
          <span>NEW</span>
          <p>この欄はCMSから更新できます。情報がない日は、古いイベントを出さず「準備中」と表示します。</p>
        </div>
        <div className="alt-updates__list">
          {items.map((item, index) => (
            <article key={`${item.date}-${item.title}-${index}`}>
              <button
                className="alt-updates__trigger"
                type="button"
                aria-haspopup="dialog"
                onClick={() => setSelected(item)}
              >
                <div>
                  <time dateTime={/^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : undefined}>{altUpdateDate(item.date)}</time>
                  <small>{item.tag || item.kind || "新着"}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary || item.description || "詳細は公式Instagramでお知らせします。"}</p>
                <span aria-hidden="true">＋</span>
              </button>
            </article>
          ))}
        </div>
      </div>
      {selected && ReactDOM.createPortal(
        <div
          className="alt-update-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <article
            className="alt-update-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alt-update-modal-title"
          >
            <button
              ref={closeRef}
              className="alt-update-modal__close"
              type="button"
              aria-label="新着情報を閉じる"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <div className="alt-update-modal__meta">
              <time dateTime={/^\d{4}-\d{2}-\d{2}$/.test(selected.date) ? selected.date : undefined}>{altUpdateDate(selected.date)}</time>
              <small>{selected.tag || selected.kind || "新着"}</small>
            </div>
            <p className="alt-update-modal__eyebrow">NAUGHTY / UPDATE</p>
            <h3 id="alt-update-modal-title">{selected.title}</h3>
            <p className="alt-update-modal__body">{selected.summary || selected.description || "詳細は公式Instagramでお知らせします。"}</p>
            {selectedUrl && (
              <a href={selectedUrl} target="_blank" rel="noreferrer">
                Instagramで見る <b>↗</b>
              </a>
            )}
          </article>
        </div>,
        document.body
      )}
    </section>
  );
}

function AltToday() {
  const source = window.NTY.todayList.length
    ? window.NTY.todayList
    : window.NTY.cast.slice(0, 5).map((cast) => ({ cast, time: cast.todayTime || "時間調整中", status: cast.todayState || "today" }));
  const members = source.slice(0, 7);
  const label = { now: "今いるよ", soon: "もうすぐ", today: "本日出勤", off: "次回を確認" };

  return (
    <section className="alt-section alt-today" id="shift" data-section-id="shift" data-alt-section="shift">
      <AltHeading index="02" eyebrow="TODAY'S CAST" title="本日の出勤" italic="" note="当日の宣材写真と出勤時間を、来店前にひと目で確認できます。" />
      <div className="alt-today-cards-wrap alt-reveal">
        <div className="alt-today-cards__head">
          <span>TONIGHT'S LINEUP</span>
          <small>{String(members.length).padStart(2, "0")} MEMBERS</small>
        </div>
        <div className="alt-today-cards">
          {members.map(({ cast, time, status }, index) => (
            <button
              type="button"
              className="alt-today-card"
              onClick={altGoToCast}
              aria-label={`${cast.jp}のキャスト紹介へ移動。${label[status] || "本日出勤"}、${time}`}
              key={cast.id || cast.en}
            >
              <span className="alt-today-card__media">
                <img src={cast.card || cast.img} alt="" loading={index < 4 ? "eager" : "lazy"} decoding="async" />
                <span className={`alt-today-card__status is-${status}`}><i />{label[status] || "本日出勤"}</span>
                <b>{String(index + 1).padStart(2, "0")}</b>
              </span>
              <span className="alt-today-card__body">
                <span className="alt-today-card__name"><small>{cast.en}</small><strong>{cast.jp}</strong></span>
                <span className="alt-today-card__shift"><small>SHIFT</small><strong>{time}</strong></span>
                <span className="alt-today-card__more">CAST PROFILE <b>→</b></span>
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="alt-today__schedule-link" onClick={() => altGoTo("monthly-shift")}>
          全体のスケジュールを見る <b>↘</b>
        </button>
      </div>
    </section>
  );
}

function AltSchedule() {
  const days = window.NTY.schedule.days;
  const [active, setActive] = React.useState(0);
  const current = days[active];

  return (
    <section className="alt-section alt-schedule" id="monthly-shift" data-section-id="monthly-shift" data-alt-section="shift">
      <AltHeading index="02B" eyebrow="MONTHLY SHIFT" title="出勤スケジュール" italic="" note="今後14日分の出勤予定を確認できます。" />
      <div className="alt-schedule__frame alt-reveal">
        <div className="alt-schedule__days" role="tablist" aria-label="出勤日を選択">
          {days.map((day, index) => (
            <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} onClick={() => setActive(index)} key={day.key}>
              <small>{day.dowEn}</small><strong>{day.d}</strong><span>{day.month}月</span>{day.isToday && <em>TODAY</em>}
            </button>
          ))}
        </div>
        <div className="alt-schedule__detail" key={current.key}>
          <div className="alt-schedule__date">
            <span>{current.month} / {String(current.d).padStart(2, "0")}</span>
            <h3>{current.dowJp}曜日<em>{current.isToday ? "今夜" : "予定"}</em></h3>
            <p>{current.closed ? "休業予定" : `${current.entries.length}名の出勤予定`}</p>
          </div>
          <div className="alt-schedule__cast-list">
            {current.entries.length ? current.entries.map(({ cast, time }, index) => (
              <article key={cast.id || cast.en}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <img src={cast.card || cast.img} alt="" loading="lazy" decoding="async" />
                <div><small>{cast.en}</small><strong>{cast.jp}</strong></div>
                <p>{time}</p>
              </article>
            )) : <div className="alt-empty">CLOSED / 次の営業日をご確認ください。</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function AltCast() {
  const cast = window.NTY.cast;
  const [active, setActive] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const closeRef = React.useRef(null);
  const current = cast[active];
  const currentSocials = altCastSocials(current.id);
  const selectedCast = selectedIndex === null ? null : cast[selectedIndex];
  const selectedMedia = selectedCast ? altCastMedia(selectedCast) : [];
  const selectedSocials = selectedCast ? altCastSocials(selectedCast.id) : {};
  const officialSocials = altOfficialSocials();

  const move = (amount) => setActive((value) => (value + amount + cast.length) % cast.length);
  const openCast = (index) => {
    setPhotoIndex(0);
    setSelectedIndex(index);
  };

  React.useEffect(() => {
    if (selectedIndex === null) return undefined;
    const previousFocus = document.activeElement;
    const close = () => setSelectedIndex(null);
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.documentElement.classList.add("alt-modal-open");
    window.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.documentElement.classList.remove("alt-modal-open");
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    };
  }, [selectedIndex]);

  const movePhoto = (amount) => {
    setPhotoIndex((value) => (value + amount + selectedMedia.length) % selectedMedia.length);
  };

  return (
    <section className="alt-section alt-cast" id="cast" data-section-id="cast" data-alt-section="cast">
      <AltHeading index="03" eyebrow="CAST" title="キャスト紹介" italic="" note="プロフィール・出勤予定・SNSを確認できます。" />
      <div className="alt-cast__stage alt-reveal">
        <div className="alt-cast__number">{String(active + 1).padStart(2, "0")}<span>/ {String(cast.length).padStart(2, "0")}</span></div>
        <button
          type="button"
          className="alt-cast__portrait alt-cast__portrait-button"
          onClick={() => openCast(active)}
          aria-haspopup="dialog"
          aria-label={`${current.jp}の写真と詳しいプロフィールを見る`}
        >
          <div className="alt-cast__halo" />
          <img src={current.real || current.card || current.img} alt={current.jp} loading="lazy" decoding="async" key={current.id || current.en} />
          <span>{current.en}</span>
          <small className="alt-cast__portrait-hint">写真とプロフィールを見る <b>＋</b></small>
        </button>
        <div className="alt-cast__copy" key={current.id || current.en}>
          <p className="alt-cast__status">{current.badge?.label || "CAST"}<span>{current.badge?.detail || current.next}</span></p>
          <small>{current.en}</small>
          <h3>{current.jp}</h3>
          <blockquote>“{current.catch}”</blockquote>
          <p>{current.comment}</p>
          <div className="alt-cast__tags">{current.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
          <div className="alt-cast__socials">
            {currentSocials.instagram && <a href={currentSocials.instagram} target="_blank" rel="noreferrer">INSTAGRAM <b>↗</b></a>}
            {currentSocials.x && <a href={currentSocials.x} target="_blank" rel="noreferrer">X <b>↗</b></a>}
            {!currentSocials.instagram && !currentSocials.x && <small>SNSは本人確認後に公開します</small>}
          </div>
          <div className="alt-cast__controls">
            <button type="button" onClick={() => move(-1)} aria-label="前のキャスト">←</button>
            <button type="button" onClick={() => move(1)} aria-label="次のキャスト">→</button>
          </div>
        </div>
        <div className="alt-cast__thumbs">
          {cast.map((item, index) => (
            <button type="button" className={active === index ? "is-active" : ""} onClick={() => setActive(index)} aria-label={item.jp} key={item.id || item.en}>
              <img src={item.card || item.real || item.img} alt="" loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>
      {selectedCast && ReactDOM.createPortal(
        <div
          className="alt-cast-modal"
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setSelectedIndex(null);
          }}
        >
          <article
            className="alt-cast-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alt-cast-modal-title"
            aria-describedby="alt-cast-modal-description"
          >
            <button
              ref={closeRef}
              className="alt-cast-modal__close"
              type="button"
              aria-label="キャスト紹介を閉じる"
              onClick={() => setSelectedIndex(null)}
            >
              ×
            </button>
            <div className="alt-cast-modal__gallery">
              <div className="alt-cast-modal__main-photo">
                <img
                  src={selectedMedia[photoIndex]?.src || selectedCast.card || selectedCast.real}
                  alt={`${selectedCast.jp} ${selectedMedia[photoIndex]?.label || "宣材写真"}`}
                  decoding="async"
                />
                <span>{selectedMedia[photoIndex]?.label || "PHOTO"} {String(photoIndex + 1).padStart(2, "0")} / {String(selectedMedia.length).padStart(2, "0")}</span>
                {selectedMedia.length > 1 && (
                  <div className="alt-cast-modal__photo-controls">
                    <button type="button" onClick={() => movePhoto(-1)} aria-label="前の写真">←</button>
                    <button type="button" onClick={() => movePhoto(1)} aria-label="次の写真">→</button>
                  </div>
                )}
              </div>
              {selectedMedia.length > 1 && (
                <div className="alt-cast-modal__thumbs" aria-label={`${selectedCast.jp}の写真一覧`}>
                  {selectedMedia.map((media, index) => (
                    <button
                      type="button"
                      className={photoIndex === index ? "is-active" : ""}
                      onClick={() => setPhotoIndex(index)}
                      aria-pressed={photoIndex === index}
                      aria-label={`${media.label} ${String(index + 1).padStart(2, "0")}を表示`}
                      key={media.src}
                    >
                      <img src={media.src} alt="" loading="lazy" decoding="async" />
                      <span>0{index + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="alt-cast-modal__profile">
              <p className="alt-cast-modal__status">
                <span>{selectedCast.badge?.label || "CAST"}</span>
                <small>{selectedCast.badge?.detail || selectedCast.next}</small>
              </p>
              <small className="alt-cast-modal__eyebrow">{selectedCast.en}</small>
              <h3 id="alt-cast-modal-title">{selectedCast.jp}</h3>
              <blockquote>“{selectedCast.catch}”</blockquote>
              <p id="alt-cast-modal-description">{selectedCast.comment}</p>
              <div className="alt-cast-modal__tags">{selectedCast.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
              <nav className="alt-cast-modal__socials" aria-label={`${selectedCast.jp}のSNS`}>
                {selectedSocials.instagram && <a href={selectedSocials.instagram} target="_blank" rel="noreferrer">本人のINSTAGRAM <b>↗</b></a>}
                {selectedSocials.x && <a href={selectedSocials.x} target="_blank" rel="noreferrer">X <b>↗</b></a>}
                {!selectedSocials.instagram && officialSocials.instagram && (
                  <a href={officialSocials.instagram} target="_blank" rel="noreferrer">MORE PHOTOS / INSTAGRAM <b>↗</b></a>
                )}
                {!selectedSocials.instagram && !selectedSocials.x && !officialSocials.instagram && <span>SNSは本人確認後に公開します</span>}
              </nav>
            </div>
          </article>
        </div>,
        document.body
      )}
    </section>
  );
}

function AltMenu() {
  const products = (window.NTY.raw?.products || []).filter((item) => item.active !== false);
  const shop = altRawShop();
  return (
    <section className="alt-section alt-menu" id="menu" data-section-id="menu" data-alt-section="menu">
      <AltHeading index="04" eyebrow="MENU / PRICE" title="メニュー一覧" italic="" note="料金と、お会計時の税・決済方法別手数料をご案内します。" />
      <div className="alt-menu__layout alt-reveal">
        <div className="alt-menu__intro">
          <span>NAUGHTY MENU</span>
          <h3>{shop.charge || "60min / 1,000yen"}</h3>
          <p>{shop.orderRule || "1 drink order"}</p>
          <div className="alt-menu__fees">
            <p><span>CASH</span><strong>表示価格 ＋ 税10%</strong></p>
            <p><span>CARD / E-MONEY</span><strong>表示価格 ＋ 決済手数料10% ＋ 税10%</strong></p>
          </div>
          <small>掲載中の内容は確認用です。正式価格・計算順・決済規約を確認後、CMSから確定します。</small>
        </div>
        <div className="alt-menu__list">
          {products.length ? products.map((item, index) => (
            <article key={item.id || `${item.name}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.category || "MENU"}</small><h3>{item.name}</h3><p>{item.description}</p></div>
              <strong>{altYen(item.salePrice)}</strong>
              {item.eventOnly && <em>EVENT ONLY</em>}
            </article>
          )) : <div className="alt-empty">メニューを準備中です。公式Instagramからお問い合わせください。</div>}
        </div>
      </div>
    </section>
  );
}

function AltSpace() {
  const gallery = window.NTY.gallery.length
    ? window.NTY.gallery
    : window.NTY.inside.map((item, index) => ({ id: item.slot, image: item.image, title: item.title, caption: item.body, no: `0${index + 1}` }));
  const inside = window.NTY.inside;

  return (
    <section className="alt-section alt-space" id="space" data-section-id="gallery" data-alt-section="space">
      <AltHeading index="04" eyebrow="SPACE / INTERIOR" title="秘密にしたい、" italic="でも見せたい。" note="光、距離、音。NAUGHTYの夜をつくる場所。" />
      <div className="alt-space__mosaic alt-reveal">
        {gallery.slice(0, 4).map((item, index) => (
          <figure className={`alt-space__image alt-space__image--${index + 1}`} key={item.id || index}>
            <img src={item.image || inside[index % inside.length]?.image} alt={item.title || "NAUGHTY店内"} loading="lazy" decoding="async" />
            <figcaption><small>{item.no || `0${index + 1}`}</small><strong>{item.title}</strong><span>{item.caption}</span></figcaption>
          </figure>
        ))}
        <div className="alt-space__manifesto">
          <span>INSIDE NAUGHTY</span>
          <p>黒に沈む輪郭。<br />ピンクに浮かぶ表情。<br /><em>近すぎない距離が、ちょうどいい。</em></p>
        </div>
      </div>
      <div className="alt-space__features alt-reveal">
        {inside.map((item, index) => (
          <article key={item.slot}><small>0{index + 1}</small><h3>{item.title}</h3><p>{item.body}</p><div>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
        ))}
      </div>
    </section>
  );
}

function AltEvents() {
  const items = window.NTY.events.items || [];
  const cards = items.length ? items : [{ date: "COMING SOON", tag: "EVENT", title: "次のいたずらを準備中。", desc: "最新情報はInstagramでお知らせします。" }];
  return (
    <section className="alt-section alt-events" id="event" data-section-id="event" data-alt-section="event">
      <AltHeading index="05" eyebrow="EVENT / SPECIAL NIGHT" title="いつもの夜に、" italic="理由をつくる。" note="限定イベントや衣装デーを、ポスターのように。" />
      <div className="alt-events__grid alt-reveal">
        {cards.slice(0, 3).map((item, index) => (
          <article className={index === 0 ? "is-featured" : ""} key={`${item.date}-${index}`}>
            <div className="alt-events__meta"><span>{item.date}</span><small>{item.tag}</small></div>
            <b>0{index + 1}</b>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <a href={window.NTY.shop.instagramUrl} target="_blank" rel="noreferrer">DETAIL ON INSTAGRAM <span>↗</span></a>
          </article>
        ))}
      </div>
    </section>
  );
}

function AltAccess() {
  const shop = window.NTY.shop;
  return (
    <section className="alt-section alt-access" id="access" data-section-id="access" data-alt-section="access">
      <AltHeading index="05" eyebrow="ACCESS / NAGAREKAWA" title="アクセス" italic="" note="広島・流川。Googleマップで場所をご確認いただけます。" />
      <div className="alt-access__grid alt-reveal">
        <div className="alt-access__map">
          <iframe
            title="NAUGHTY周辺のGoogleマップ"
            src={shop.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="alt-access__map-label" aria-hidden="true">
            <small>NAUGHTY / NAGAREKAWA</small>
            <strong>Google Map</strong>
          </div>
        </div>
        <div className="alt-access__info">
          <div><small>ADDRESS</small><strong>{shop.address}</strong><p>{shop.addressNote}</p></div>
          <div className="alt-access__facts">
            <p><small>OPEN</small><strong>{shop.open}</strong></p>
            <p><small>HOLIDAY</small><strong>{shop.holiday}</strong></p>
            <p><small>PAYMENT</small><strong>{shop.pay}</strong></p>
          </div>
          <div className="alt-access__actions">
            <a href={shop.mapUrl} target="_blank" rel="noreferrer">GOOGLE MAP <b>↗</b></a>
            <a href={shop.instagramUrl} target="_blank" rel="noreferrer">DM / INSTAGRAM <b>↗</b></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function AltContact() {
  const socials = altOfficialSocials();
  const shop = altRawShop();
  const [copied, setCopied] = React.useState(false);
  const inquiryText = shop.inquiryTemplate || "NAUGHTYのサイトを見ました。来店について問い合わせたいです。希望日：／人数：／お名前：";
  const copyInquiry = async () => {
    try {
      await navigator.clipboard.writeText(inquiryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch (error) {
      window.prompt("下の文章をコピーしてください", inquiryText);
    }
  };
  return (
    <section className="alt-section alt-contact" id="contact" data-section-id="contact" data-alt-section="contact">
      <AltHeading index="06" eyebrow="CONTACT / SOCIAL" title="お問い合わせは、" italic="こちらから。" note="問い合わせ文をコピーして、公式InstagramのDMへ貼り付けられます。" />
      <div className="alt-contact__grid alt-reveal">
        <div className="alt-contact__social">
          <small>OFFICIAL ACCOUNT</small>
          <h3>最新の写真と営業情報は<br />公式SNSから。</h3>
          <div>
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer"><span>INSTAGRAM</span><b>↗</b></a>}
            {socials.x && <a href={socials.x} target="_blank" rel="noreferrer"><span>X</span><b>↗</b></a>}
          </div>
        </div>
        <div className="alt-contact__copy">
          <small>DM TEMPLATE</small>
          <p>{inquiryText}</p>
          <button type="button" onClick={copyInquiry}><span>{copied ? "コピーしました" : "問い合わせ文をコピー"}</span><b>{copied ? "✓" : "COPY"}</b></button>
        </div>
        <div className="alt-contact__recruit">
          <small>RECRUIT</small>
          <h3>一緒に夜をつくる<br />キャストを募集。</h3>
          <button type="button" onClick={() => altGoTo("recruit")}>求人を見る <b>↘</b></button>
        </div>
      </div>
    </section>
  );
}

function AltRecruit() {
  const recruit = window.NTY.recruit;
  const instagram = altOfficialSocials().instagram;
  const [application, setApplication] = React.useState({
    name: "",
    age: "",
    instagramId: "",
    experience: "未経験",
    schedule: "",
    interview: "",
    message: ""
  });
  const [copyState, setCopyState] = React.useState("idle");

  const applicationText = [
    "【NAUGHTY キャスト応募】",
    "",
    `お名前・呼ばれたい名前：${application.name.trim() || "未入力"}`,
    `年齢：${application.age.trim() || "未入力"}`,
    `Instagram ID：${application.instagramId.trim() || "未入力"}`,
    `接客・コンカフェ経験：${application.experience || "未入力"}`,
    `希望シフト：${application.schedule.trim() || "未定"}`,
    `面接希望日時：${application.interview.trim() || "未定"}`,
    `質問・メッセージ：${application.message.trim() || "特になし"}`
  ].join("\n");

  const updateApplication = (event) => {
    const { name, value } = event.currentTarget;
    setApplication((current) => ({ ...current, [name]: value }));
    setCopyState("idle");
  };

  const copyApplication = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      setCopyState("invalid");
      return;
    }
    const copied = await altCopyText(applicationText);
    setCopyState(copied ? "copied" : "manual");
  };

  return (
    <section className="alt-recruit" id="recruit" data-section-id="recruit" data-alt-section="recruit">
      <div className="alt-recruit__marquee" aria-hidden="true"><span>JOIN THE NIGHT · NAUGHTY GIRLS · JOIN THE NIGHT · NAUGHTY GIRLS ·&nbsp;</span><span>JOIN THE NIGHT · NAUGHTY GIRLS · JOIN THE NIGHT · NAUGHTY GIRLS ·&nbsp;</span></div>
      <div className="alt-recruit__inner alt-reveal">
        <p>{recruit.kicker}</p>
        <h2>その夜の主役に、<br /><em>なってみない？</em></h2>
        <div className="alt-recruit__copy"><p>{recruit.sub}</p><p className="alt-recruit__copy-note">入力した内容はサイトから直接送信されません。コピーして、ご自身でInstagramのDMへ貼り付けてください。</p></div>
        <ol className="alt-recruit__steps" aria-label="応募の流れ">
          <li><small>STEP 01</small><strong>フォームに入力</strong></li>
          <li><small>STEP 02</small><strong>応募文をコピー</strong></li>
          <li><small>STEP 03</small><strong>InstagramのDMへ送信</strong></li>
        </ol>

        <form className="alt-recruit__application" onSubmit={copyApplication} onInvalid={() => setCopyState("invalid")} aria-describedby="recruit-form-help">
          <div className="alt-recruit__form-fields">
            <div className="alt-recruit__form-head">
              <small>APPLICATION FORM</small>
              <h3>応募内容を入力</h3>
              <p id="recruit-form-help">必須は2項目だけ。決まっていない内容は空欄でも大丈夫です。</p>
            </div>
            <label>
              <span>お名前・呼ばれたい名前 <b>必須</b></span>
              <input name="name" type="text" autoComplete="name" value={application.name} onChange={updateApplication} placeholder="例：なな / 山田 花子" required />
            </label>
            <label>
              <span>年齢 <b>必須</b></span>
              <input name="age" type="text" inputMode="numeric" autoComplete="off" value={application.age} onChange={updateApplication} placeholder="例：20歳" required />
            </label>
            <label>
              <span>Instagram ID</span>
              <input name="instagramId" type="text" autoComplete="off" value={application.instagramId} onChange={updateApplication} placeholder="例：@your_account" />
            </label>
            <label>
              <span>接客・コンカフェ経験</span>
              <select name="experience" value={application.experience} onChange={updateApplication} aria-label="接客・コンカフェ経験">
                <option>未経験</option>
                <option>経験あり</option>
                <option>体験入店を相談したい</option>
              </select>
            </label>
            <label>
              <span>希望シフト</span>
              <input name="schedule" type="text" value={application.schedule} onChange={updateApplication} placeholder="例：週2日 / 21時以降" />
            </label>
            <label>
              <span>面接希望日時</span>
              <input name="interview" type="text" value={application.interview} onChange={updateApplication} placeholder="例：7月25日 18時以降" />
            </label>
            <label className="is-wide">
              <span>質問・メッセージ</span>
              <textarea name="message" rows="5" value={application.message} onChange={updateApplication} placeholder="気になることや、事前に伝えておきたいことがあれば入力してください。" />
            </label>
          </div>

          <div className="alt-recruit__form-output">
            <div className="alt-recruit__preview-head"><small>DM PREVIEW</small><span>コピーされる文章</span></div>
            <textarea value={applicationText} readOnly aria-label="コピーされる応募文" onFocus={(event) => event.currentTarget.select()} />
            <div className="alt-recruit__form-actions">
              <button type="submit" className={copyState === "copied" ? "is-copied" : ""}>
                <span>{copyState === "copied" ? "応募文をコピーしました" : "応募文をコピー"}</span><b>{copyState === "copied" ? "✓" : "COPY"}</b>
              </button>
              <a className={copyState === "copied" ? "is-ready" : ""} href={instagram || "#contact"} target={instagram ? "_blank" : undefined} rel={instagram ? "noreferrer" : undefined}>
                <span>{copyState === "copied" ? "Instagramを開いて貼り付ける" : "Instagramを開く"}</span><b>↗</b>
              </a>
            </div>
            <p className={`alt-recruit__form-status is-${copyState}`} role="status" aria-live="polite">
              {copyState === "copied" && "コピー完了。次にInstagramを開き、NAUGHTYのDMへ貼り付けて送信してください。"}
              {copyState === "invalid" && "お名前と年齢を入力してください。"}
              {copyState === "manual" && "自動コピーができませんでした。上の文章を長押ししてコピーしてください。"}
              {copyState === "idle" && "入力内容はこの端末内で応募文に整えるだけで、自動送信・保存はされません。"}
            </p>
          </div>
        </form>

        <div className="alt-recruit__merits">{recruit.merits.map((item, index) => <article key={item.t}><small>0{index + 1}</small><strong>{item.t}</strong><p>{item.d}</p></article>)}</div>
      </div>
    </section>
  );
}

function AltFooter() {
  return (
    <footer className="alt-footer">
      <img src="assets/logo-naughty-white-transparent.png" alt="NAUGHTY" />
      <div><p>CONCEPT CAFE / HIROSHIMA, NAGAREKAWA</p><span>夜、こっそりはじまる。ちょっとした、いたずら。</span></div>
      <nav>
        {ALT_SECTIONS.map(([id, , label]) => <a href={`#${id}`} onClick={(event) => { event.preventDefault(); altGoTo(id); }} key={id}>{label}</a>)}
        <a href="#recruit" onClick={(event) => { event.preventDefault(); altGoTo("recruit"); }}>RECRUIT</a>
      </nav>
      <small>© 2026 NAUGHTY / LOCAL DESIGN STUDY</small>
    </footer>
  );
}

Object.assign(window, { AltNav, AltHeading, AltLiveDeck, AltUpdates, AltToday, AltSchedule, AltCast, AltMenu, AltSpace, AltEvents, AltAccess, AltContact, AltRecruit, AltFooter, altGoTo, altOfficialSocials });
