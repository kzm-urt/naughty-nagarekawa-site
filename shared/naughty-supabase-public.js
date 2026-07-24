(function () {
  const config = window.NAUGHTY_RUNTIME_CONFIG || {};
  const enabled = config.mode === "supabase"
    && /^https:\/\//.test(String(config.supabaseUrl || ""))
    && Boolean(config.supabasePublishableKey);

  async function loadPublicData() {
    if (!enabled) return null;
    const response = await fetch(`${config.supabaseUrl}/functions/v1/public-site-data`, {
      headers: { apikey: config.supabasePublishableKey }
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || `public-site-data ${response.status}`);
    return result;
  }

  window.NaughtyBackend = {
    enabled,
    loadPublicData
  };
})();
