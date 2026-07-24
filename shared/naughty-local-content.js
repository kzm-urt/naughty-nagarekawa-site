(function () {
  const STORAGE_KEY = "naughty.publicSiteData.v1";

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved === "object" && Array.isArray(saved.staff)) {
      window.NAUGHTY_REMOTE_DATA = saved;
    }
  } catch (error) {
    console.warn("NAUGHTY public content could not be loaded.", error);
  }

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) window.location.reload();
  });

  window.NaughtyLocalContent = { storageKey: STORAGE_KEY };
})();
