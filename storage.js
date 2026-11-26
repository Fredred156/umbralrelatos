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

const USER_ROLES = {
  standard: "usuario_estandar",
  creator: "creador_suscrito"
};

const EARLY_ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
const RESERVATION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

const SESSION_BACKUP_PREFIX = "__UMBRAL_SESSION_BACKUP__:";
const LOGGED_OUT_FLAG_KEY = "__UMBRAL_EXPLICIT_LOGOUT_V1__";

const LIMITS = {
  maxUploadBytes: 2 * 1024 * 1024,
  maxStoryMediaBytes: 8 * 1024 * 1024,
  maxCreatorVideoBytes: 25 * 1024 * 1024,
  freeVideoMaxBytes: 5 * 1024 * 1024,
  freeVideoMaxSeconds: 60,
  creatorVideoMaxBytes: 25 * 1024 * 1024,
  creatorVideoMaxSeconds: 600,
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
const nowDateLabel = (ts = Date.now()) =>
  new Date(ts).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });

function normalizeRole(role) {
  if (role === USER_ROLES.creator || role === "creador") {
    return USER_ROLES.creator;
  }
  return USER_ROLES.standard;
}

function isCreatorUser(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return role === USER_ROLES.creator || role === "creador";
}

function sanitizePromoUrl(raw, prefix = "") {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("@") && prefix) return `${prefix}${value}`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(value)) return `https://${value}`;
  if (prefix) return `${prefix}${value.replace(/^\/+/, "")}`;
  return "";
}

function normalizePromoLinks(raw = {}) {
  return {
    youtube: sanitizePromoUrl(raw.youtube || "", "https://www.youtube.com/"),
    tiktok: sanitizePromoUrl(raw.tiktok || "", "https://www.tiktok.com/"),
    spotify: sanitizePromoUrl(raw.spotify || "", "https://open.spotify.com/")
  };
}

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

function buildVerifiedBadgeEl(titleText = "Creador suscrito verificado") {
  const badge = document.createElement("span");
  badge.className = "umbral-verified-badge";
  badge.title = titleText;
  badge.setAttribute("aria-label", titleText);
  badge.appendChild(iconEl("verified", "umbral-icon--sm"));
  return badge;
}

function isUserVerifiedCreator(userId = "", fallbackName = "", explicitVerified = false) {
  if (explicitVerified) return true;
  const users = loadData(STORAGE_KEYS.users, []);
  const session = getCurrentUser();
  const norm = String(fallbackName || "").trim().toLowerCase();

  const matched =
    (userId && users.find((u) => u.id === userId)) ||
    (session?.id && userId && session.id === userId ? session : null) ||
    (norm ? users.find((u) => (u.username || "").toLowerCase() === norm) : null) ||
    (session?.username && norm && session.username.toLowerCase() === norm ? session : null);

  return isCreatorUser(matched);
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

function hasExplicitLogoutFlag() {
  try {
    if (sessionStorage.getItem(LOGGED_OUT_FLAG_KEY) === "1") return true;
  } catch (_) {}
  try {
    if (localStorage.getItem(LOGGED_OUT_FLAG_KEY) === "1") return true;
  } catch (_) {}
  return false;
}

function setExplicitLogoutFlag() {
  try {
    sessionStorage.setItem(LOGGED_OUT_FLAG_KEY, "1");
  } catch (_) {}
  try {
    localStorage.setItem(LOGGED_OUT_FLAG_KEY, "1");
  } catch (_) {}
}

function clearExplicitLogoutFlag() {
  try {
    sessionStorage.removeItem(LOGGED_OUT_FLAG_KEY);
  } catch (_) {}
  try {
    localStorage.removeItem(LOGGED_OUT_FLAG_KEY);
  } catch (_) {}
}

function normalizeSession(rawSession) {
  if (!rawSession || typeof rawSession !== "object") return null;
  const id = String(rawSession.id || "").trim();
  const username = String(rawSession.username || "").trim();
  if (!id || !username) return null;

  return {
    id,
    username,
    role: normalizeRole(rawSession.role),
    channel: String(rawSession.channel || ""),
    socials: String(rawSession.socials || ""),
    promoLinks: normalizePromoLinks(rawSession.promoLinks || {}),
    avatar: isDataImage(rawSession.avatar) ? rawSession.avatar : "",
    banner: isDataImage(rawSession.banner) ? rawSession.banner : "",
    shortDesc: String(rawSession.shortDesc || ""),
    bio: String(rawSession.bio || ""),
    allowPublicFollowLists:
      typeof rawSession.allowPublicFollowLists === "boolean"
        ? rawSession.allowPublicFollowLists
        : true
  };
}

function writeSessionBackup(sessionObj) {
  if (hasExplicitLogoutFlag()) return;
  const serialized = JSON.stringify(sessionObj);
  try {
    sessionStorage.setItem(STORAGE_KEYS.session, serialized);
  } catch (_) {}

  try {
    if (typeof window.name === "string" && !window.name.startsWith("{")) {
      window.name = `${SESSION_BACKUP_PREFIX}${encodeURIComponent(serialized)}`;
    }
  } catch (_) {}
}

function readSessionBackup() {
  if (hasExplicitLogoutFlag()) return null;
  try {
    const rawSs = sessionStorage.getItem(STORAGE_KEYS.session);
    if (rawSs) {
      const parsedSs = normalizeSession(JSON.parse(rawSs));
      if (parsedSs) return parsedSs;
    }
  } catch (_) {}

  try {
    if (typeof window.name === "string" && window.name.startsWith(SESSION_BACKUP_PREFIX)) {
      const decoded = decodeURIComponent(window.name.slice(SESSION_BACKUP_PREFIX.length));
      const parsedWn = normalizeSession(JSON.parse(decoded));
      if (parsedWn) return parsedWn;
    }
  } catch (_) {}

  return null;
}

function clearSessionBackup() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session);
  } catch (_) {}

  try {
    if (typeof window.name === "string" && window.name.startsWith(SESSION_BACKUP_PREFIX)) {
      window.name = "";
    }
  } catch (_) {}
}

function persistSession(sessionData) {
  const normalized = normalizeSession(sessionData);
  if (!normalized) return null;

  clearExplicitLogoutFlag();
  const savedInLocal = saveData(STORAGE_KEYS.session, normalized);
  if (!savedInLocal) {
    const lightSession = { ...normalized, avatar: "", banner: "" };
    saveData(STORAGE_KEYS.session, lightSession);
  }
  writeSessionBackup(normalized);
  return normalized;
}

function clearActiveSession() {
  setExplicitLogoutFlag();
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
  } catch (_) {}
  clearSessionBackup();
}

function getCurrentUser() {
  if (hasExplicitLogoutFlag()) {
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
    } catch (_) {}
    clearSessionBackup();
    return null;
  }

  const fromLocal = normalizeSession(loadData(STORAGE_KEYS.session, null));
  if (fromLocal) {
    writeSessionBackup(fromLocal);
    return fromLocal;
  }

  const fromBackup = readSessionBackup();
  if (fromBackup) {
    saveData(STORAGE_KEYS.session, fromBackup);
    return fromBackup;
  }

  return null;
}

function isPublicFollowListsEnabled(userLike) {
  return typeof userLike?.allowPublicFollowLists === "boolean"
    ? userLike.allowPublicFollowLists
    : true;
}

function buildSessionPayload(user) {
  return normalizeSession({
    id: user.id,
    username: user.username,
    role: normalizeRole(user.role),
    channel: user.channel || "",
    socials: user.socials || "",
    promoLinks: normalizePromoLinks(user.promoLinks || {}),
    avatar: user.avatar || "",
    banner: user.banner || "",
    shortDesc: user.shortDesc || "",
    bio: user.bio || "",
    allowPublicFollowLists: isPublicFollowListsEnabled(user)
  });
}

function syncUserAcrossStorage(updatedUser) {
  const normalized = persistSession(updatedUser) || updatedUser;
  const users = loadData(STORAGE_KEYS.users, []);
  const idx = users.findIndex((u) => u.id === normalized.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...normalized };
    saveData(STORAGE_KEYS.users, users);
  }
}

function updateUserReferencesInPosts(userId, newUsername, newAvatar, newChannel, newPromoLinks = null) {
  const stories = loadData(STORAGE_KEYS.stories, []);
  let changedStories = false;
  stories.forEach((s) => {
    if (s.authorId === userId) {
      s.author = newUsername;
      s.authorAvatar = newAvatar;
      changedStories = true;
    }
    if (s.reservation && s.reservation.creatorId === userId) {
      s.reservation.creatorName = newUsername;
      if (newPromoLinks) s.reservation.promoLinks = normalizePromoLinks(newPromoLinks);
      changedStories = true;
    }
    if (s.shareMeta && typeof s.shareMeta === "object" && s.shareMeta[userId]) {
      s.shareMeta[userId].sharerName = newUsername;
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
    if (p.shareMeta && typeof p.shareMeta === "object" && p.shareMeta[userId]) {
      p.shareMeta[userId].sharerName = newUsername;
      changedPosts = true;
    }
  });
  if (changedPosts) saveData(STORAGE_KEYS.creatorPosts, posts);
}

function toggleCurrentUserSubscriptionPlan(forceRole = null) {
  const current = getCurrentUser();
  if (!current) return null;

  const nextRole =
    forceRole && (forceRole === USER_ROLES.creator || forceRole === USER_ROLES.standard)
      ? forceRole
      : isCreatorUser(current)
        ? USER_ROLES.standard
        : USER_ROLES.creator;

  const updated = {
    ...current,
    role: nextRole,
    channel:
      nextRole === USER_ROLES.creator && !current.channel
        ? "Canal Umbral"
        : current.channel || ""
  };

  syncUserAcrossStorage(updated);
  return getCurrentUser();
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
    role: normalizeRole(found?.role),
    channel: found?.channel || "",
    socials: found?.socials || "",
    promoLinks: normalizePromoLinks(found?.promoLinks || {}),
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

// --- VALIDACIÓN DE VIDEO POR ROL (usuario_estandar vs creador_suscrito) ---
function validateVideoFileForUser(file, user) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ ok: false, error: "Archivo de video no válido.", duration: 0 });
      return;
    }

    if (!file.type.startsWith("video/")) {
      resolve({ ok: false, error: "Selecciona un archivo de video válido.", duration: 0 });
      return;
    }

    const isCreator = isCreatorUser(user);
    const maxBytes = isCreator ? LIMITS.creatorVideoMaxBytes : LIMITS.freeVideoMaxBytes;
    const maxSeconds = isCreator ? LIMITS.creatorVideoMaxSeconds : LIMITS.freeVideoMaxSeconds;
    const maxMbLabel = Math.round(maxBytes / (1024 * 1024));

    if (file.size > maxBytes) {
      resolve({
        ok: false,
        error: isCreator
          ? `El video supera el límite de ${maxMbLabel} MB para Creador Suscrito.`
          : `Cuenta gratuita (${USER_ROLES.standard}): el video supera los ${maxMbLabel} MB permitidos. Suscríbete como Creador para subir videos de hasta 25 MB y 10 min.`,
        duration: 0
      });
      return;
    }

    const probeUrl = URL.createObjectURL(file);
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";

    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(probeUrl);
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ ok: true, error: "", duration: 0 });
    }, 2500);

    videoEl.onloadedmetadata = () => {
      clearTimeout(timer);
      const duration = Number(videoEl.duration) || 0;
      if (Number.isFinite(duration) && duration > maxSeconds) {
        finish({
          ok: false,
          error: isCreator
            ? `El video dura ${Math.round(duration)}s y supera el máximo de ${Math.round(maxSeconds / 60)} min.`
            : `Cuenta gratuita (${USER_ROLES.standard}): duración máxima de ${maxSeconds}s (tu video dura ${Math.round(duration)}s). Cambia a Creador Suscrito para videos más largos.`,
          duration
        });
        return;
      }
      finish({ ok: true, error: "", duration });
    };

    videoEl.onerror = () => {
      clearTimeout(timer);
      finish({ ok: true, error: "", duration: 0 });
    };

    videoEl.src = probeUrl;
  });
}

// --- CÁLCULO DE TIEMPO DE LECTURA (200 PPM), BÓVEDA 24H, RESERVA 7 DÍAS Y DESCARGA .TXT ---
function estimateReadingTime(text = "") {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutesExact = words / 200;
  const minutesRounded = Math.max(1, Math.ceil(minutesExact));
  const bucket = minutesExact <= 1 ? "short" : minutesExact <= 4 ? "medium" : "long";
  return { words, minutesExact, minutesRounded, bucket };
}

function isStoryInEarlyAccess(story) {
  if (!story || !story.createdAtTs) return false;
  const elapsed = Date.now() - Number(story.createdAtTs);
  return elapsed >= 0 && elapsed < EARLY_ACCESS_DURATION_MS;
}

function getEarlyAccessRemainingText(story) {
  if (!story || !story.createdAtTs) return "";
  const remainingMs = Math.max(0, EARLY_ACCESS_DURATION_MS - (Date.now() - Number(story.createdAtTs)));
  const totalMins = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return hours > 0 ? `${hours}h ${mins}m restantes` : `${mins}m restantes`;
}

function getActiveStoryReservation(story) {
  const res = story?.reservation;
  if (!res || !res.creatorId) return null;
  if (res.expiresAtTs && Date.now() > Number(res.expiresAtTs)) return null;
  return res;
}

function reserveStoryRecord(storyId, creatorUser) {
  if (!storyId || !creatorUser || !isCreatorUser(creatorUser)) {
    return { ok: false, error: "Solo un Creador Suscrito puede reservar relatos." };
  }

  const stories = loadData(STORAGE_KEYS.stories, []);
  const idx = stories.findIndex((s) => s.id === storyId);
  if (idx < 0) return { ok: false, error: "Relato no encontrado." };

  const story = stories[idx];
  const existing = getActiveStoryReservation(story);
  if (existing) {
    return {
      ok: false,
      error: `Este relato ya está en producción por ${existing.creatorName}.`
    };
  }

  const nowTs = Date.now();
  const expiresAtTs = nowTs + RESERVATION_DURATION_MS;
  const reservation = {
    creatorId: creatorUser.id,
    creatorName: creatorUser.username,
    reservedAtTs: nowTs,
    expiresAtTs,
    reservedDateLabel: nowDateLabel(nowTs),
    expiresDateLabel: nowDateLabel(expiresAtTs),
    promoLinks: normalizePromoLinks(creatorUser.promoLinks || {})
  };

  story.reservation = reservation;
  saveData(STORAGE_KEYS.stories, stories);

  if (story.authorId && story.authorId !== creatorUser.id) {
    const notifs = loadData(STORAGE_KEYS.notifs, []);
    notifs.unshift({
      id: crypto.randomUUID(),
      recipientId: story.authorId,
      text: `${creatorUser.username} reservó tu relato "${story.title}" por 7 días para narrarlo.`,
      preview: `En producción desde ${reservation.reservedDateLabel}`,
      iconName: "bookmark",
      read: false,
      createdAt: nowTimeLabel()
    });
    saveData(STORAGE_KEYS.notifs, notifs);
  }

  return { ok: true, story, reservation };
}

function buildStoryScriptTxt(story) {
  const res = getActiveStoryReservation(story);
  const creatorName = res?.creatorName || "Creador Suscrito";
  const reserveDate = res?.reservedDateLabel || nowDateLabel();
  const expireDate = res?.expiresDateLabel || nowDateLabel(Date.now() + RESERVATION_DURATION_MS);
  const reading = estimateReadingTime(story.content || "");

  return [
    "============================================================",
    "UMBRAL — GUION RESERVADO DE NARRACIÓN",
    "============================================================",
    `Título del relato : ${story.title || "Sin título"}`,
    `Autor original    : ${story.author || "Narrador de Umbral"}`,
    `Subgénero         : ${story.category || "Terror"}`,
    `Tiempo estimado   : ~${reading.minutesRounded} min (${reading.words} palabras)`,
    `En producción por : ${creatorName}`,
    `Fecha de reserva  : ${reserveDate} (vigencia hasta ${expireDate})`,
    "============================================================",
    "",
    story.content || "",
    "",
    "============================================================",
    "CLÁUSULA DE LICENCIA DE NARRACIÓN Y CRÉDITO OBLIGATORIO",
    "============================================================",
    `1. El creador "${creatorName}" cuenta con reserva exclusiva de narración`,
    "   en Umbral por 7 días naturales a partir de la fecha de reserva.",
    `2. Es OBLIGATORIO otorgar crédito visible y/o verbal al autor original`,
    `   "${story.author || "Narrador"}" en el título, descripción o narración`,
    "   (YouTube, TikTok, Spotify u otras plataformas).",
    "3. Esta licencia no transfiere los derechos de autoría ni autoriza",
    "   la reventa del texto escrito como obra propia.",
    "============================================================"
  ].join("\n");
}

function downloadStoryScriptTxt(story) {
  if (!story) return;
  const content = buildStoryScriptTxt(story);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const slug = String(story.title || "guion-umbral")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug || "relato"}-guion-umbral.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildPromoLinksEl(promoLinksInput = {}, titlePrefix = "") {
  const links = normalizePromoLinks(promoLinksInput);
  const entries = [
    { key: "youtube", label: "YouTube", icon: "youtube", url: links.youtube, cls: "is-yt" },
    { key: "tiktok", label: "TikTok", icon: "tiktok", url: links.tiktok, cls: "is-tt" },
    { key: "spotify", label: "Spotify", icon: "spotify", url: links.spotify, cls: "is-sp" }
  ].filter((item) => Boolean(item.url));

  if (entries.length === 0) return null;

  const wrap = document.createElement("div");
  wrap.className = "umbral-promo-links-row";

  if (titlePrefix) {
    const labelEl = document.createElement("span");
    labelEl.className = "umbral-promo-label";
    labelEl.textContent = titlePrefix;
    wrap.appendChild(labelEl);
  }

  entries.forEach((item) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = `umbral-promo-btn ${item.cls}`;
    a.append(iconEl(item.icon, "umbral-icon--sm"), document.createTextNode(item.label));
    wrap.appendChild(a);
  });

  return wrap;
}

function notifyUsersOfVipCall(creatorUser, post) {
  if (!creatorUser || !post) return;
  const users = loadData(STORAGE_KEYS.users, []);
  const notifs = loadData(STORAGE_KEYS.notifs, []);
  const timeNow = nowTimeLabel();
  const recipientIds = new Set();

  users.forEach((u) => {
    if (u.id && u.id !== creatorUser.id) recipientIds.add(u.id);
  });

  recipientIds.forEach((recipientId) => {
    notifs.unshift({
      id: crypto.randomUUID(),
      recipientId,
      isVipCallNotif: true,
      vipPostId: post.id,
      text: `Convocatoria VIP de ${creatorUser.username}: solicita relatos nuevos.`,
      preview: String(post.message || "").slice(0, 90),
      iconName: "crown",
      read: false,
      createdAt: timeNow
    });
  });

  saveData(STORAGE_KEYS.notifs, notifs);
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

  const prevMeta = post.shareMeta[user.id] || {};
  const sharedAtTs = Number(options.sharedAtTs) || Number(prevMeta.sharedAtTs) || Date.now();
  const sharedAtDate = options.sharedAtDate || prevMeta.sharedAtDate || nowDateLabel(sharedAtTs);
  const sharedAt = options.sharedAt || prevMeta.sharedAt || nowTimeLabel();
  const originalAuthor =
    kind === "creator" ? post.channel || "Creador" : post.author || "Narrador";

  post.sharesCount = post.sharedBy.length;
  post.shareMeta[user.id] = {
    sharerId: user.id,
    sharerName: options.sharerName || prevMeta.sharerName || user.username || "Usuario",
    originalAuthor,
    originalAuthorId: post.authorId || "",
    note: String(options.note ?? prevMeta.note ?? "").trim(),
    visibility: options.visibility || prevMeta.visibility || "Público",
    sharedAtTs,
    sharedAtDate,
    sharedAt
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
    authorRole: normalizeRole(user.role),
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
      .map((item) => ({
        ...item,
        _kind: kind,
        _shareMeta: item.shareMeta?.[userId] || null,
        _shareTs: Number(item.shareMeta?.[userId]?.sharedAtTs) || 0
      }));

  const combined = [
    ...matches(loadData(STORAGE_KEYS.stories, []), "story"),
    ...matches(loadData(STORAGE_KEYS.creatorPosts, []), "creator")
  ];

  if (listField === "sharedBy") {
    combined.sort((a, b) => b._shareTs - a._shareTs);
  }

  return combined;
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

  const roleLabel = isCreatorUser(senderUser) ? "Creador" : "Autor";
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

function normalizePostComposerMeta(rawMeta = {}) {
  const allowedVisibility = ["Público", "Seguidores", "Solo yo"];
  const allowedAiLabels = ["Etiqueta de IA desactivada", "Contenido asistido con IA", "Generado con IA"];
  const allowedThemes = ["default", "abyss", "crimson-ash"];

  const visibility = allowedVisibility.includes(rawMeta.visibility)
    ? rawMeta.visibility
    : "Público";
  const aiLabel = allowedAiLabels.includes(rawMeta.aiLabel)
    ? rawMeta.aiLabel
    : "Etiqueta de IA desactivada";
  const textTheme = allowedThemes.includes(rawMeta.textTheme)
    ? rawMeta.textTheme
    : "default";

  return {
    visibility,
    aiLabel,
    isAiMarked: aiLabel !== "Etiqueta de IA desactivada",
    textTheme,
    feeling: String(rawMeta.feeling || "").trim(),
    location: String(rawMeta.location || "").trim(),
    taggedUsers: String(rawMeta.taggedUsers || "").trim(),
    flagTag: String(rawMeta.flagTag || "").trim(),
    extraNote: String(rawMeta.extraNote || "").trim()
  };
}

function redirectToCreatorRegistration(registerUrl = "registro.html") {
  clearActiveSession();
  navigateWithTransition(
    registerUrl,
    "Cerrando sesión para crear una cuenta de creador..."
  );
}