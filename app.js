const STORAGE_KEYS = {
  stories: "umbral_stories_v1",
  creatorPosts: "umbral_creator_posts_v1",
  users: "umbral_users_v1",
  session: "umbral_active_session_v1",
  notifs: "umbral_notifications_v1",
  follows: "umbral_follows_v1",
  blocks: "umbral_blocks_v1",
  prefs: "umbral_feed_prefs_v1"
};

const LIMITS = {
  maxUploadBytes: 2 * 1024 * 1024,
  maxStoryMediaBytes: 8 * 1024 * 1024,
  avatarPx: 160,
  avatarQuality: 0.75,
  bannerMaxW: 1200,
  bannerMaxH: 380,
  bannerQuality: 0.78
};

const isDataImage = (v) => typeof v === "string" && v.startsWith("data:image");
const isDataVideo = (v) => typeof v === "string" && v.startsWith("data:video");
const byId = (id) => document.getElementById(id);

function loadData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn("Error leyendo storage:", key, err);
    return fallback;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.warn("Error guardando en storage:", key, err);
    return false;
  }
}

function getCurrentUser() {
  return loadData(STORAGE_KEYS.session, null);
}

function buildSessionPayload(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    channel: user.channel || "",
    socials: user.socials || "",
    avatar: user.avatar || "",
    banner: user.banner || "",
    shortDesc: user.shortDesc || "",
    bio: user.bio || "",
    allowPublicFollowLists:
      typeof user.allowPublicFollowLists === "boolean" ? user.allowPublicFollowLists : true
  };
}

function syncUserAcrossStorage(updatedUser) {
  saveData(STORAGE_KEYS.session, updatedUser);
  const users = loadData(STORAGE_KEYS.users, []);
  const idx = users.findIndex((u) => u.id === updatedUser.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatedUser };
    saveData(STORAGE_KEYS.users, users);
  }
}

function updateUserReferencesInPosts(userId, newUsername, newAvatar, newChannel) {
  const stories = loadData(STORAGE_KEYS.stories, []);
  let changedStories = false;
  stories.forEach((s) => {
    if (s.authorId === userId) {
      s.author = newUsername;
      s.authorAvatar = newAvatar;
      changedStories = true;
    }
  });
  if (changedStories) saveData(STORAGE_KEYS.stories, stories);

  const posts = loadData(STORAGE_KEYS.creatorPosts, []);
  let changedPosts = false;
  posts.forEach((p) => {
    if (p.authorId === userId) {
      p.channel = newUsername;
      p.authorAvatar = newAvatar;
      if (newChannel) p.network = newChannel;
      changedPosts = true;
    }
  });
  if (changedPosts) saveData(STORAGE_KEYS.creatorPosts, posts);
}

function buildHandleSlug(username = "", fallbackId = "") {
  const clean = String(username || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return clean ? `@${clean}` : `@${String(fallbackId || "user").slice(0, 6)}`;
}

function resolveUserInfo(userKey = "", fallbackName = "") {
  const users = loadData(STORAGE_KEYS.users, []);
  const session = getCurrentUser();
  const found =
    users.find((u) => u.id === userKey) ||
    (session?.id === userKey ? session : null) ||
    (fallbackName ? users.find((u) => u.username.toLowerCase() === fallbackName.toLowerCase()) : null);

  const id = found?.id || userKey || fallbackName || "usuario";
  const username = found?.username || fallbackName || id;
  return {
    id,
    username,
    handle: buildHandleSlug(username, id),
    role: found?.role || "usuario",
    channel: found?.channel || "",
    shortDesc: found?.shortDesc || "",
    avatar: found?.avatar || "",
    allowPublicFollowLists:
      typeof found?.allowPublicFollowLists === "boolean" ? found.allowPublicFollowLists : true
  };
}

function lookupAvatarForEntry({ authorId = "", name = "", fallbackAvatar = "" }) {
  if (isDataImage(fallbackAvatar)) return fallbackAvatar;
  const users = loadData(STORAGE_KEYS.users, []);
  const session = getCurrentUser();
  const norm = String(name || "").trim().toLowerCase();

  const matched =
    users.find((u) => authorId && u.id === authorId) ||
    (session?.id && authorId && session.id === authorId ? session : null) ||
    (norm ? users.find((u) => (u.username || "").toLowerCase() === norm) : null) ||
    (session?.username && norm && session.username.toLowerCase() === norm ? session : null);

  return isDataImage(matched?.avatar) ? matched.avatar : "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function showFormError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function hideFormError(el) {
  if (el) el.style.display = "none";
}

// --- VISOR AMPLIADO ---
let lightboxRefs = null;

function ensureMediaLightbox() {
  if (lightboxRefs) return lightboxRefs;

  const backdrop = document.createElement("div");
  backdrop.className = "media-lightbox-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const card = document.createElement("div");
  card.className = "media-lightbox-card";

  const img = document.createElement("img");
  img.alt = "Vista ampliada";

  const footer = document.createElement("div");
  footer.className = "media-lightbox-footer";

  const caption = document.createElement("span");
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "media-lightbox-close";
  closeBtn.textContent = "Cerrar";

  footer.append(caption, closeBtn);
  card.append(img, footer);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const close = () => {
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden", "true");
  };

  const open = (src, label = "") => {
    if (!isDataImage(src)) return;
    img.src = src;
    caption.textContent = label || "Vista ampliada";
    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden", "false");
  };

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.classList.contains("is-open")) close();
  });

  lightboxRefs = { open, close };
  return lightboxRefs;
}

// --- BANNER Y RECORTE DE AVATAR ---
function createBannerUploader({ fileInput, previewBoxEl, previewImgEl, initialDataUrl = "" }) {
  let bannerSrc = initialDataUrl || "";

  const syncPreview = () => {
    if (!previewBoxEl || !previewImgEl) return;
    if (isDataImage(bannerSrc)) {
      previewImgEl.src = bannerSrc;
      previewBoxEl.classList.add("is-visible");
    } else {
      previewImgEl.removeAttribute("src");
      previewBoxEl.classList.remove("is-visible");
    }
  };

  const resizeBanner = (rawDataUrl) =>
    new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const natW = image.naturalWidth || LIMITS.bannerMaxW;
        const natH = image.naturalHeight || LIMITS.bannerMaxH;
        const scale = Math.min(1, LIMITS.bannerMaxW / natW, LIMITS.bannerMaxH / natH);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(natW * scale));
        canvas.height = Math.max(1, Math.round(natH * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", LIMITS.bannerQuality));
      };
      image.onerror = () => resolve(rawDataUrl);
      image.src = rawDataUrl;
    });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > LIMITS.maxUploadBytes) {
      fileInput.value = "";
      return;
    }
    bannerSrc = await resizeBanner(await readFileAsDataUrl(file));
    syncPreview();
  });

  syncPreview();
  return { getBannerDataUrl: () => bannerSrc };
}

function createAvatarCropper({ fileInput, stageEl, imgEl, zoomInput, errorEl, initialDataUrl = "" }) {
  const state = {
    src: initialDataUrl || "",
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    natW: LIMITS.avatarPx,
    natH: LIMITS.avatarPx
  };

  const getStageSize = () => {
    const w = stageEl?.getBoundingClientRect().width || stageEl?.clientWidth || 180;
    return w > 0 ? w : 180;
  };

  const getBaseScale = (stageSize) =>
    Math.max(stageSize / Math.max(1, state.natW), stageSize / Math.max(1, state.natH));

  const clampOffsets = () => {
    const stageSize = getStageSize();
    const totalScale = getBaseScale(stageSize) * state.zoom;
    const maxX = Math.max(0, (state.natW * totalScale - stageSize) / 2);
    const maxY = Math.max(0, (state.natH * totalScale - stageSize) / 2);
    state.offsetX = Math.min(maxX, Math.max(-maxX, state.offsetX));
    state.offsetY = Math.min(maxY, Math.max(-maxY, state.offsetY));
  };

  const applyTransform = () => {
    if (!imgEl) return;
    const stageSize = getStageSize();
    const baseScale = getBaseScale(stageSize);
    clampOffsets();
    Object.assign(imgEl.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: `${state.natW * baseScale}px`,
      height: `${state.natH * baseScale}px`,
      maxWidth: "none",
      maxHeight: "none",
      transformOrigin: "center center",
      transform: `translate3d(calc(-50% + ${state.offsetX}px), calc(-50% + ${state.offsetY}px), 0) scale(${state.zoom})`
    });
  };

  const loadDims = (src, reset = false) => {
    if (!src) return;
    const probe = new Image();
    probe.onload = () => {
      state.natW = probe.naturalWidth || LIMITS.avatarPx;
      state.natH = probe.naturalHeight || LIMITS.avatarPx;
      if (reset) {
        state.zoom = 1;
        state.offsetX = 0;
        state.offsetY = 0;
        if (zoomInput) zoomInput.value = "1";
      }
      applyTransform();
    };
    probe.src = src;
  };

  const showIfReady = (reset = false) => {
    if (!stageEl || !imgEl || !zoomInput) return;
    if (!state.src) {
      stageEl.style.display = "none";
      if (zoomInput.parentElement) zoomInput.parentElement.style.display = "none";
      return;
    }
    imgEl.src = state.src;
    Object.assign(stageEl.style, {
      display: "block",
      position: "relative",
      overflow: "hidden",
      touchAction: "none"
    });
    if (zoomInput.parentElement) zoomInput.parentElement.style.display = "grid";
    if (reset) {
      state.zoom = 1;
      state.offsetX = 0;
      state.offsetY = 0;
    }
    zoomInput.value = String(state.zoom);
    loadDims(state.src, reset);
    applyTransform();
  };

  fileInput?.addEventListener("change", async () => {
    hideFormError(errorEl);
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > LIMITS.maxUploadBytes) {
      showFormError(errorEl, "La imagen supera el límite de 2 MB. Elige un archivo más ligero.");
      fileInput.value = "";
      return;
    }
    state.src = await readFileAsDataUrl(file);
    showIfReady(true);
  });

  zoomInput?.addEventListener("input", () => {
    state.zoom = Math.max(1, Number(zoomInput.value) || 1);
    applyTransform();
  });

  if (stageEl) {
    imgEl?.setAttribute("draggable", "false");
    imgEl?.addEventListener("dragstart", (e) => e.preventDefault());
    stageEl.addEventListener("dragstart", (e) => e.preventDefault());

    stageEl.addEventListener("pointerdown", (e) => {
      if (!state.src) return;
      e.preventDefault();
      state.dragging = true;
      state.startX = e.clientX - state.offsetX;
      state.startY = e.clientY - state.offsetY;
      try {
        stageEl.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    stageEl.addEventListener("pointermove", (e) => {
      if (!state.dragging) return;
      state.offsetX = e.clientX - state.startX;
      state.offsetY = e.clientY - state.startY;
      applyTransform();
    });

    const stopDragging = (e) => {
      if (!state.dragging) return;
      state.dragging = false;
      try {
        if (e?.pointerId !== undefined && stageEl.hasPointerCapture(e.pointerId)) {
          stageEl.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
    };

    stageEl.addEventListener("pointerup", stopDragging);
    stageEl.addEventListener("pointercancel", stopDragging);
  }

  const exportCroppedDataUrl = () =>
    new Promise((resolve) => {
      if (!state.src) return resolve("");
      const image = new Image();
      image.onload = () => {
        state.natW = image.naturalWidth || state.natW || LIMITS.avatarPx;
        state.natH = image.naturalHeight || state.natH || LIMITS.avatarPx;
        clampOffsets();

        const stageSize = getStageSize();
        const ratio = LIMITS.avatarPx / stageSize;
        const totalScale = getBaseScale(stageSize) * state.zoom * ratio;
        const drawW = state.natW * totalScale;
        const drawH = state.natH * totalScale;
        const cx = LIMITS.avatarPx / 2 + state.offsetX * ratio;
        const cy = LIMITS.avatarPx / 2 + state.offsetY * ratio;

        const canvas = document.createElement("canvas");
        canvas.width = LIMITS.avatarPx;
        canvas.height = LIMITS.avatarPx;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#161a26";
        ctx.fillRect(0, 0, LIMITS.avatarPx, LIMITS.avatarPx);
        ctx.drawImage(image, cx - drawW / 2, cy - drawH / 2, drawW, drawH);

        const out = canvas.toDataURL("image/jpeg", LIMITS.avatarQuality);
        state.src = out;
        state.zoom = 1;
        state.offsetX = 0;
        state.offsetY = 0;
        resolve(out);
      };
      image.onerror = () => resolve(initialDataUrl || state.src || "");
      image.src = state.src;
    });

  showIfReady(false);
  return { exportCroppedDataUrl };
}

function buildAvatarElement(username, avatarUrl, sizeClass = "profile-avatar", options = {}) {
  const fallback = document.createElement("div");
  fallback.className = sizeClass;
  fallback.textContent = (username || "?").charAt(0).toUpperCase();

  const applyClick = (el) => {
    if (options.onClick) {
      el.classList.add("profile-avatar-clickable");
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        options.onClick();
      });
    } else if (options.profileHref) {
      el.classList.add("profile-avatar-clickable");
      el.title = `Ver perfil de ${username}`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = options.profileHref;
      });
    }
  };

  if (!isDataImage(avatarUrl)) {
    applyClick(fallback);
    return fallback;
  }

  const img = document.createElement("img");
  img.src = avatarUrl;
  img.alt = `Foto de ${username}`;
  img.className = sizeClass;
  img.onerror = () => {
    applyClick(fallback);
    img.replaceWith(fallback);
  };
  applyClick(img);
  return img;
}

function getProfileUrlForTarget(targetKey, targetName = "") {
  const params = new URLSearchParams();
  if (targetKey) params.set("user", targetKey);
  if (targetName) params.set("name", targetName);
  const qs = params.toString();
  return qs ? `perfil.html?${qs}` : "perfil.html";
}

function isUserBlocked(targetKey) {
  const currentUser = getCurrentUser();
  if (!currentUser || !targetKey || targetKey === currentUser.id) return false;
  return loadData(STORAGE_KEYS.blocks, []).some(
    (b) => b.blockerId === currentUser.id && b.blockedKey === targetKey
  );
}

function toggleBlockUser(targetKey, targetName = "") {
  const currentUser = getCurrentUser();
  if (!currentUser || !targetKey || targetKey === currentUser.id) return false;

  const blocks = loadData(STORAGE_KEYS.blocks, []);
  const idx = blocks.findIndex((b) => b.blockerId === currentUser.id && b.blockedKey === targetKey);
  let nowBlocked = false;

  if (idx >= 0) {
    blocks.splice(idx, 1);
  } else {
    blocks.push({ blockerId: currentUser.id, blockedKey: targetKey, blockedName: targetName });
    nowBlocked = true;
    saveData(
      STORAGE_KEYS.follows,
      loadData(STORAGE_KEYS.follows, []).filter(
        (f) => !(f.followerId === currentUser.id && f.targetKey === targetKey)
      )
    );
  }

  saveData(STORAGE_KEYS.blocks, blocks);
  return nowBlocked;
}

function toggleFollowRecord(targetKey, targetName, onFollowAdded = null) {
  const currentUser = getCurrentUser();
  if (!currentUser || !targetKey || targetKey === currentUser.id || isUserBlocked(targetKey)) return;

  const follows = loadData(STORAGE_KEYS.follows, []);
  const idx = follows.findIndex(
    (f) => f.followerId === currentUser.id && f.targetKey === targetKey
  );

  if (idx >= 0) {
    follows.splice(idx, 1);
  } else {
    follows.push({
      followerId: currentUser.id,
      followerName: currentUser.username,
      targetKey,
      targetName
    });
    if (typeof onFollowAdded === "function") onFollowAdded(currentUser);
  }

  saveData(STORAGE_KEYS.follows, follows);
}

// --- LOGIN ---
const loginPageForm = byId("login-page-form");
if (loginPageForm) {
  if (getCurrentUser()) window.location.href = "index.html";

  loginPageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = byId("login-username").value.trim();
    const password = byId("login-password").value;
    const errorEl = byId("login-error");

    const user = loadData(STORAGE_KEYS.users, []).find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user || user.password !== password) {
      showFormError(errorEl, "Apodo o contraseña incorrectos.");
      return;
    }

    saveData(STORAGE_KEYS.session, buildSessionPayload(user));
    window.location.href = "index.html";
  });
}

// --- REGISTRO ---
const registerPageForm = byId("register-page-form");
if (registerPageForm) {
  const roleSelect = byId("reg-role");
  const creatorFields = byId("reg-creator-fields");
  const errorEl = byId("reg-error");

  const cropper = createAvatarCropper({
    fileInput: byId("reg-avatar-file"),
    stageEl: byId("reg-crop-stage"),
    imgEl: byId("reg-crop-img"),
    zoomInput: byId("reg-zoom-range"),
    errorEl
  });

  const bannerUploader = createBannerUploader({
    fileInput: byId("reg-banner-file"),
    previewBoxEl: byId("reg-banner-preview"),
    previewImgEl: byId("reg-banner-img")
  });

  const syncRoleFields = () => {
    if (creatorFields && roleSelect) {
      creatorFields.style.display = roleSelect.value === "creador" ? "grid" : "none";
    }
  };
  roleSelect?.addEventListener("change", syncRoleFields);
  syncRoleFields();

  registerPageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideFormError(errorEl);

    const username = byId("reg-username").value.trim();
    const password = byId("reg-password").value;
    const role = roleSelect ? roleSelect.value : "usuario";
    const shortDesc = byId("reg-short-desc")?.value.trim() || "";
    const isCreator = role === "creador";
    const bio = isCreator ? byId("reg-bio")?.value.trim() || "" : "";
    const channel = isCreator ? byId("reg-channel")?.value.trim() || "" : "";
    const socials = isCreator ? byId("reg-socials")?.value.trim() || "" : "";

    if (!username || password.length < 4) {
      showFormError(errorEl, "Completa tu apodo y una contraseña de al menos 4 caracteres.");
      return;
    }

    const users = loadData(STORAGE_KEYS.users, []);
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      showFormError(errorEl, "Ese apodo ya está registrado. Ve a Iniciar sesión.");
      return;
    }

    const avatarData = await cropper.exportCroppedDataUrl();
    const bannerData = bannerUploader.getBannerDataUrl();

    const newUser = {
      id: crypto.randomUUID(),
      username,
      password,
      role,
      channel,
      socials,
      avatar: avatarData,
      banner: bannerData,
      shortDesc,
      bio,
      allowPublicFollowLists: true
    };

    users.push(newUser);
    saveData(STORAGE_KEYS.users, users);
    saveData(STORAGE_KEYS.session, buildSessionPayload(newUser));
    window.location.href = "index.html";
  });
}

// --- EDITAR PERFIL ---
const editProfileForm = byId("edit-profile-form");
if (editProfileForm) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  } else {
    const errorEl = byId("edit-error");
    const usernameInput = byId("edit-username");
    const shortDescInput = byId("edit-short-desc");
    const creatorFields = byId("edit-creator-fields");
    const bioInput = byId("edit-bio");
    const channelInput = byId("edit-channel");
    const socialsInput = byId("edit-socials");

    if (usernameInput) usernameInput.value = user.username || "";
    if (shortDescInput) shortDescInput.value = user.shortDesc || "";

    if (user.role === "creador" && creatorFields) {
      creatorFields.style.display = "grid";
      if (bioInput) bioInput.value = user.bio || "";
      if (channelInput) channelInput.value = user.channel || "";
      if (socialsInput) socialsInput.value = user.socials || "";
    }

    const cropper = createAvatarCropper({
      fileInput: byId("edit-avatar-file"),
      stageEl: byId("edit-crop-stage"),
      imgEl: byId("edit-crop-img"),
      zoomInput: byId("edit-zoom-range"),
      errorEl,
      initialDataUrl: user.avatar || ""
    });

    const bannerUploader = createBannerUploader({
      fileInput: byId("edit-banner-file"),
      previewBoxEl: byId("edit-banner-preview"),
      previewImgEl: byId("edit-banner-img"),
      initialDataUrl: user.banner || ""
    });

    editProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideFormError(errorEl);

      const isCreator = user.role === "creador";
      const newUsername = usernameInput?.value.trim() || user.username;
      const newChannel = isCreator ? channelInput?.value.trim() || "" : "";
      const newAvatar = await cropper.exportCroppedDataUrl();

      const updatedUser = {
        ...user,
        username: newUsername,
        shortDesc: shortDescInput?.value.trim() || "",
        bio: isCreator ? bioInput?.value.trim() || "" : "",
        channel: newChannel,
        socials: isCreator ? socialsInput?.value.trim() || "" : "",
        avatar: newAvatar,
        banner: bannerUploader.getBannerDataUrl(),
        allowPublicFollowLists:
          typeof user.allowPublicFollowLists === "boolean" ? user.allowPublicFollowLists : true
      };

      syncUserAcrossStorage(updatedUser);
      updateUserReferencesInPosts(user.id, newUsername, newAvatar, newChannel);
      window.location.href = "perfil.html";
    });
  }
}

// --- PERFIL ---
const profilePageRoot = byId("profile-page-root");
if (profilePageRoot) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
  } else {
    const lightbox = ensureMediaLightbox();
    byId("logout-btn")?.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.session);
      window.location.href = "login.html";
    });

    const urlParams = new URLSearchParams(window.location.search);
    const requestedKey = urlParams.get("user") || urlParams.get("id") || currentUser.id;
    const requestedName = urlParams.get("name") || "";

    const users = loadData(STORAGE_KEYS.users, []);
    const allStories = loadData(STORAGE_KEYS.stories, []);
    const allPosts = loadData(STORAGE_KEYS.creatorPosts, []);

    const matchedUser =
      users.find((u) => u.id === requestedKey) ||
      (requestedKey === currentUser.id ? currentUser : null) ||
      users.find((u) => u.username.toLowerCase() === requestedName.toLowerCase()) ||
      null;

    const sampleStory = allStories.find(
      (s) =>
        s.authorId === requestedKey ||
        (requestedName && (s.author || "").toLowerCase() === requestedName.toLowerCase())
    );
    const samplePost = allPosts.find(
      (p) =>
        p.authorId === requestedKey ||
        (requestedName && (p.channel || "").toLowerCase() === requestedName.toLowerCase())
    );

    const targetKey = matchedUser ? matchedUser.id : requestedKey;
    const targetUsername =
      matchedUser?.username || requestedName || sampleStory?.author || samplePost?.channel || "Usuario";
    const isOwnProfile = targetKey === currentUser.id;

    const profileData = {
      id: targetKey,
      username: targetUsername,
      handle: buildHandleSlug(targetUsername, targetKey),
      role: matchedUser?.role || (samplePost ? "creador" : "usuario"),
      channel: matchedUser?.channel || samplePost?.network || "",
      socials: matchedUser?.socials || "",
      avatar:
        (isOwnProfile ? currentUser.avatar : matchedUser?.avatar) ||
        sampleStory?.authorAvatar ||
        samplePost?.authorAvatar ||
        "",
      banner: (isOwnProfile ? currentUser.banner : matchedUser?.banner) || "",
      shortDesc: matchedUser?.shortDesc || "",
      bio: matchedUser?.bio || "",
      allowPublicFollowLists:
        typeof matchedUser?.allowPublicFollowLists === "boolean"
          ? matchedUser.allowPublicFollowLists
          : true
    };

    let activeListTab = null;
    let creatorSearchTerm = "";
    const container = byId("profile-card-container");

    const collectAvailableCreators = () => {
      const map = new Map();

      users.forEach((u) => {
        if (u.role === "creador") {
          map.set(u.id, {
            id: u.id,
            username: u.username,
            handle: buildHandleSlug(u.username, u.id),
            role: "creador",
            channel: u.channel || "",
            shortDesc: u.shortDesc || u.bio || "",
            avatar: u.avatar || ""
          });
        }
      });

      allPosts.forEach((p) => {
        const key = p.authorId || `author:${(p.channel || "").toLowerCase()}`;
        if (!key) return;
        const existing = map.get(key);
        const name = existing?.username || p.channel || "Creador";
        map.set(key, {
          id: key,
          username: name,
          handle: existing?.handle || buildHandleSlug(name, key),
          role: "creador",
          channel: existing?.channel || p.network || "",
          shortDesc: existing?.shortDesc || p.message || "",
          avatar: lookupAvatarForEntry({
            authorId: p.authorId || "",
            name,
            fallbackAvatar: existing?.avatar || p.authorAvatar || ""
          })
        });
      });

      return Array.from(map.values());
    };

    const buildMemberRow = (member, rightActionEl) => {
      const row = document.createElement("div");
      row.className = "follow-member-card";

      const metaBox = document.createElement("div");
      metaBox.className = "follow-member-meta";

      const nameLink = document.createElement("a");
      nameLink.href = getProfileUrlForTarget(member.id, member.username);
      nameLink.className = "author-link-btn";
      nameLink.textContent = member.username;

      const subInfo = document.createElement("span");
      subInfo.className = "follow-member-sub";
      subInfo.textContent = `${member.handle} · ${member.role === "creador" ? "Creador" : "Narrador"}`;

      metaBox.append(nameLink, subInfo);
      row.appendChild(metaBox);
      if (rightActionEl) row.appendChild(rightActionEl);
      return row;
    };

    const createCreatorHoverTile = (creator, follows, isFavoriteSlot = false) => {
      const tile = document.createElement("div");
      tile.className = `creator-avatar-tile ${isFavoriteSlot ? "is-fav" : ""}`;
      tile.tabIndex = 0;

      const avatarEl = buildAvatarElement(creator.username, creator.avatar, "creator-tile-avatar", {
        profileHref: getProfileUrlForTarget(creator.id, creator.username)
      });

      const popover = document.createElement("div");
      popover.className = "creator-hover-popover";

      const topLine = document.createElement("div");
      topLine.className = "creator-popover-top";

      const nameEl = document.createElement("strong");
      nameEl.textContent = creator.username;

      const handleEl = document.createElement("span");
      handleEl.className = "creator-popover-handle";
      handleEl.textContent = `${creator.handle}${creator.channel ? ` · ${creator.channel}` : ""}`;

      topLine.append(nameEl, handleEl);

      const followersCount = follows.filter((f) => f.targetKey === creator.id).length;
      const statsEl = document.createElement("div");
      statsEl.className = "creator-popover-stats";
      statsEl.textContent = `👥 ${followersCount} ${followersCount === 1 ? "seguidor" : "seguidores"}`;

      const descEl = document.createElement("p");
      descEl.className = "creator-popover-desc";
      descEl.textContent = creator.shortDesc
        ? creator.shortDesc
        : "Creador de contenido en Umbral.";

      const actionsEl = document.createElement("div");
      actionsEl.className = "creator-popover-actions";

      const profileLink = document.createElement("a");
      profileLink.href = getProfileUrlForTarget(creator.id, creator.username);
      profileLink.className = "creator-popover-link";
      profileLink.textContent = "Ver perfil";

      actionsEl.appendChild(profileLink);

      if (creator.id !== currentUser.id && !isUserBlocked(creator.id)) {
        const iFollow = follows.some(
          (f) => f.followerId === currentUser.id && f.targetKey === creator.id
        );
        const followBtn = document.createElement("button");
        followBtn.type = "button";
        followBtn.className = `btn-follow ${iFollow ? "is-following" : ""}`;
        followBtn.textContent = iFollow ? "✓ Siguiendo" : "+ Seguir";
        followBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFollowRecord(creator.id, creator.username);
          renderProfileView();
        });
        actionsEl.appendChild(followBtn);
      }

      popover.append(topLine, statsEl, descEl, actionsEl);
      tile.append(avatarEl, popover);
      return tile;
    };

    const buildNarratorCreatorsWidget = (follows) => {
      const box = document.createElement("aside");
      box.className = "narrator-creators-floating-box";
      box.setAttribute("aria-label", "Creadores favoritos y descubrir");

      const allCreators = collectAvailableCreators();
      const followedByProfile = follows.filter((f) => f.followerId === profileData.id);
      const canSeeFavorites = isOwnProfile || profileData.allowPublicFollowLists !== false;

      const favoriteCreators = canSeeFavorites
        ? followedByProfile
            .map((rec) => {
              const resolved = resolveUserInfo(rec.targetKey, rec.targetName || "");
              const fromDir = allCreators.find(
                (c) =>
                  c.id === resolved.id ||
                  c.username.toLowerCase() === resolved.username.toLowerCase()
              );
              if (fromDir) return fromDir;
              if (resolved.role === "creador") return resolved;
              return null;
            })
            .filter(Boolean)
        : [];

      const favTitleRow = document.createElement("div");
      favTitleRow.className = "narrator-box-header";
      favTitleRow.innerHTML = `<span>⭐ Favoritos</span><small>${favoriteCreators.length}</small>`;
      box.appendChild(favTitleRow);

      const favGrid = document.createElement("div");
      favGrid.className = "creator-avatar-grid";
      if (favoriteCreators.length === 0) {
        const hint = document.createElement("span");
        hint.className = "narrator-box-empty";
        hint.textContent = "Sin favoritos aún";
        favGrid.appendChild(hint);
      } else {
        favoriteCreators.forEach((creator) => {
          favGrid.appendChild(createCreatorHoverTile(creator, follows, true));
        });
      }
      box.appendChild(favGrid);

      if (isOwnProfile) {
        const div = document.createElement("hr");
        div.className = "narrator-box-divider";
        box.appendChild(div);

        const discTitleRow = document.createElement("div");
        discTitleRow.className = "narrator-box-header";
        discTitleRow.innerHTML = `<span>🎬 Creadores</span><small>${allCreators.length}</small>`;
        box.appendChild(discTitleRow);

        const searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.className = "narrator-box-search";
        searchInput.placeholder = "Filtrar creador...";
        searchInput.value = creatorSearchTerm;
        searchInput.addEventListener("input", () => {
          creatorSearchTerm = searchInput.value;
          renderProfileView();
        });
        box.appendChild(searchInput);

        const filteredCreators = allCreators.filter((c) => {
          if (isUserBlocked(c.id)) return false;
          const q = creatorSearchTerm.trim().toLowerCase();
          if (!q) return true;
          return `${c.username} ${c.handle} ${c.channel} ${c.shortDesc}`.toLowerCase().includes(q);
        });

        const discGrid = document.createElement("div");
        discGrid.className = "creator-avatar-grid";
        if (filteredCreators.length === 0) {
          const empty = document.createElement("span");
          empty.className = "narrator-box-empty";
          empty.textContent = "Sin coincidencias";
          discGrid.appendChild(empty);
        } else {
          filteredCreators.forEach((creator) => {
            discGrid.appendChild(createCreatorHoverTile(creator, follows, false));
          });
        }
        box.appendChild(discGrid);
      }

      return box;
    };

    const renderProfileView = () => {
      if (!container) return;
      const focusedInput =
        container.activeElement?.tagName === "INPUT" ? container.activeElement.tagName : null;
      const prevSearchVal = creatorSearchTerm;

      container.innerHTML = "";
      profilePageRoot.querySelector(".narrator-creators-floating-box")?.remove();

      const isCreator = profileData.role === "creador";
      const userStories = allStories.filter(
        (s) =>
          (s.authorId && s.authorId === profileData.id) ||
          (s.author || "").toLowerCase() === profileData.username.toLowerCase()
      );

      const follows = loadData(STORAGE_KEYS.follows, []);
      const followerRecords = follows.filter((f) => f.targetKey === profileData.id);
      const followingRecords = follows.filter((f) => f.followerId === profileData.id);
      const alreadyFollowing = follows.some(
        (f) => f.followerId === currentUser.id && f.targetKey === profileData.id
      );
      const blocked = isUserBlocked(profileData.id);

      const bannerBox = document.createElement("div");
      bannerBox.className = "profile-banner-box";
      bannerBox.title = profileData.banner ? "Ver banner ampliado" : "Sin banner configurado";

      if (isDataImage(profileData.banner)) {
        const bannerImg = document.createElement("img");
        bannerImg.src = profileData.banner;
        bannerImg.alt = `Banner de ${profileData.username}`;
        bannerBox.appendChild(bannerImg);
        bannerBox.addEventListener("click", () =>
          lightbox.open(profileData.banner, `Banner · ${profileData.username} (${profileData.handle})`)
        );
      } else {
        const ph = document.createElement("div");
        ph.className = "profile-banner-placeholder";
        ph.textContent = isOwnProfile
          ? "🖼️ Añade un banner desde Editar perfil"
          : "🖼️ Sin banner de portada";
        bannerBox.appendChild(ph);
      }

      const header = document.createElement("div");
      header.className = "profile-header";

      const avatarGroup = document.createElement("div");
      avatarGroup.className = "profile-avatar-wrap";
      avatarGroup.appendChild(
        buildAvatarElement(profileData.username, profileData.avatar, "profile-avatar", {
          onClick: () => {
            if (profileData.avatar) {
              lightbox.open(
                profileData.avatar,
                `Foto de perfil · ${profileData.username} (${profileData.handle})`
              );
            }
          }
        })
      );

      const infoWrap = document.createElement("div");
      const nameEl = document.createElement("h2");
      nameEl.textContent = profileData.username;

      const handleRow = document.createElement("div");
      handleRow.className = "profile-handle-row";

      const handleBadge = document.createElement("span");
      handleBadge.className = "profile-handle-tag";
      handleBadge.textContent = `${profileData.handle} · ID: ${profileData.id.slice(0, 8)}`;

      const roleEl = document.createElement("span");
      roleEl.style.color = "#9aa2b8";
      roleEl.style.fontSize = "0.86rem";
      roleEl.textContent = isCreator
        ? `🎬 Creador${profileData.channel ? ` · ${profileData.channel}` : ""}`
        : "✍️ Narrador";

      handleRow.append(handleBadge, roleEl);
      infoWrap.append(nameEl, handleRow);
      avatarGroup.appendChild(infoWrap);
      header.appendChild(avatarGroup);

      if (isOwnProfile) {
        const editLink = document.createElement("a");
        editLink.href = "editar-perfil.html";
        editLink.className = "edit-profile-link";
        editLink.textContent = "✏️ Editar perfil";
        header.appendChild(editLink);
      }

      const actionsRow = document.createElement("div");
      actionsRow.className = "profile-actions-row";

      if (!isOwnProfile) {
        const followBtn = document.createElement("button");
        followBtn.type = "button";
        followBtn.className = `btn-follow ${alreadyFollowing ? "is-following" : ""}`;
        followBtn.disabled = blocked;
        followBtn.textContent = blocked
          ? `Usuario bloqueado · ${followerRecords.length}`
          : `${alreadyFollowing ? "✓ Siguiendo" : "+ Seguir"} · ${followerRecords.length}`;
        followBtn.addEventListener("click", () => {
          if (blocked) return;
          toggleFollowRecord(profileData.id, profileData.username);
          renderProfileView();
        });

        const blockBtn = document.createElement("button");
        blockBtn.type = "button";
        blockBtn.className = `btn-block-user ${blocked ? "is-blocked" : ""}`;
        blockBtn.textContent = blocked ? "🔓 Desbloquear usuario" : "🚫 Bloquear usuario";
        blockBtn.addEventListener("click", () => {
          toggleBlockUser(profileData.id, profileData.username);
          renderProfileView();
        });

        actionsRow.append(followBtn, blockBtn);
      }

      const descBox = document.createElement("div");
      descBox.className = "profile-bio-text";

      const shortLine = document.createElement("div");
      shortLine.textContent = profileData.shortDesc
        ? `✨ Lo que le apasiona: ${profileData.shortDesc}`
        : "✨ Sin descripción corta todavía.";
      descBox.appendChild(shortLine);

      if (isCreator && profileData.bio) {
        const longBio = document.createElement("div");
        longBio.style.marginTop = "0.6rem";
        longBio.textContent = profileData.bio;
        descBox.appendChild(longBio);
      }

      const stats = document.createElement("div");
      stats.className = "profile-stats";

      const storiesBox = document.createElement("div");
      storiesBox.className = "stat-box";
      storiesBox.innerHTML = `<div class="stat-number">${userStories.length}</div><div class="stat-label">📖 Relatos</div>`;

      const makeStatTab = (tabName, count, label, title) => {
        const box = document.createElement("div");
        box.className = `stat-box stat-box-interactive ${activeListTab === tabName ? "is-selected" : ""}`;
        box.innerHTML = `<div class="stat-number">${count}</div><div class="stat-label">${label}</div>`;
        box.title = title;
        box.addEventListener("click", () => {
          activeListTab = activeListTab === tabName ? null : tabName;
          renderProfileView();
        });
        return box;
      };

      stats.append(
        storiesBox,
        makeStatTab(
          "followers",
          followerRecords.length,
          "👥 Seguidores",
          "Ver quiénes siguen este perfil"
        ),
        makeStatTab(
          "following",
          followingRecords.length,
          "⭐ Siguiendo",
          "Ver a quiénes sigue este perfil"
        )
      );

      const followDrawer = document.createElement("div");
      followDrawer.className = `follow-drawer-panel ${activeListTab ? "is-open" : ""}`;

      if (activeListTab) {
        const canViewList = isOwnProfile || profileData.allowPublicFollowLists !== false;
        const drawerHeader = document.createElement("div");
        drawerHeader.className = "follow-drawer-header";

        const drawerTitle = document.createElement("h4");
        drawerTitle.textContent =
          activeListTab === "followers"
            ? `👥 Seguidores de ${profileData.username} (${followerRecords.length})`
            : `⭐ Perfiles que sigue ${profileData.username} (${followingRecords.length})`;

        const closeDrawerBtn = document.createElement("button");
        closeDrawerBtn.type = "button";
        closeDrawerBtn.className = "btn-mini";
        closeDrawerBtn.textContent = "Ocultar";
        closeDrawerBtn.addEventListener("click", () => {
          activeListTab = null;
          renderProfileView();
        });

        drawerHeader.append(drawerTitle, closeDrawerBtn);
        followDrawer.appendChild(drawerHeader);

        if (!canViewList) {
          const privNote = document.createElement("p");
          privNote.style.cssText = "color:#9aa2b8;font-size:0.86rem;margin:0;";
          privNote.textContent = "Este usuario mantiene oculta esta lista por privacidad.";
          followDrawer.appendChild(privNote);
        } else {
          const listItemsWrap = document.createElement("div");
          listItemsWrap.className = "follow-list-items";
          const currentFollows = loadData(STORAGE_KEYS.follows, []);

          if (activeListTab === "followers") {
            if (followerRecords.length === 0) {
              const emptyF = document.createElement("p");
              emptyF.style.cssText = "color:#9aa2b8;font-size:0.86rem;margin:0;";
              emptyF.textContent = "Aún no tiene seguidores.";
              listItemsWrap.appendChild(emptyF);
            } else {
              followerRecords.forEach((rec) => {
                const member = resolveUserInfo(rec.followerId, rec.followerName || "");
                let actionBtn = null;
                if (member.id !== currentUser.id && !isUserBlocked(member.id)) {
                  const iFollowBack = currentFollows.some(
                    (f) => f.followerId === currentUser.id && f.targetKey === member.id
                  );
                  actionBtn = document.createElement("button");
                  actionBtn.type = "button";
                  actionBtn.className = `btn-follow ${iFollowBack ? "is-following" : ""}`;
                  actionBtn.textContent = iFollowBack ? "✓ Siguiendo" : "+ Seguir";
                  actionBtn.addEventListener("click", () => {
                    toggleFollowRecord(member.id, member.username);
                    renderProfileView();
                  });
                }
                listItemsWrap.appendChild(buildMemberRow(member, actionBtn));
              });
            }
          } else if (followingRecords.length === 0) {
            const emptyIng = document.createElement("p");
            emptyIng.style.cssText = "color:#9aa2b8;font-size:0.86rem;margin:0;";
            emptyIng.textContent = "Aún no sigue a nadie.";
            listItemsWrap.appendChild(emptyIng);
          } else {
            followingRecords.forEach((rec) => {
              const member = resolveUserInfo(rec.targetKey, rec.targetName || "");
              let unfollowBtn = null;
              if (isOwnProfile) {
                unfollowBtn = document.createElement("button");
                unfollowBtn.type = "button";
                unfollowBtn.className = "btn-mini btn-reject";
                unfollowBtn.textContent = "Dejar de seguir";
                unfollowBtn.addEventListener("click", () => {
                  toggleFollowRecord(rec.targetKey, rec.targetName || "");
                  renderProfileView();
                });
              }
              listItemsWrap.appendChild(buildMemberRow(member, unfollowBtn));
            });
          }

          followDrawer.appendChild(listItemsWrap);
        }
      }

      const wallSection = document.createElement("div");
      wallSection.className = "profile-wall-section";

      const wallHeader = document.createElement("div");
      wallHeader.className = "profile-wall-header";

      const wallTitle = document.createElement("h3");
      wallTitle.textContent = isOwnProfile
        ? "📖 Mi muro de relatos"
        : `📖 Muro de relatos de ${profileData.username}`;
      wallTitle.style.fontSize = "1.02rem";

      const wallCount = document.createElement("span");
      wallCount.className = "badge";
      wallCount.textContent = `${userStories.length} publicados`;

      wallHeader.append(wallTitle, wallCount);
      wallSection.appendChild(wallHeader);

      if (blocked && !isOwnProfile) {
        const notice = document.createElement("div");
        notice.className = "profile-blocked-notice";
        notice.textContent =
          "Has bloqueado a este usuario. Su muro y sus interacciones están ocultos para ti mientras siga bloqueado.";
        wallSection.appendChild(notice);
      } else if (userStories.length === 0) {
        const emptyWall = document.createElement("p");
        emptyWall.style.cssText = "color:#9aa2b8;font-size:0.9rem;";
        emptyWall.textContent = "Este perfil aún no ha publicado relatos.";
        wallSection.appendChild(emptyWall);
      } else {
        userStories.forEach((story) => {
          const card = document.createElement("article");
          card.className = "story-card";

          const titleEl = document.createElement("h4");
          titleEl.textContent = story.title;

          const metaEl = document.createElement("div");
          metaEl.className = "story-meta";
          metaEl.textContent = `${story.category} · ${
            story.allowCreators ? "🎙️ Abierto a creadores" : "🔒 Solo lectura"
          }`;

          const contentEl = document.createElement("p");
          contentEl.textContent = story.content;

          card.append(titleEl, metaEl, contentEl);
          wallSection.appendChild(card);
        });
      }

      const children = [bannerBox, header];
      if (actionsRow.children.length > 0) children.push(actionsRow);
      children.push(descBox);
      if (isCreator && profileData.socials) {
        const socialEl = document.createElement("div");
        socialEl.className = "profile-socials";
        socialEl.textContent = `🌐 Redes: ${profileData.socials}`;
        children.push(socialEl);
      }
      children.push(stats, followDrawer, wallSection);
      container.append(...children);

      if (!isCreator) {
        profilePageRoot.appendChild(buildNarratorCreatorsWidget(follows));
      }

      if (focusedInput === "INPUT" && prevSearchVal) {
        const restored = profilePageRoot.querySelector('input[type="search"]');
        if (restored) {
          restored.focus();
          restored.setSelectionRange(restored.value.length, restored.value.length);
        }
      }
    };

    renderProfileView();
  }
}

// --- MURO PRINCIPAL (index.html) ---
const storiesList = byId("stories-list");
if (storiesList) {
  const initialSession = getCurrentUser();
  if (!initialSession) window.location.href = "login.html";

  const compactSectionLabel = byId("compact-section-label");
  const compactRoleBadge = byId("compact-role-badge");
  const creatorsTabBtn = byId("creators-tab-btn");
  const railCreatorsBtn = byId("rail-creators-btn");
  const creatorsView = byId("creators-view");
  const storiesView = byId("stories-view");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const railButtons = document.querySelectorAll("[data-rail-tab]");
  const feedSearchInput = byId("feed-search-input");

  const topProfileWrap = byId("top-profile-wrap");
  const topAvatarBtn = byId("top-avatar-btn");
  const menuUserAvatar = byId("menu-user-avatar");
  const hoverProfileName = byId("hover-profile-name");
  const hoverProfileHandle = byId("hover-profile-handle");
  const hoverFollowersCount = byId("hover-followers-count");
  const hoverFollowingCount = byId("hover-following-count");
  const leftRailAvatar = byId("left-rail-avatar");
  const leftRailName = byId("left-rail-name");
  const quickComposerAvatar = byId("quick-composer-avatar");
  const menuLogoutBtn = byId("menu-logout-btn");

  const notifDropdownWrap = byId("notif-dropdown-wrap");
  const bellToggleBtn = byId("bell-toggle-btn");
  const notificationsPopover = byId("notifications-popover");
  const notifBadge = byId("notif-badge");
  const notificationsList = byId("notifications-list");
  const markReadBtn = byId("mark-read-btn");
  const notifFilterAllBtn = byId("notif-filter-all");
  const notifFilterUnreadBtn = byId("notif-filter-unread");

  const settingsDropdownWrap = byId("settings-dropdown-wrap");
  const settingsToggleBtn = byId("settings-toggle-btn");
  const settingFollowPrivacyBtn = byId("setting-toggle-follow-privacy");
  const settingFollowPrivacyBadge = byId("setting-follow-privacy-badge");
  const settingRightRailBtn = byId("setting-toggle-right-rail");
  const settingRightRailBadge = byId("setting-right-rail-badge");
  const settingClearReadNotifsBtn = byId("setting-clear-read-notifs");
  const settingResetFeedBtn = byId("setting-reset-feed");

  const openAgreementsChatBtn = byId("open-agreements-chat-btn");
  const railAgreementsChatBtn = byId("rail-agreements-chat-btn");
  const menuOpenChatHubBtn = byId("menu-open-chat-hub-btn");
  const chatHubBadge = byId("chat-hub-badge");
  const agreedChatsSidebarList = byId("agreed-chats-sidebar-list");

  const sessionStatusEl = byId("session-status");
  const logoutBtn = byId("logout-btn");

  const form = byId("story-form");
  const authorInput = byId("author");
  const toggleComposerBtn = byId("toggle-composer");
  const composerDrawer = byId("composer-drawer");
  const publishBtn = byId("publish-btn");
  const storyImageFileInput = byId("story-image-file");
  const storyVideoFileInput = byId("story-video-file");
  const storyMediaPreviewEl = byId("story-media-preview");

  const creatorPostForm = byId("creator-post-form");
  const creatorChannelInput = byId("creator-channel");
  const creatorNetworkInput = byId("creator-network");
  const creatorPostsList = byId("creator-posts-list");
  const toggleCreatorComposerBtn = byId("toggle-creator-composer");
  const creatorComposerBox = byId("creator-composer-box");
  const creatorDrawer = byId("creator-drawer");
  const publishCreatorBtn = byId("publish-creator-btn");

  const permissionModal = byId("permission-modal");
  const permissionForm = byId("permission-form");
  const creatorNameInput = byId("creator-name");
  const creatorPlatformInput = byId("creator-platform");
  const modalStoryPreview = byId("modal-story-preview");
  const closeModalBtn = byId("close-modal-btn");
  const cancelModalBtn = byId("cancel-modal-btn");

  const chatModal = byId("chat-modal");
  const chatContextSubtitle = byId("chat-context-subtitle");
  const chatMessagesEl = byId("chat-messages");
  const chatForm = byId("chat-form");
  const chatInput = byId("chat-input");
  const closeChatBtn = byId("close-chat-btn");

  let lastCreatedStoryId = null;
  let lastCreatedPostId = null;
  let pendingStoryId = null;
  let activeChatContext = null;
  let notifFilterMode = "all";
  let searchQuery = "";
  let draftStoryImage = "";
  let draftStoryVideo = "";

  function setDrawerState(drawer, triggerBtn, isOpen) {
    if (!drawer) return;
    const nextOpen = Boolean(isOpen);
    drawer.classList.toggle("is-open", nextOpen);
    drawer.setAttribute("aria-hidden", String(!nextOpen));
    drawer.style.display = nextOpen ? "block" : "none";
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", String(nextOpen));
    if (drawer === creatorDrawer && creatorComposerBox) {
      creatorComposerBox.classList.toggle("is-creator-composer-open", nextOpen);
    }
  }

  function showCreatorRoleWarning() {
    const anchor = toggleCreatorComposerBtn || creatorDrawer || storiesList;
    if (!anchor) return;
    let notice = byId("creator-role-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "creator-role-notice";
      notice.style.cssText =
        "margin-top:0.55rem;padding:0.65rem 0.85rem;border-radius:10px;background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.45);color:#fca5a5;font-size:0.88rem;";
      anchor.insertAdjacentElement("afterend", notice);
    }
    notice.textContent =
      "Tu cuenta actual es de usuario normal (narrador). Para crear publicaciones de creador necesitas una cuenta con rol de Creador.";
    notice.style.display = "block";
    clearTimeout(notice._hideTimer);
    notice._hideTimer = setTimeout(() => {
      notice.style.display = "none";
    }, 4000);
  }

  function syncDraftMediaPreview() {
    if (!storyMediaPreviewEl) return;
    storyMediaPreviewEl.innerHTML = "";
    let count = 0;

    if (isDataImage(draftStoryImage)) {
      const box = document.createElement("div");
      box.className = "fb-media-preview-item";
      const img = document.createElement("img");
      img.src = draftStoryImage;
      img.alt = "Vista previa de imagen";
      box.appendChild(img);
      storyMediaPreviewEl.appendChild(box);
      count++;
    }

    if (isDataVideo(draftStoryVideo)) {
      const box = document.createElement("div");
      box.className = "fb-media-preview-item";
      const vid = document.createElement("video");
      vid.src = draftStoryVideo;
      vid.controls = true;
      vid.preload = "metadata";
      box.appendChild(vid);
      storyMediaPreviewEl.appendChild(box);
      count++;
    }

    storyMediaPreviewEl.classList.toggle("has-media", count > 0);
  }

  function bindDraftMediaInput(inputEl, isImage) {
    inputEl?.addEventListener("change", async () => {
      const file = inputEl.files?.[0];
      const setVal = (v) => {
        if (isImage) draftStoryImage = v;
        else draftStoryVideo = v;
      };
      if (!file || file.size > LIMITS.maxStoryMediaBytes) {
        if (file) inputEl.value = "";
        setVal("");
        syncDraftMediaPreview();
        return;
      }
      setVal(await readFileAsDataUrl(file));
      syncDraftMediaPreview();
    });
  }

  bindDraftMediaInput(storyImageFileInput, true);
  bindDraftMediaInput(storyVideoFileInput, false);

  function syncCompactSectionLabel(tabId = "stories-view") {
    if (compactSectionLabel) {
      compactSectionLabel.textContent =
        tabId === "creators-view" ? "🎬 Espacio de Creadores" : "📖 Muro de Relatos";
    }
  }

  function switchFeedTab(targetId) {
    const user = getCurrentUser();
    if (targetId === "creators-view" && (!user || user.role !== "creador")) return;

    tabButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === targetId));
    railButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.railTab === targetId));
    storiesView?.classList.toggle("is-active", targetId === "stories-view");
    creatorsView?.classList.toggle("is-active", targetId === "creators-view");
    syncCompactSectionLabel(targetId);
  }

  function fillAvatarSlot(slotEl, user) {
    if (!slotEl || !user) return;
    slotEl.innerHTML = "";
    const avatarUrl = lookupAvatarForEntry({
      authorId: user.id,
      name: user.username,
      fallbackAvatar: user.avatar || ""
    });
    if (isDataImage(avatarUrl)) {
      const img = document.createElement("img");
      img.src = avatarUrl;
      img.alt = user.username || "Perfil";
      img.onerror = () => {
        slotEl.textContent = (user.username || "U").charAt(0).toUpperCase();
      };
      slotEl.appendChild(img);
    } else {
      slotEl.textContent = (user.username || "U").charAt(0).toUpperCase();
    }
  }

  function syncTopProfileWidget() {
    const user = getCurrentUser();
    if (!user) return;

    [topAvatarBtn, menuUserAvatar, leftRailAvatar, quickComposerAvatar].forEach((slot) =>
      fillAvatarSlot(slot, user)
    );

    if (leftRailName) leftRailName.textContent = user.username || "Mi perfil";
    if (hoverProfileName) hoverProfileName.textContent = user.username || "Usuario";
    if (hoverProfileHandle) hoverProfileHandle.textContent = buildHandleSlug(user.username, user.id);

    const follows = loadData(STORAGE_KEYS.follows, []);
    if (hoverFollowersCount) {
      hoverFollowersCount.textContent = String(follows.filter((f) => f.targetKey === user.id).length);
    }
    if (hoverFollowingCount) {
      hoverFollowingCount.textContent = String(follows.filter((f) => f.followerId === user.id).length);
    }
  }

  function createPopoverController({ wrapEl, triggerBtn, panelEl, onOpen }) {
    const setOpen = (open) => {
      if (!panelEl || !triggerBtn) return;
      wrapEl?.classList.toggle("is-open", open);
      panelEl.classList.toggle("is-open", open);
      triggerBtn.setAttribute("aria-expanded", String(open));
      if (open && onOpen) onOpen();
    };
    const isOpen = () =>
      Boolean(panelEl?.classList.contains("is-open") || wrapEl?.classList.contains("is-open"));
    return { setOpen, isOpen };
  }

  const profileMenuCtrl = createPopoverController({
    wrapEl: topProfileWrap,
    triggerBtn: topAvatarBtn,
    panelEl: byId("left-profile-menu")
  });

  const notifMenuCtrl = createPopoverController({
    wrapEl: notifDropdownWrap,
    triggerBtn: bellToggleBtn,
    panelEl: notificationsPopover,
    onOpen: () => renderNotifications()
  });

  const settingsMenuCtrl = createPopoverController({
    wrapEl: settingsDropdownWrap,
    triggerBtn: settingsToggleBtn,
    panelEl: byId("settings-popover"),
    onOpen: () => syncSettingsUI()
  });

  const allPopoverCtrls = [profileMenuCtrl, notifMenuCtrl, settingsMenuCtrl];

  function bindPopoverTrigger(triggerBtn, targetCtrl) {
    triggerBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = targetCtrl.isOpen();
      allPopoverCtrls.forEach((c) => c.setOpen(false));
      targetCtrl.setOpen(!wasOpen);
    });
  }

  bindPopoverTrigger(topAvatarBtn, profileMenuCtrl);
  bindPopoverTrigger(bellToggleBtn, notifMenuCtrl);
  bindPopoverTrigger(settingsToggleBtn, settingsMenuCtrl);

  function syncSettingsUI() {
    const user = getCurrentUser();
    const isPublicLists =
      typeof user?.allowPublicFollowLists === "boolean" ? user.allowPublicFollowLists : true;

    if (settingFollowPrivacyBadge) {
      settingFollowPrivacyBadge.textContent = isPublicLists ? "Activa" : "Privada";
      settingFollowPrivacyBadge.classList.toggle("is-on", isPublicLists);
    }

    const prefs = loadData(STORAGE_KEYS.prefs, { showRightRail: true });
    const showRightRail = prefs.showRightRail !== false;
    document.body.classList.toggle("fb-hide-right-rail", !showRightRail);

    if (settingRightRailBadge) {
      settingRightRailBadge.textContent = showRightRail ? "Visible" : "Oculto";
      settingRightRailBadge.classList.toggle("is-on", showRightRail);
    }
  }

  settingFollowPrivacyBtn?.addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) return;
    const nextVal = !(
      typeof user.allowPublicFollowLists === "boolean" ? user.allowPublicFollowLists : true
    );
    syncUserAcrossStorage({ ...user, allowPublicFollowLists: nextVal });
    syncSettingsUI();
  });

  settingRightRailBtn?.addEventListener("click", () => {
    const prefs = loadData(STORAGE_KEYS.prefs, { showRightRail: true });
    saveData(STORAGE_KEYS.prefs, { ...prefs, showRightRail: !(prefs.showRightRail !== false) });
    syncSettingsUI();
  });

  settingClearReadNotifsBtn?.addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) return;
    saveData(
      STORAGE_KEYS.notifs,
      loadData(STORAGE_KEYS.notifs, []).filter((n) => !(n.recipientId === user.id && n.read))
    );
    renderNotifications();
  });

  settingResetFeedBtn?.addEventListener("click", () => {
    searchQuery = "";
    if (feedSearchInput) feedSearchInput.value = "";
    switchFeedTab("stories-view");
    renderStories();
    renderCreatorPosts();
    settingsMenuCtrl.setOpen(false);
  });

  const performLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    window.location.href = "login.html";
  };
  logoutBtn?.addEventListener("click", performLogout);
  menuLogoutBtn?.addEventListener("click", performLogout);

  function syncSessionUI() {
    const user = getCurrentUser();
    if (!user) return;

    const isCreator = user.role === "creador";
    sessionStatusEl?.classList.remove("is-creator", "is-user");
    if (authorInput) {
      authorInput.value = user.username || "";
      authorInput.readOnly = true;
    }

    if (isCreator) {
      if (sessionStatusEl) {
        sessionStatusEl.textContent = `🎬 Creador: ${user.username}`;
        sessionStatusEl.classList.add("is-creator");
      }
      if (compactRoleBadge) compactRoleBadge.textContent = `🎬 Creador: ${user.username}`;
      creatorsTabBtn?.classList.remove("is-hidden");
      railCreatorsBtn?.classList.remove("is-hidden");
      toggleCreatorComposerBtn?.classList.remove("is-hidden");
      if (creatorChannelInput) {
        creatorChannelInput.value = user.username || "";
        creatorChannelInput.readOnly = true;
      }
      if (creatorNetworkInput && user.channel) creatorNetworkInput.value = user.channel;
    } else {
      if (sessionStatusEl) {
        sessionStatusEl.textContent = `✍️ Narrador: ${user.username}`;
        sessionStatusEl.classList.add("is-user");
      }
      if (compactRoleBadge) compactRoleBadge.textContent = `✍️ Narrador: ${user.username}`;
      creatorsTabBtn?.classList.add("is-hidden");
      railCreatorsBtn?.classList.add("is-hidden");
      toggleCreatorComposerBtn?.classList.add("is-hidden");
      setDrawerState(creatorDrawer, toggleCreatorComposerBtn, false);
      if (creatorsView?.classList.contains("is-active")) switchFeedTab("stories-view");
      if (creatorChannelInput) {
        creatorChannelInput.value = "";
        creatorChannelInput.readOnly = false;
      }
    }

    syncTopProfileWidget();
    syncSettingsUI();
  }

  notifFilterAllBtn?.addEventListener("click", () => {
    notifFilterMode = "all";
    notifFilterAllBtn.classList.add("is-active");
    notifFilterUnreadBtn?.classList.remove("is-active");
    renderNotifications();
  });

  notifFilterUnreadBtn?.addEventListener("click", () => {
    notifFilterMode = "unread";
    notifFilterUnreadBtn.classList.add("is-active");
    notifFilterAllBtn?.classList.remove("is-active");
    renderNotifications();
  });

  document.addEventListener("click", (e) => {
    if (notifMenuCtrl.isOpen() && notifDropdownWrap && !notifDropdownWrap.contains(e.target)) {
      notifMenuCtrl.setOpen(false);
    }
    if (profileMenuCtrl.isOpen() && topProfileWrap && !topProfileWrap.contains(e.target)) {
      profileMenuCtrl.setOpen(false);
    }
    if (settingsMenuCtrl.isOpen() && settingsDropdownWrap && !settingsDropdownWrap.contains(e.target)) {
      settingsMenuCtrl.setOpen(false);
    }
  });

  function addNotification(recipientId, text, preview = "") {
    if (!recipientId) return;
    const notifs = loadData(STORAGE_KEYS.notifs, []);
    notifs.unshift({
      id: crypto.randomUUID(),
      recipientId,
      text,
      preview,
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
    saveData(STORAGE_KEYS.notifs, notifs);
    renderNotifications();
  }

  function renderNotifications() {
    if (!notificationsList || !notifBadge) return;
    const user = getCurrentUser();
    const mine = user ? loadData(STORAGE_KEYS.notifs, []).filter((n) => n.recipientId === user.id) : [];
    const unreadAll = mine.filter((n) => !n.read);

    if (unreadAll.length > 0) {
      notifBadge.textContent = String(unreadAll.length);
      notifBadge.classList.remove("is-hidden");
    } else {
      notifBadge.classList.add("is-hidden");
    }

    const visibleNotifs = notifFilterMode === "unread" ? unreadAll : mine;
    notificationsList.innerHTML = "";

    if (visibleNotifs.length === 0) {
      const p = document.createElement("p");
      p.style.cssText = "color:#9aa2b8;font-size:0.85rem;";
      p.textContent =
        notifFilterMode === "unread"
          ? "No tienes notificaciones sin leer."
          : "No tienes notificaciones todavía.";
      notificationsList.appendChild(p);
      return;
    }

    visibleNotifs.forEach((n) => {
      const item = document.createElement("div");
      item.className = `notif-item ${n.read ? "" : "is-unread"}`;

      const msg = document.createElement("div");
      msg.textContent = n.text;
      item.appendChild(msg);

      if (n.preview) {
        const quote = document.createElement("div");
        quote.className = "notif-quote";
        quote.textContent = `“${n.preview}”`;
        item.appendChild(quote);
      }

      const time = document.createElement("span");
      time.className = "notif-time";
      time.textContent = `${n.createdAt} · ${n.read ? "Leída" : "Nueva"}`;
      item.appendChild(time);

      notificationsList.appendChild(item);
    });
  }

  markReadBtn?.addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) return;
    saveData(
      STORAGE_KEYS.notifs,
      loadData(STORAGE_KEYS.notifs, []).map((n) =>
        n.recipientId === user.id ? { ...n, read: true } : n
      )
    );
    renderNotifications();
  });

  const getTargetKey = (item) =>
    item.authorId || `author:${(item.author || item.channel || "").toLowerCase()}`;

  function toggleFollow(targetKey, targetName, recipientUserId = null) {
    toggleFollowRecord(targetKey, targetName, (currentUser) => {
      if (recipientUserId) {
        addNotification(recipientUserId, `⭐ ${currentUser.username} comenzó a seguir tu perfil.`);
      }
    });
    syncTopProfileWidget();
    renderStories();
    renderCreatorPosts();
  }

  function buildFollowButton(targetKey, targetName, recipientUserId, isSelf) {
    const followers = loadData(STORAGE_KEYS.follows, []).filter((f) => f.targetKey === targetKey).length;
    if (isSelf) {
      const ownBadge = document.createElement("span");
      ownBadge.className = "badge";
      ownBadge.textContent = `👥 ${followers} seguidores`;
      return ownBadge;
    }

    const currentUser = getCurrentUser();
    const following = Boolean(
      currentUser &&
        targetKey &&
        loadData(STORAGE_KEYS.follows, []).some(
          (f) => f.followerId === currentUser.id && f.targetKey === targetKey
        )
    );

    const followBtn = document.createElement("button");
    followBtn.type = "button";
    followBtn.className = `btn-follow ${following ? "is-following" : ""}`;
    followBtn.textContent = `${following ? "✓ Siguiendo" : "+ Seguir"} · ${followers}`;
    followBtn.addEventListener("click", () => toggleFollow(targetKey, targetName, recipientUserId));
    return followBtn;
  }

  function buildAuthorLink(name, avatarUrl, profileHref) {
    const wrap = document.createElement("span");
    wrap.style.display = "inline-flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "0.25rem";

    if (isDataImage(avatarUrl)) {
      const mini = document.createElement("img");
      mini.src = avatarUrl;
      mini.alt = name;
      mini.className = "mini-avatar profile-avatar-clickable";
      mini.title = `Ver perfil de ${name}`;
      mini.onerror = () => mini.remove();
      mini.addEventListener("click", () => {
        window.location.href = profileHref;
      });
      wrap.appendChild(mini);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "author-link-btn";
    btn.textContent = name;
    btn.title = `Ver perfil de ${name}`;
    btn.addEventListener("click", () => {
      window.location.href = profileHref;
    });
    wrap.appendChild(btn);
    return wrap;
  }

  tabButtons.forEach((btn) => btn.addEventListener("click", () => switchFeedTab(btn.dataset.tab)));
  railButtons.forEach((btn) => btn.addEventListener("click", () => switchFeedTab(btn.dataset.railTab)));

  feedSearchInput?.addEventListener("input", () => {
    searchQuery = feedSearchInput.value.trim().toLowerCase();
    renderStories();
    renderCreatorPosts();
  });

  function setupAccordion(button, drawer, { requireCreator = false, openTabId = null } = {}) {
    if (!button || !drawer) return;
    button.addEventListener("click", () => {
      if (requireCreator) {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== "creador") {
          setDrawerState(drawer, button, false);
          showCreatorRoleWarning();
          return;
        }
      }
      const nextOpen = !drawer.classList.contains("is-open");
      if (nextOpen && openTabId) switchFeedTab(openTabId);
      setDrawerState(drawer, button, nextOpen);
    });
  }

  setupAccordion(toggleComposerBtn, composerDrawer, { requireCreator: false });
  setupAccordion(toggleCreatorComposerBtn, creatorDrawer, {
    requireCreator: true,
    openTabId: null
  });

  // --- PERMISOS ---
  function openPermissionModal(story) {
    const user = getCurrentUser();
    if (
      !user ||
      user.role !== "creador" ||
      story.authorId === user.id ||
      isUserBlocked(getTargetKey(story))
    ) {
      return;
    }
    pendingStoryId = story.id;
    if (modalStoryPreview) {
      modalStoryPreview.textContent = `Relato: "${story.title}" (de ${story.author})`;
    }
    permissionForm?.reset();
    if (creatorNameInput) {
      creatorNameInput.value = user.username;
      creatorNameInput.readOnly = true;
    }
    if (creatorPlatformInput) creatorPlatformInput.value = user.channel || "";

    permissionModal?.classList.add("is-open");
    permissionModal?.setAttribute("aria-hidden", "false");
    setTimeout(() => creatorPlatformInput?.focus(), 120);
  }

  function closePermissionModal() {
    pendingStoryId = null;
    permissionModal?.classList.remove("is-open");
    permissionModal?.setAttribute("aria-hidden", "true");
  }

  closeModalBtn?.addEventListener("click", closePermissionModal);
  cancelModalBtn?.addEventListener("click", closePermissionModal);
  permissionModal?.addEventListener("click", (e) => {
    if (e.target === permissionModal) closePermissionModal();
  });

  permissionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = getCurrentUser();
    if (!pendingStoryId || !user || user.role !== "creador") return;

    const platform = creatorPlatformInput?.value.trim() || "";
    const stories = loadData(STORAGE_KEYS.stories, []);
    const target = stories.find((s) => s.id === pendingStoryId);
    if (!target) return;

    if (!Array.isArray(target.requests)) target.requests = [];
    if (target.requests.some((r) => r.creatorId === user.id)) {
      closePermissionModal();
      return;
    }

    target.requests.push({
      id: crypto.randomUUID(),
      creatorId: user.id,
      creator: user.username,
      platform,
      status: "Pendiente",
      messages: []
    });

    saveData(STORAGE_KEYS.stories, stories);
    if (target.authorId) {
      addNotification(
        target.authorId,
        `🎙️ El creador ${user.username} pidió permiso para relatar "${target.title}".`
      );
    }

    renderStories();
    closePermissionModal();
  });

  function updateRequestStatus(storyId, requestIndex, newStatus) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const stories = loadData(STORAGE_KEYS.stories, []);
    const target = stories.find((s) => s.id === storyId);
    if (!target || target.authorId !== currentUser.id) return;

    const req = target.requests?.[requestIndex];
    if (!req) return;
    req.status = newStatus;
    saveData(STORAGE_KEYS.stories, stories);

    if (req.creatorId) {
      addNotification(
        req.creatorId,
        `📌 ${currentUser.username} marcó como ${newStatus} tu solicitud para "${target.title}".`
      );
    }
    renderStories();
  }

  // --- ACUERDOS Y CHAT ---
  function hasAcceptedAgreement(story, requestObj, currentUser) {
    if (!currentUser || !story || !requestObj || requestObj.status !== "Aceptada") return false;
    return story.authorId === currentUser.id || requestObj.creatorId === currentUser.id;
  }

  function getAcceptedAgreementsForUser(currentUser) {
    if (!currentUser) return [];
    const agreements = [];
    loadData(STORAGE_KEYS.stories, []).forEach((story) => {
      (Array.isArray(story.requests) ? story.requests : []).forEach((req) => {
        if (hasAcceptedAgreement(story, req, currentUser)) {
          agreements.push({
            storyId: story.id,
            requestId: req.id,
            storyTitle: story.title,
            peerName: story.authorId === currentUser.id ? req.creator : story.author,
            messagesCount: (req.messages || []).length
          });
        }
      });
    });
    return agreements;
  }

  function renderAgreedChatsSidebar() {
    const list = getAcceptedAgreementsForUser(getCurrentUser());
    if (chatHubBadge) {
      chatHubBadge.textContent = String(list.length);
      chatHubBadge.classList.toggle("is-hidden", list.length === 0);
    }
    if (!agreedChatsSidebarList) return;
    agreedChatsSidebarList.innerHTML = "";

    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "fb-right-muted";
      empty.style.marginTop = "0.55rem";
      empty.textContent = "Aún no tienes acuerdos aceptados con chat habilitado.";
      agreedChatsSidebarList.appendChild(empty);
      return;
    }

    list.forEach((item) => {
      const row = document.createElement("div");
      row.className = "fb-agreed-row";

      const info = document.createElement("div");
      const strongEl = document.createElement("strong");
      strongEl.textContent = item.peerName;
      const subEl = document.createElement("div");
      subEl.className = "fb-right-muted";
      subEl.textContent = item.storyTitle;
      info.append(strongEl, subEl);

      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "btn-chat";
      openBtn.textContent = `💬 (${item.messagesCount})`;
      openBtn.addEventListener("click", () => openChatModal(item.storyId, item.requestId));

      row.append(info, openBtn);
      agreedChatsSidebarList.appendChild(row);
    });
  }

  function openFirstAvailableAgreementChat() {
    const list = getAcceptedAgreementsForUser(getCurrentUser());
    if (list.length > 0) {
      openChatModal(list[0].storyId, list[0].requestId);
    } else {
      agreedChatsSidebarList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  openAgreementsChatBtn?.addEventListener("click", openFirstAvailableAgreementChat);
  railAgreementsChatBtn?.addEventListener("click", openFirstAvailableAgreementChat);
  menuOpenChatHubBtn?.addEventListener("click", () => {
    profileMenuCtrl.setOpen(false);
    openFirstAvailableAgreementChat();
  });

  function openChatModal(storyId, requestId) {
    const currentUser = getCurrentUser();
    const story = loadData(STORAGE_KEYS.stories, []).find((s) => s.id === storyId);
    const req = story?.requests?.find((r) => r.id === requestId);
    if (!story || !req || !hasAcceptedAgreement(story, req, currentUser)) return;

    activeChatContext = { storyId, requestId };
    if (chatContextSubtitle) {
      chatContextSubtitle.textContent = `Acuerdo aceptado · "${story.title}" · Autor: ${story.author} · Creador: ${req.creator}`;
    }
    chatForm?.reset();
    renderChatMessages();
    chatModal?.classList.add("is-open");
    chatModal?.setAttribute("aria-hidden", "false");
    setTimeout(() => chatInput?.focus(), 120);
  }

  function closeChatModal() {
    activeChatContext = null;
    chatModal?.classList.remove("is-open");
    chatModal?.setAttribute("aria-hidden", "true");
  }

  closeChatBtn?.addEventListener("click", closeChatModal);
  chatModal?.addEventListener("click", (e) => {
    if (e.target === chatModal) closeChatModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      allPopoverCtrls.forEach((c) => c.setOpen(false));
      if (permissionModal?.classList.contains("is-open")) closePermissionModal();
      if (chatModal?.classList.contains("is-open")) closeChatModal();
    }
  });

  function renderChatMessages() {
    if (!chatMessagesEl) return;
    chatMessagesEl.innerHTML = "";
    if (!activeChatContext) return;

    const currentUser = getCurrentUser();
    const story = loadData(STORAGE_KEYS.stories, []).find((s) => s.id === activeChatContext.storyId);
    const req = story?.requests?.find((r) => r.id === activeChatContext.requestId);
    if (!story || !req || !hasAcceptedAgreement(story, req, currentUser)) return;

    const msgs = req.messages || [];
    if (msgs.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "color:#9aa2b8;font-size:0.85rem;";
      empty.textContent = "Acuerdo confirmado. Coordina aquí los detalles del relato.";
      chatMessagesEl.appendChild(empty);
      return;
    }

    msgs.forEach((m) => {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${currentUser && m.senderId === currentUser.id ? "is-mine" : ""}`;

      const sender = document.createElement("div");
      sender.className = "chat-sender";
      sender.textContent = `${m.senderName} (${m.senderRole}) · ${m.time}`;

      const text = document.createElement("div");
      text.textContent = m.text;

      bubble.append(sender, text);
      chatMessagesEl.appendChild(bubble);
    });
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!activeChatContext || !currentUser) return;

    const text = chatInput?.value.trim() || "";
    if (!text) return;

    const stories = loadData(STORAGE_KEYS.stories, []);
    const story = stories.find((s) => s.id === activeChatContext.storyId);
    const req = story?.requests?.find((r) => r.id === activeChatContext.requestId);
    if (!story || !req || !hasAcceptedAgreement(story, req, currentUser)) return;

    const roleLabel = currentUser.role === "creador" ? "Creador" : "Autor";
    if (!Array.isArray(req.messages)) req.messages = [];
    req.messages.push({
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderRole: roleLabel,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    saveData(STORAGE_KEYS.stories, stories);

    const recipientId = currentUser.id === story.authorId ? req.creatorId : story.authorId;
    if (recipientId) {
      addNotification(
        recipientId,
        `💬 Nuevo mensaje en acuerdo de "${story.title}" (${roleLabel}):`,
        text
      );
    }

    if (chatInput) chatInput.value = "";
    renderChatMessages();
    renderStories();
  });

  // --- RENDER RELATOS ---
  function renderStories() {
    const stories = loadData(STORAGE_KEYS.stories, []).filter((s) => {
      if (isUserBlocked(getTargetKey(s))) return false;
      if (!searchQuery) return true;
      return `${s.title} ${s.author} ${s.category} ${s.content}`.toLowerCase().includes(searchQuery);
    });
    const currentUser = getCurrentUser();
    storiesList.innerHTML = "";

    if (stories.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = searchQuery
        ? "No hay relatos que coincidan con tu búsqueda."
        : "Aún no hay relatos publicados. ¡Pulsa 'Crear relato y opciones' para escribir el primero!";
      emptyMsg.style.color = "#9aa2b8";
      storiesList.appendChild(emptyMsg);
      renderAgreedChatsSidebar();
      return;
    }

    stories.forEach((story) => {
      const card = document.createElement("article");
      card.className = "story-card";
      if (story.id === lastCreatedStoryId) card.classList.add("story-enter");

      const isOwner = Boolean(currentUser && story.authorId === currentUser.id);
      const targetKey = getTargetKey(story);
      const activeAvatar = lookupAvatarForEntry({
        authorId: story.authorId || "",
        name: story.author || "",
        fallbackAvatar: isOwner ? currentUser.avatar || "" : story.authorAvatar || ""
      });
      const profileHref = isOwner ? "perfil.html" : getProfileUrlForTarget(targetKey, story.author);

      const topRow = document.createElement("div");
      topRow.className = "story-card-top";
      const titleEl = document.createElement("h3");
      titleEl.textContent = story.title;
      topRow.append(titleEl, buildFollowButton(targetKey, story.author, story.authorId || null, isOwner));

      const metaEl = document.createElement("div");
      metaEl.className = "story-meta";
      metaEl.append(
        document.createTextNode("Por "),
        buildAuthorLink(story.author, activeAvatar, profileHref),
        document.createTextNode(` · ${story.category}${isOwner ? " · (Tu relato)" : ""}`)
      );

      const contentEl = document.createElement("p");
      contentEl.textContent = story.content;
      card.append(topRow, metaEl, contentEl);

      if (isDataImage(story.image) || isDataVideo(story.video)) {
        const mediaWrap = document.createElement("div");
        mediaWrap.className = "story-media-wrap";
        if (isDataImage(story.image)) {
          const imgEl = document.createElement("img");
          imgEl.src = story.image;
          imgEl.alt = `Imagen de ${story.title}`;
          imgEl.className = "story-media-img";
          mediaWrap.appendChild(imgEl);
        }
        if (isDataVideo(story.video)) {
          const vidEl = document.createElement("video");
          vidEl.src = story.video;
          vidEl.controls = true;
          vidEl.preload = "metadata";
          vidEl.className = "story-media-video";
          mediaWrap.appendChild(vidEl);
        }
        card.appendChild(mediaWrap);
      }

      const requests = Array.isArray(story.requests) ? story.requests : [];
      if (!story.allowCreators) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "🔒 Solo lectura en la app";
        card.appendChild(badge);
      } else if (isOwner) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "🎙️ Abierto a solicitudes de creadores";
        card.appendChild(badge);
      } else if (currentUser?.role === "creador") {
        if (requests.some((r) => r.creatorId === currentUser.id)) {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = "✓ Ya enviaste solicitud para este relato";
          card.appendChild(badge);
        } else {
          const reqBtn = document.createElement("button");
          reqBtn.type = "button";
          reqBtn.textContent = "🎙️ Pedir permiso para relatar";
          reqBtn.addEventListener("click", () => openPermissionModal(story));
          card.appendChild(reqBtn);
        }
      }

      if (requests.length > 0) {
        const reqBox = document.createElement("div");
        reqBox.className = "request-box";
        const reqTitle = document.createElement("strong");
        reqTitle.textContent = "Solicitudes de creadores:";
        reqBox.appendChild(reqTitle);

        requests.forEach((r, index) => {
          const row = document.createElement("div");
          row.className = "request-item";

          const info = document.createElement("span");
          const creatorAvatar = lookupAvatarForEntry({
            authorId: r.creatorId || "",
            name: r.creator || ""
          });
          if (isDataImage(creatorAvatar)) {
            const cMini = document.createElement("img");
            cMini.src = creatorAvatar;
            cMini.alt = r.creator;
            cMini.className = "mini-avatar";
            cMini.style.marginRight = "0.35rem";
            info.appendChild(cMini);
          }
          info.appendChild(document.createTextNode(`${r.creator}${r.platform ? ` (${r.platform})` : ""} `));

          const pill = document.createElement("span");
          pill.className = `status-pill status-${(r.status || "pendiente").toLowerCase()}`;
          pill.textContent = r.status || "Pendiente";
          info.appendChild(pill);
          row.appendChild(info);

          const actions = document.createElement("div");
          actions.className = "request-actions";

          if (isOwner && r.status === "Pendiente") {
            const acceptBtn = document.createElement("button");
            acceptBtn.type = "button";
            acceptBtn.className = "btn-mini btn-accept";
            acceptBtn.textContent = "✓ Aceptar";
            acceptBtn.addEventListener("click", () => updateRequestStatus(story.id, index, "Aceptada"));

            const rejectBtn = document.createElement("button");
            rejectBtn.type = "button";
            rejectBtn.className = "btn-mini btn-reject";
            rejectBtn.textContent = "✕ Rechazar";
            rejectBtn.addEventListener("click", () => updateRequestStatus(story.id, index, "Rechazada"));

            actions.append(acceptBtn, rejectBtn);
          }

          if (hasAcceptedAgreement(story, r, currentUser)) {
            const chatBtn = document.createElement("button");
            chatBtn.type = "button";
            chatBtn.className = "btn-chat";
            const count = (r.messages || []).length;
            chatBtn.textContent = count > 0 ? `💬 Chat (${count})` : "💬 Chat";
            chatBtn.addEventListener("click", () => openChatModal(story.id, r.id));
            actions.appendChild(chatBtn);
          }

          if (actions.children.length > 0) row.appendChild(actions);
          reqBox.appendChild(row);
        });

        card.appendChild(reqBox);
      }

      storiesList.appendChild(card);
    });

    lastCreatedStoryId = null;
    renderAgreedChatsSidebar();
  }

  // --- RENDER CREADORES ---
  function renderCreatorPosts() {
    if (!creatorPostsList) return;
    const posts = loadData(STORAGE_KEYS.creatorPosts, []).filter((p) => {
      if (isUserBlocked(getTargetKey(p))) return false;
      if (!searchQuery) return true;
      return `${p.channel} ${p.network} ${p.type} ${p.message}`.toLowerCase().includes(searchQuery);
    });
    const currentUser = getCurrentUser();
    creatorPostsList.innerHTML = "";

    if (posts.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = searchQuery
        ? "No hay publicaciones de creadores que coincidan con tu búsqueda."
        : "Aún no hay anuncios de creadores. ¡Publica un adelanto o convocatoria arriba!";
      emptyMsg.style.color = "#9aa2b8";
      creatorPostsList.appendChild(emptyMsg);
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "story-card";
      if (post.id === lastCreatedPostId) card.classList.add("story-enter");

      const topRow = document.createElement("div");
      topRow.className = "creator-card-top";

      const tag = document.createElement("span");
      tag.className = "creator-tag";
      tag.style.marginBottom = "0";
      tag.textContent = post.type;

      const targetKey = getTargetKey(post);
      const isSelf = Boolean(currentUser && post.authorId === currentUser.id);
      const profileHref = isSelf ? "perfil.html" : getProfileUrlForTarget(targetKey, post.channel);

      topRow.append(tag, buildFollowButton(targetKey, post.channel, post.authorId || null, isSelf));

      const titleEl = document.createElement("h3");
      const activeAvatar = lookupAvatarForEntry({
        authorId: post.authorId || "",
        name: post.channel || "",
        fallbackAvatar: isSelf ? currentUser.avatar || "" : post.authorAvatar || ""
      });
      titleEl.appendChild(buildAuthorLink(post.channel, activeAvatar, profileHref));

      const metaEl = document.createElement("div");
      metaEl.className = "story-meta";
      metaEl.appendChild(document.createTextNode(post.network));

      const messageEl = document.createElement("p");
      messageEl.textContent = post.message;

      card.append(topRow, titleEl, metaEl, messageEl);
      creatorPostsList.appendChild(card);
    });

    lastCreatedPostId = null;
  }

  function triggerPublishFeedback(button, drawer, triggerBtn, defaultLabel, afterCallback) {
    const btnText = button?.querySelector("span");
    if (btnText) btnText.textContent = "✓ Publicado";
    button?.classList.add("is-published");

    afterCallback();

    setTimeout(() => {
      setDrawerState(drawer, triggerBtn, false);
      if (btnText) btnText.textContent = defaultLabel;
      button?.classList.remove("is-published");
    }, 650);
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const title = byId("title")?.value.trim() || "";
    const content = byId("content")?.value.trim() || "";
    if (!title || !content) return;

    const newStory = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      author: currentUser.username,
      authorAvatar: lookupAvatarForEntry({
        authorId: currentUser.id,
        name: currentUser.username,
        fallbackAvatar: currentUser.avatar || ""
      }),
      title,
      category: byId("category")?.value || "Casa / Habitación",
      content,
      image: draftStoryImage || "",
      video: draftStoryVideo || "",
      allowCreators: Boolean(byId("allow-creators")?.checked),
      requests: []
    };

    const stories = loadData(STORAGE_KEYS.stories, []);
    stories.unshift(newStory);
    if (!saveData(STORAGE_KEYS.stories, stories) && (draftStoryImage || draftStoryVideo)) {
      stories.shift();
      newStory.video = "";
      stories.unshift(newStory);
      saveData(STORAGE_KEYS.stories, stories);
    }

    lastCreatedStoryId = newStory.id;
    triggerPublishFeedback(publishBtn, composerDrawer, toggleComposerBtn, "✨ Publicar relato", () => {
      draftStoryImage = "";
      draftStoryVideo = "";
      if (storyImageFileInput) storyImageFileInput.value = "";
      if (storyVideoFileInput) storyVideoFileInput.value = "";
      syncDraftMediaPreview();
      renderStories();
      form.reset();
      syncSessionUI();
    });
  });

  creatorPostForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "creador") {
      setDrawerState(creatorDrawer, toggleCreatorComposerBtn, false);
      showCreatorRoleWarning();
      return;
    }

    const network = creatorNetworkInput?.value.trim() || "";
    const message = byId("creator-message")?.value.trim() || "";
    if (!network || !message) return;

    const newPost = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorAvatar: lookupAvatarForEntry({
        authorId: currentUser.id,
        name: currentUser.username,
        fallbackAvatar: currentUser.avatar || ""
      }),
      channel: currentUser.username,
      network,
      type: byId("creator-post-type")?.value || "Próximo video / Estreno",
      message
    };

    const posts = loadData(STORAGE_KEYS.creatorPosts, []);
    posts.unshift(newPost);
    saveData(STORAGE_KEYS.creatorPosts, posts);

    lastCreatedPostId = newPost.id;
    triggerPublishFeedback(
      publishCreatorBtn,
      creatorDrawer,
      toggleCreatorComposerBtn,
      "📢 Publicar en espacio de creadores",
      () => {
        renderCreatorPosts();
        creatorPostForm.reset();
        syncSessionUI();
      }
    );
  });

  if (initialSession) {
    syncSessionUI();
    setDrawerState(composerDrawer, toggleComposerBtn, false);
    setDrawerState(creatorDrawer, toggleCreatorComposerBtn, false);
    syncCompactSectionLabel("stories-view");
    renderStories();
    renderCreatorPosts();
    renderNotifications();
  }
}