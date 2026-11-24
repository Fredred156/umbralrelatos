// --- ALMACENAMIENTO, SESIÓN Y UTILIDADES COMPARTIDAS (storage.js) ---
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
const nowTimeLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function iconEl(name, extraClass = "") {
  if (typeof window.createUmbralIcon === "function") {
    return window.createUmbralIcon(name, extraClass);
  }
  const span = document.createElement("span");
  span.className = `umbral-icon ${extraClass}`.trim();
  span.innerHTML = window.UMBRAL_ICONS?.[name] || window.UMBRAL_ICONS?.flame || "";
  return span;
}

function iconHtml(name, extraClass = "") {
  if (typeof window.umbralIconHtml === "function") {
    return window.umbralIconHtml(name, extraClass);
  }
  const markup = window.UMBRAL_ICONS?.[name] || window.UMBRAL_ICONS?.flame || "";
  return `<span class="umbral-icon ${extraClass}">${markup}</span>`;
}

function setButtonContent(btn, iconName, text, iconClass = "umbral-icon--sm") {
  if (!btn) return;
  btn.innerHTML = "";
  if (iconName) btn.appendChild(iconEl(iconName, iconClass));
  const label = document.createElement("span");
  label.textContent = text;
  btn.appendChild(label);
}

function navigateWithTransition(url, message = "Abriendo el umbral...") {
  if (!url) return;
  if (url.toLowerCase().includes("login.html") && window.umbralTransition?.exitToLogin) {
    window.umbralTransition.exitToLogin(url);
    return;
  }
  if (window.umbralTransition?.go) {
    window.umbralTransition.go(url, message);
    return;
  }
  window.location.href = url;
}

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

function isPublicFollowListsEnabled(userLike) {
  return typeof userLike?.allowPublicFollowLists === "boolean"
    ? userLike.allowPublicFollowLists
    : true;
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
    allowPublicFollowLists: isPublicFollowListsEnabled(user)
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
  const normName = String(fallbackName || "").toLowerCase();
  const found =
    users.find((u) => u.id === userKey) ||
    (session?.id === userKey ? session : null) ||
    (normName ? users.find((u) => u.username.toLowerCase() === normName) : null);

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
    allowPublicFollowLists: isPublicFollowListsEnabled(found)
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

// --- INTERACCIONES SOCIALES (LIKES, COMPARTIDOS ÚNICOS POR USUARIO Y COMENTARIOS PÚBLICOS) ---
const getPostStorageKey = (kind) =>
  kind === "creator" ? STORAGE_KEYS.creatorPosts : STORAGE_KEYS.stories;

function findPostRecord(kind, postId) {
  const key = getPostStorageKey(kind);
  const items = loadData(key, []);
  const idx = items.findIndex((item) => item.id === postId);
  if (idx < 0) return { key, items, idx: -1, post: null };

  const post = items[idx];
  if (!Array.isArray(post.likes)) post.likes = [];
  post.sharedBy = Array.from(new Set(Array.isArray(post.sharedBy) ? post.sharedBy : []));
  if (!post.shareMeta || typeof post.shareMeta !== "object") post.shareMeta = {};
  post.sharesCount = post.sharedBy.length;
  if (!Array.isArray(post.comments)) post.comments = [];

  return { key, items, idx, post };
}

function hasUserSharedPost(post, userId) {
  return Boolean(post && userId && Array.isArray(post.sharedBy) && post.sharedBy.includes(userId));
}

function togglePostLike(kind, postId, userId) {
  if (!userId) return null;
  const { key, items, post } = findPostRecord(kind, postId);
  if (!post) return null;

  post.likes = post.likes.includes(userId)
    ? post.likes.filter((id) => id !== userId)
    : [...post.likes, userId];

  saveData(key, items);
  return post;
}

/**
 * Registra el compartido del usuario una sola vez en su perfil y contador general.
 * Si ya había compartido antes, no vuelve a sumar ni a duplicar en `sharedBy`,
 * pero sí conserva o actualiza su nota y privacidad en `shareMeta`.
 */
function sharePostRecord(kind, postId, user, options = {}) {
  if (!user?.id) return { post: null, alreadyShared: false, addedNow: false };
  const { key, items, post } = findPostRecord(kind, postId);
  if (!post) return { post: null, alreadyShared: false, addedNow: false };

  const alreadyShared = post.sharedBy.includes(user.id);
  let addedNow = false;
  if (!alreadyShared) {
    post.sharedBy.push(user.id);
    addedNow = true;
  }

  const prevMeta = post.shareMeta[user.id];
  post.sharesCount = post.sharedBy.length;
  post.shareMeta[user.id] = {
    note: String(options.note ?? prevMeta?.note ?? "").trim(),
    visibility: options.visibility || prevMeta?.visibility || "Público",
    sharedAt: prevMeta?.sharedAt || nowTimeLabel()
  };

  saveData(key, items);
  return { post, alreadyShared, addedNow };
}

function addPublicPostComment(kind, postId, user, { text = "", image = "", video = "" }) {
  const cleanText = String(text || "").trim();
  const hasImg = isDataImage(image);
  const hasVid = isDataVideo(video);
  if (!user?.id || (!cleanText && !hasImg && !hasVid)) return null;

  const { key, items, post } = findPostRecord(kind, postId);
  if (!post) return null;

  const comment = {
    id: crypto.randomUUID(),
    authorId: user.id,
    authorName: user.username,
    authorAvatar: lookupAvatarForEntry({
      authorId: user.id,
      name: user.username,
      fallbackAvatar: user.avatar || ""
    }),
    text: cleanText,
    image: hasImg ? image : "",
    video: hasVid ? video : "",
    time: nowTimeLabel()
  };

  post.comments.push(comment);
  if (!saveData(key, items) && hasVid) {
    comment.video = "";
    saveData(key, items);
  }

  return { post, comment };
}

function getUserPostInteractions(userId, listField) {
  if (!userId) return [];
  const matches = (items, kind) =>
    items
      .filter((item) => Array.isArray(item[listField]) && item[listField].includes(userId))
      .map((item) => ({ ...item, _kind: kind }));

  return [
    ...matches(loadData(STORAGE_KEYS.stories, []), "story"),
    ...matches(loadData(STORAGE_KEYS.creatorPosts, []), "creator")
  ];
}

const getUserLikedPosts = (userId) => getUserPostInteractions(userId, "likes");
const getUserSharedPosts = (userId) => getUserPostInteractions(userId, "sharedBy");

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
        navigateWithTransition(options.profileHref, `Abriendo perfil de ${username}...`);
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

function getAcceptedAgreementsForUser(user) {
  if (!user) return [];
  const agreements = [];
  loadData(STORAGE_KEYS.stories, []).forEach((story) => {
    (Array.isArray(story.requests) ? story.requests : []).forEach((req) => {
      if (req.status === "Aceptada" && (story.authorId === user.id || req.creatorId === user.id)) {
        const msgs = Array.isArray(req.messages) ? req.messages : [];
        agreements.push({
          storyId: story.id,
          requestId: req.id,
          storyTitle: story.title,
          peerId: story.authorId === user.id ? req.creatorId : story.authorId,
          peerName: story.authorId === user.id ? req.creator : story.author,
          messages: msgs,
          messagesCount: msgs.length
        });
      }
    });
  });
  return agreements;
}

function appendAgreementMessage(storyId, requestId, senderUser, text) {
  const cleanText = String(text || "").trim();
  if (!cleanText || !senderUser) return null;

  const stories = loadData(STORAGE_KEYS.stories, []);
  const story = stories.find((s) => s.id === storyId);
  const req = story?.requests?.find((r) => r.id === requestId);
  if (!story || !req || req.status !== "Aceptada") return null;

  const isParticipant = story.authorId === senderUser.id || req.creatorId === senderUser.id;
  if (!isParticipant) return null;

  const roleLabel = senderUser.role === "creador" ? "Creador" : "Autor";
  if (!Array.isArray(req.messages)) req.messages = [];

  const msgObj = {
    id: crypto.randomUUID(),
    senderId: senderUser.id,
    senderName: senderUser.username,
    senderRole: roleLabel,
    text: cleanText,
    time: nowTimeLabel()
  };

  req.messages.push(msgObj);
  saveData(STORAGE_KEYS.stories, stories);

  const recipientId = senderUser.id === story.authorId ? req.creatorId : story.authorId;
  if (recipientId) {
    const notifs = loadData(STORAGE_KEYS.notifs, []);
    notifs.unshift({
      id: crypto.randomUUID(),
      recipientId,
      text: `Nuevo mensaje en acuerdo de "${story.title}" (${roleLabel}):`,
      preview: cleanText,
      iconName: "chat",
      read: false,
      createdAt: msgObj.time
    });
    saveData(STORAGE_KEYS.notifs, notifs);
  }

  return { story, req, msgObj };
}