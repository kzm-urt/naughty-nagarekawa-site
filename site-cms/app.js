(function () {
  const STORAGE_KEY = "naughty.publicSiteData.v1";
  const BACKUP_KEY = "naughty.publicSiteData.backups.v1";
  const PUBLIC_ROOT = "../08_site_v14_netlify_20260719/";
  const PHOTO_FIELDS = ["photo", "heroRealPhoto", "portraitIcon"];
  const clone = (value) => JSON.parse(JSON.stringify(value || {}));
  const $ = (selector) => document.querySelector(selector);

  let data = loadData();
  let selectedStaffId = data.staff[0]?.id || "";
  let dirty = false;
  let toastTimer = 0;

  function loadData() {
    const fallback = clone(window.NAUGHTY_SITE_DATA || {});
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || !Array.isArray(saved.staff)) return fallback;
      return {
        ...fallback,
        ...saved,
        shop: { ...(fallback.shop || {}), ...(saved.shop || {}) },
        staff: saved.staff
      };
    } catch (error) {
      return fallback;
    }
  }

  function currentStaff() {
    return data.staff.find((staff) => staff.id === selectedStaffId) || data.staff[0] || null;
  }

  function safeImage(value) {
    const path = String(value || "").trim();
    if (!path) return "";
    if (/^(data:|blob:|https?:)/i.test(path)) return path;
    return `${PUBLIC_ROOT}${path.replace(/^\.\//, "")}`;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function markDirty(message = "未保存の変更があります") {
    dirty = true;
    $(".save-bar").classList.add("is-dirty");
    $("#save-state").textContent = message;
    $("#save-detail").textContent = "保存するとサイト確認画面へ反映されます";
  }

  function markSaved(message = "保存しました") {
    dirty = false;
    $(".save-bar").classList.remove("is-dirty");
    $("#save-state").textContent = message;
    $("#save-detail").textContent = new Date().toLocaleString("ja-JP");
  }

  function updatePreview(field, value) {
    const image = $(`#preview-${field}`);
    const src = safeImage(value);
    image.src = src;
    image.hidden = !src;
  }

  function renderStaffList() {
    $("#cast-list").innerHTML = data.staff.map((staff) => `
      <button
        type="button"
        role="listitem"
        class="${staff.id === selectedStaffId ? "is-active" : ""} ${staff.publicVisible !== false ? "is-visible" : ""}"
        data-staff-id="${escapeHtml(staff.id)}"
        aria-pressed="${staff.id === selectedStaffId}"
      >
        <img src="${escapeHtml(safeImage(staff.portraitIcon || staff.photo || staff.heroRealPhoto) || `${PUBLIC_ROOT}assets/logo-naughty-white-circle.webp`)}" alt="" />
        <span><strong>${escapeHtml(staff.displayName || "名称未設定")}</strong><small>${escapeHtml(String(staff.romanName || "CAST").toUpperCase())}</small></span>
        <em aria-label="${staff.publicVisible !== false ? "公開" : "非公開"}"></em>
      </button>
    `).join("");
  }

  function renderForm() {
    const staff = currentStaff();
    if (!staff) return;
    $("#editor-title").textContent = staff.displayName || "名称未設定";
    $("#editor-roman").textContent = String(staff.romanName || "CAST").toUpperCase();
    $("#staff-visible").checked = staff.publicVisible !== false;
    $("#staff-name").value = staff.displayName || "";
    $("#staff-roman").value = staff.romanName || "";
    $("#staff-short").value = staff.shortComment || "";
    $("#staff-profile").value = staff.profileText || "";
    $("#staff-tags").value = Array.isArray(staff.tags) ? staff.tags.join(", ") : "";
    $("#staff-instagram").value = staff.instagramUrl || staff.instagram || "";
    $("#staff-x").value = staff.xUrl || staff.x || "";
    $("#staff-status").value = staff.workStatus || "off";
    PHOTO_FIELDS.forEach((field) => {
      $(`#staff-${field}`).value = staff[field] || "";
      updatePreview(field, staff[field]);
    });
  }

  function writeForm() {
    const staff = currentStaff();
    if (!staff) return;
    staff.publicVisible = $("#staff-visible").checked;
    staff.displayName = $("#staff-name").value.trim();
    staff.romanName = $("#staff-roman").value.trim().toUpperCase();
    staff.shortComment = $("#staff-short").value.trim();
    staff.profileText = $("#staff-profile").value.trim();
    staff.tags = $("#staff-tags").value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).slice(0, 4);
    staff.instagram = $("#staff-instagram").value.trim();
    staff.instagramUrl = staff.instagram;
    staff.x = $("#staff-x").value.trim();
    staff.xUrl = staff.x;
    staff.workStatus = $("#staff-status").value;
    PHOTO_FIELDS.forEach((field) => {
      staff[field] = $(`#staff-${field}`).value.trim();
    });
    data.updatedAt = new Date().toISOString();
  }

  function readBackups() {
    try {
      const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || "[]");
      return Array.isArray(backups) ? backups : [];
    } catch (error) {
      return [];
    }
  }

  function saveBackup(snapshot, reason) {
    const backups = readBackups();
    backups.push({
      savedAt: new Date().toISOString(),
      reason,
      data: snapshot
    });
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  }

  function saveData() {
    writeForm();
    const previous = localStorage.getItem(STORAGE_KEY);
    if (previous) {
      try {
        saveBackup(JSON.parse(previous), "保存前の自動バックアップ");
      } catch (error) {
        showToast("容量不足のため保存できません。先にバックアップを書き出してください。");
        return false;
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      showToast("画像容量が大きすぎます。写真を小さくして再度お試しください。");
      return false;
    }
    renderStaffList();
    renderForm();
    markSaved();
    showToast("保存しました。サイト確認画面にも反映されます。");
    return true;
  }

  function selectStaff(id) {
    writeForm();
    selectedStaffId = id;
    renderStaffList();
    renderForm();
  }

  function addStaff() {
    writeForm();
    const serial = Date.now().toString(36);
    const staff = {
      id: `staff_${serial}`,
      displayName: "新しいキャスト",
      romanName: "NEW CAST",
      role: "cast",
      profileText: "",
      shortComment: "",
      photo: "",
      heroPhoto: "",
      heroRealPhoto: "",
      portraitIcon: "",
      tags: [],
      instagram: "",
      x: "",
      publicVisible: false,
      workStatus: "off"
    };
    data.staff.push(staff);
    selectedStaffId = staff.id;
    renderStaffList();
    renderForm();
    markDirty("新しいキャストを追加しました");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function estimateDataUrlBytes(dataUrl) {
    const payload = String(dataUrl || "").split(",")[1] || "";
    return Math.ceil(payload.length * 0.75);
  }

  function fileToCompressedDataUrl(file) {
    return new Promise((resolve, reject) => {
      const source = new Image();
      const objectUrl = URL.createObjectURL(file);
      source.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const max = 1200;
        const scale = Math.min(1, max / Math.max(source.naturalWidth, source.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        let output = canvas.toDataURL("image/webp", 0.78);
        if (estimateDataUrlBytes(output) > 360000) output = canvas.toDataURL("image/webp", 0.62);
        resolve(output);
      };
      source.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("画像を読み込めませんでした"));
      };
      source.src = objectUrl;
    });
  }

  async function handleUpload(field, file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("画像ファイルを選んでください。");
      return;
    }
    showToast("画像を軽くしています…");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      $(`#staff-${field}`).value = dataUrl;
      updatePreview(field, dataUrl);
      markDirty("写真を変更しました");
    } catch (error) {
      showToast(error.message || "画像を読み込めませんでした。");
    }
  }

  function exportBackup() {
    writeForm();
    const payload = {
      exportedAt: new Date().toISOString(),
      current: data,
      backups: readBackups()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `naughty-site-content-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
    showToast("バックアップファイルを書き出しました。");
  }

  function restoreLatest() {
    const backups = readBackups();
    const latest = backups.at(-1);
    if (!latest?.data) {
      showToast("戻せるバックアップがありません。");
      return;
    }
    if (!window.confirm("現在の内容を控えに残して、直前の内容へ戻しますか？")) return;
    writeForm();
    try {
      saveBackup(clone(data), "復元前の自動バックアップ");
      data = clone(latest.data);
      selectedStaffId = data.staff[0]?.id || "";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      renderStaffList();
      renderForm();
      markSaved("直前の内容へ戻しました");
      showToast("復元しました。");
    } catch (error) {
      showToast("復元できませんでした。");
    }
  }

  $("#cast-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-staff-id]");
    if (button) selectStaff(button.dataset.staffId);
  });

  $("#add-cast").addEventListener("click", addStaff);

  $("#cast-form").addEventListener("input", (event) => {
    if (event.target.matches("#staff-name, #staff-roman")) {
      $("#editor-title").textContent = $("#staff-name").value || "名称未設定";
      $("#editor-roman").textContent = ($("#staff-roman").value || "CAST").toUpperCase();
    }
    if (event.target.id.startsWith("staff-")) {
      const field = PHOTO_FIELDS.find((name) => event.target.id === `staff-${name}`);
      if (field) updatePreview(field, event.target.value);
    }
    markDirty();
  });

  $("#cast-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveData();
  });

  document.querySelectorAll("[data-upload]").forEach((button) => {
    button.addEventListener("click", () => $(`#file-${button.dataset.upload}`).click());
  });

  PHOTO_FIELDS.forEach((field) => {
    $(`#file-${field}`).addEventListener("change", (event) => handleUpload(field, event.target.files?.[0]));
  });

  $("#export-backup").addEventListener("click", exportBackup);
  $("#restore-backup").addEventListener("click", restoreLatest);

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  renderStaffList();
  renderForm();
})();
