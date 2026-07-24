/* Production deploy: replace the blank values at deploy time. Never put a service-role key here. */
window.NAUGHTY_RUNTIME_CONFIG = window.NAUGHTY_RUNTIME_CONFIG || {
  mode: "local",
  supabaseUrl: "",
  supabasePublishableKey: ""
};
