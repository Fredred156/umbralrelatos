// --- MURO PRINCIPAL (feed.js / index.html) ---
const storiesList = byId("stories-list");
if (storiesList) {
  const initialSession = getCurrentUser();
  if (!initialSession) navigateWithTransition("login.html");

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

  // Modal de Compartir estilo Facebook
  const sharePostModal = byId("share-post-modal");
  const closeSharePostBtn = byId("close-share-post-btn");
  const shareModalAvatar = byId("share-modal-avatar");
  const shareModalUsername = byId("share-modal-username");
  const sharePrivacySelect = byId("share-privacy-select");
  const sharePostForm = byId("share-post-form");
  const shareCommentInput = byId("share-comment-input");
  const shareModalStatus = byId("share-modal-status");
  const shareContactsRow = byId("share-contacts-row");
  const shareTargetsGrid = byId("share-targets-grid");

  // Modal de detalle de publicación (likes, compartidos y comentarios públicos con clip)
  const postDetailModal = byId("post-detail-modal");
  const postDetailTitle = byId("post-detail-modal-title");
  const postDetailBody = byId("post-detail-body");
  const closePostDetailBtn = byId("close-post-detail-btn");
  const postCommentForm = byId("post-comment-form");
  const postCommentFileInput = byId("post-comment-file");
  const postCommentClipBtn = byId("post-comment-clip-btn");
  const postCommentInput = byId("post-comment-input");
  const postCommentAttachmentPreview = byId("post-comment-attachment-preview");

  let lastCreatedStoryId = null;
  let lastCreatedPostId = null;
  let pendingStoryId = null;
  let activeChatContext = null;
  let activeShareModalRef = null;
  let activePostModalRef = null;
  let draftCommentMedia = { image: "", video: "", name: "" };
  let notifFilterMode = "all";
  let searchQuery = "";
  let draftStoryImage = "";
  let draftStoryVideo = "";

  const getTargetKey = (item) =>
    item.authorId || `author:${(item.author || item.channel || "").toLowerCase()}`;

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

  function appendMediaPreview(container, src, isVideo, altText) {
    const box = document.createElement("div");
    box.className = "fb-media-preview-item";
    if (isVideo) {
      const vid = document.createElement("video");
      vid.src = src;
      vid.controls = true;
      vid.preload = "metadata";
      box.appendChild(vid);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = altText;
      box.appendChild(img);
    }
    container.appendChild(box);
  }

  function syncDraftMediaPreview() {
    if (!storyMediaPreviewEl) return;
    storyMediaPreviewEl.innerHTML = "";
    let count = 0;

    if (isDataImage(draftStoryImage)) {
      appendMediaPreview(storyMediaPreviewEl, draftStoryImage, false, "Vista previa de imagen");
      count++;
    }
    if (isDataVideo(draftStoryVideo)) {
      appendMediaPreview(storyMediaPreviewEl, draftStoryVideo, true, "Vista previa de video");
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
      compactSectionLabel.innerHTML =
        tabId === "creators-view"
          ? `${iconHtml("film", "umbral-icon--sm")} Espacio de Creadores`
          : `${iconHtml("scroll", "umbral-icon--sm")} Muro de Relatos`;
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

    [topAvatarBtn, menuUserAvatar, leftRailAvatar, quickComposerAvatar, shareModalAvatar].forEach(
      (slot) => fillAvatarSlot(slot, user)
    );

    if (leftRailName) leftRailName.textContent = user.username || "Mi perfil";
    if (hoverProfileName) hoverProfileName.textContent = user.username || "Usuario";
    if (hoverProfileHandle) hoverProfileHandle.textContent = buildHandleSlug(user.username, user.id);

    const follows = loadData(STORAGE_KEYS.follows, []);
    if (hoverFollowersCount) {
      hoverFollowersCount.textContent = String(follows.filter((f) => f.targetKey === user.id).length);
    }
    if (hoverFollowingCount) {
      hoverFollowingCount.textContent = String(
        follows.filter((f) => f.followerId === user.id).length
      );
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
    const isPublicLists = isPublicFollowListsEnabled(user);

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
    syncUserAcrossStorage({ ...user, allowPublicFollowLists: !isPublicFollowListsEnabled(user) });
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
    navigateWithTransition("login.html");
  };
  logoutBtn?.addEventListener("click", performLogout);
  menuLogoutBtn?.addEventListener("click", performLogout);

  function setSessionLabel(iconName, text, modeClass) {
    if (!sessionStatusEl) return;
    sessionStatusEl.classList.remove("is-creator", "is-user");
    if (modeClass) sessionStatusEl.classList.add(modeClass);
    sessionStatusEl.innerHTML = "";
    sessionStatusEl.append(iconEl(iconName, "umbral-icon--sm"), document.createTextNode(text));
  }

  function syncSessionUI() {
    const user = getCurrentUser();
    if (!user) return;

    const isCreator = user.role === "creador";
    if (authorInput) {
      authorInput.value = user.username || "";
      authorInput.readOnly = true;
    }

    if (isCreator) {
      setSessionLabel("film", `Creador: ${user.username}`, "is-creator");
      if (compactRoleBadge) {
        compactRoleBadge.innerHTML = `${iconHtml("film", "umbral-icon--sm")} Creador: ${user.username}`;
      }
      creatorsTabBtn?.classList.remove("is-hidden");
      railCreatorsBtn?.classList.remove("is-hidden");
      toggleCreatorComposerBtn?.classList.remove("is-hidden");
      if (creatorChannelInput) {
        creatorChannelInput.value = user.username || "";
        creatorChannelInput.readOnly = true;
      }
      if (creatorNetworkInput && user.channel) creatorNetworkInput.value = user.channel;
    } else {
      setSessionLabel("quill", `Narrador: ${user.username}`, "is-user");
      if (compactRoleBadge) {
        compactRoleBadge.innerHTML = `${iconHtml("quill", "umbral-icon--sm")} Narrador: ${user.username}`;
      }
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

  function bindNotifFilter(btn, mode, otherBtn) {
    btn?.addEventListener("click", () => {
      notifFilterMode = mode;
      btn.classList.add("is-active");
      otherBtn?.classList.remove("is-active");
      renderNotifications();
    });
  }

  bindNotifFilter(notifFilterAllBtn, "all", notifFilterUnreadBtn);
  bindNotifFilter(notifFilterUnreadBtn, "unread", notifFilterAllBtn);

  document.addEventListener("click", (e) => {
    const popoverWraps = [
      { ctrl: notifMenuCtrl, wrap: notifDropdownWrap },
      { ctrl: profileMenuCtrl, wrap: topProfileWrap },
      { ctrl: settingsMenuCtrl, wrap: settingsDropdownWrap }
    ];
    popoverWraps.forEach(({ ctrl, wrap }) => {
      if (ctrl.isOpen() && wrap && !wrap.contains(e.target)) ctrl.setOpen(false);
    });
  });

  function addNotification(recipientId, text, preview = "", iconName = "bell") {
    if (!recipientId) return;
    const notifs = loadData(STORAGE_KEYS.notifs, []);
    notifs.unshift({
      id: crypto.randomUUID(),
      recipientId,
      text,
      preview,
      iconName,
      read: false,
      createdAt: nowTimeLabel()
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
      msg.style.display = "flex";
      msg.style.alignItems = "flex-start";
      msg.style.gap = "0.35rem";
      msg.append(
        iconEl(n.iconName || "bell", "umbral-icon--sm umbral-icon--accent"),
        document.createTextNode(n.text)
      );
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

  function toggleFollow(targetKey, targetName, recipientUserId = null) {
    toggleFollowRecord(targetKey, targetName, (currentUser) => {
      if (recipientUserId) {
        addNotification(
          recipientUserId,
          `${currentUser.username} comenzó a seguir tu perfil.`,
          "",
          "star"
        );
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
      ownBadge.append(
        iconEl("users", "umbral-icon--sm"),
        document.createTextNode(` ${followers} seguidores`)
      );
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
    setButtonContent(
      followBtn,
      following ? "check" : "star",
      `${following ? "Siguiendo" : "Seguir"} · ${followers}`
    );
    followBtn.addEventListener("click", () => toggleFollow(targetKey, targetName, recipientUserId));
    return followBtn;
  }

  function buildAuthorLink(name, avatarUrl, profileHref) {
    const wrap = document.createElement("span");
    wrap.style.display = "inline-flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "0.25rem";

    const openProfile = () =>
      navigateWithTransition(profileHref, `Abriendo perfil de ${name}...`);

    if (isDataImage(avatarUrl)) {
      const mini = document.createElement("img");
      mini.src = avatarUrl;
      mini.alt = name;
      mini.className = "mini-avatar profile-avatar-clickable";
      mini.title = `Ver perfil de ${name}`;
      mini.onerror = () => mini.remove();
      mini.addEventListener("click", openProfile);
      wrap.appendChild(mini);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "author-link-btn";
    btn.textContent = name;
    btn.title = `Ver perfil de ${name}`;
    btn.addEventListener("click", openProfile);
    wrap.appendChild(btn);
    return wrap;
  }

  // --- LIKES, COMPARTIDOS ÚNICOS Y MODAL ESTILO FACEBOOK ---
  function refreshAfterPostMutation() {
    renderStories();
    renderCreatorPosts();
    if (activePostModalRef && postDetailModal?.classList.contains("is-open")) {
      renderPostDetailModal(activePostModalRef.kind, activePostModalRef.id);
    }
  }

  function buildShareableUrl(kind, postId) {
    const tabParam = kind === "creator" ? "creators-view" : "stories-view";
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?tab=${encodeURIComponent(tabParam)}&post=${encodeURIComponent(postId)}`;
  }

  function renderShareContactsRow(kind, postId) {
    if (!shareContactsRow) return;
    shareContactsRow.innerHTML = "";
    const user = getCurrentUser();
    const agreements = getAcceptedAgreementsForUser(user);

    if (agreements.length === 0) {
      const msg = document.createElement("span");
      msg.className = "fb-right-muted";
      msg.textContent = "Aún no tienes acuerdos activos para enviar directo.";
      shareContactsRow.appendChild(msg);
      return;
    }

    agreements.forEach((ag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "share-contact-btn";
      btn.title = `Enviar a ${ag.peerName} (${ag.storyTitle})`;

      const avatar = document.createElement("span");
      avatar.className = "share-contact-avatar";
      const peerAvatar = lookupAvatarForEntry({ authorId: ag.peerId, name: ag.peerName });
      if (isDataImage(peerAvatar)) {
        const img = document.createElement("img");
        img.src = peerAvatar;
        img.alt = ag.peerName;
        avatar.appendChild(img);
      } else {
        avatar.textContent = (ag.peerName || "U").charAt(0).toUpperCase();
      }

      const label = document.createElement("span");
      label.className = "share-contact-name";
      label.textContent = ag.peerName;

      btn.append(avatar, label);
      btn.addEventListener("click", () => {
        if (!user) return;
        sharePostRecord(kind, postId, user, {
          note: shareCommentInput?.value || "",
          visibility: sharePrivacySelect?.value || "Público"
        });
        const link = buildShareableUrl(kind, postId);
        const customNote = (shareCommentInput?.value || "").trim();
        const chatMsg = customNote
          ? `Compartió una publicación: “${customNote}” · ${link}`
          : `Compartió una publicación contigo: ${link}`;
        appendAgreementMessage(ag.storyId, ag.requestId, user, chatMsg);
        refreshAfterPostMutation();
        if (shareModalStatus) {
          shareModalStatus.textContent = `Enviado por chat de acuerdos a ${ag.peerName}.`;
        }
      });

      shareContactsRow.appendChild(btn);
    });
  }

  function openShareModal(kind, postId) {
    const user = getCurrentUser();
    const { post } = findPostRecord(kind, postId);
    if (!user || !post) return;

    activeShareModalRef = { kind, id: postId };
    fillAvatarSlot(shareModalAvatar, user);
    if (shareModalUsername) shareModalUsername.textContent = user.username || "Usuario";

    const existingMeta = post.shareMeta?.[user.id];
    const alreadyShared = hasUserSharedPost(post, user.id);

    if (sharePrivacySelect) sharePrivacySelect.value = existingMeta?.visibility || "Público";
    if (shareCommentInput) shareCommentInput.value = existingMeta?.note || "";
    if (shareModalStatus) {
      shareModalStatus.textContent = alreadyShared
        ? "Ya compartiste esta publicación en tu perfil (cuenta 1 vez por usuario). Elige dónde o a quién enviarla:"
        : "Al compartir se agregará a tu perfil una sola vez y podrás enviarla a donde quieras.";
    }

    renderShareContactsRow(kind, postId);
    sharePostModal?.classList.add("is-open");
    sharePostModal?.setAttribute("aria-hidden", "false");
    setTimeout(() => shareCommentInput?.focus(), 100);
  }

  function closeShareModal() {
    activeShareModalRef = null;
    sharePostModal?.classList.remove("is-open");
    sharePostModal?.setAttribute("aria-hidden", "true");
  }

  closeSharePostBtn?.addEventListener("click", closeShareModal);
  sharePostModal?.addEventListener("click", (e) => {
    if (e.target === sharePostModal) closeShareModal();
  });

  sharePostForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!activeShareModalRef || !user) return;

    const { alreadyShared, addedNow } = sharePostRecord(
      activeShareModalRef.kind,
      activeShareModalRef.id,
      user,
      {
        note: shareCommentInput?.value || "",
        visibility: sharePrivacySelect?.value || "Público"
      }
    );

    refreshAfterPostMutation();
    if (shareModalStatus) {
      shareModalStatus.textContent = addedNow
        ? "Listo: ya quedó compartida en tu perfil."
        : alreadyShared
          ? "Nota actualizada; ya figuraba compartida en tu perfil."
          : "Compartido.";
    }
  });

  shareTargetsGrid?.addEventListener("click", async (e) => {
    const btn = e.target.closest?.("[data-share-target]");
    if (!btn || !activeShareModalRef) return;
    const user = getCurrentUser();
    if (!user) return;

    const target = btn.dataset.shareTarget;
    sharePostRecord(activeShareModalRef.kind, activeShareModalRef.id, user, {
      note: shareCommentInput?.value || "",
      visibility: sharePrivacySelect?.value || "Público"
    });
    refreshAfterPostMutation();

    const url = buildShareableUrl(activeShareModalRef.kind, activeShareModalRef.id);
    if (target === "copiar") {
      try {
        await navigator.clipboard?.writeText(url);
      } catch (_) {}
      if (shareModalStatus) shareModalStatus.textContent = "Enlace copiado al portapapeles.";
      return;
    }

    closeShareModal();
    if (target === "perfil") {
      navigateWithTransition("perfil.html", "Abriendo tu perfil...");
    } else if (target === "acuerdos") {
      openFirstAvailableAgreementChat();
    } else if (target === "creadores" && user.role === "creador") {
      switchFeedTab("creators-view");
    } else if (target === "relatos") {
      switchFeedTab("stories-view");
    }
  });

  function handleLikeAction(kind, postId) {
    const user = getCurrentUser();
    if (!user) return;
    togglePostLike(kind, postId, user.id);
    refreshAfterPostMutation();
  }

  /**
   * Al pulsar Compartir en una tarjeta:
   * - Si aún no la ha compartido: la registra 1 sola vez en su perfil y sube 1 vez el contador.
   * - Si ya la había compartido: NO suma otro compartido; abre el modal estilo Facebook para elegir destino/persona.
   */
  function handleShareAction(kind, postId) {
    const user = getCurrentUser();
    if (!user) return;
    const { post } = findPostRecord(kind, postId);
    if (!post) return;

    if (!hasUserSharedPost(post, user.id)) {
      sharePostRecord(kind, postId, user, { visibility: "Público" });
      refreshAfterPostMutation();
    }
    openShareModal(kind, postId);
  }

  function buildPostSocialBlock(kind, post) {
    const user = getCurrentUser();
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const sharedBy = Array.from(new Set(Array.isArray(post.sharedBy) ? post.sharedBy : []));
    const sharesCount = sharedBy.length;
    const comments = Array.isArray(post.comments) ? post.comments : [];

    const isLiked = Boolean(user && likes.includes(user.id));
    const isShared = Boolean(user && sharedBy.includes(user.id));

    const statsRow = document.createElement("div");
    statsRow.className = "post-social-stats-row";

    const leftStats = document.createElement("span");
    leftStats.className = "post-social-stat-group";
    leftStats.textContent = `${likes.length} ${likes.length === 1 ? "me gusta" : "me gusta"}`;

    const rightStats = document.createElement("span");
    rightStats.className = "post-social-stat-group";
    rightStats.textContent = `${comments.length} ${comments.length === 1 ? "comentario" : "comentarios"} · ${sharesCount} ${sharesCount === 1 ? "compartido" : "compartidos"}`;

    statsRow.append(leftStats, rightStats);

    const actionsBar = document.createElement("div");
    actionsBar.className = "post-social-actions-bar";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = `post-social-btn ${isLiked ? "is-liked" : ""}`;
    setButtonContent(likeBtn, "star", isLiked ? "Te gusta" : "Me gusta");
    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleLikeAction(kind, post.id);
    });

    const commentBtn = document.createElement("button");
    commentBtn.type = "button";
    commentBtn.className = "post-social-btn";
    setButtonContent(
      commentBtn,
      "chat",
      comments.length > 0 ? `Comentar (${comments.length})` : "Comentar"
    );
    commentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openPostDetailModal(kind, post.id);
    });

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = `post-social-btn ${isShared ? "is-shared" : ""}`;
    setButtonContent(
      shareBtn,
      "megaphone",
      isShared ? `Compartido (${sharesCount})` : sharesCount > 0 ? `Compartir (${sharesCount})` : "Compartir"
    );
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleShareAction(kind, post.id);
    });

    actionsBar.append(likeBtn, commentBtn, shareBtn);

    const frag = document.createDocumentFragment();
    frag.append(statsRow, actionsBar);
    return frag;
  }

  function clearCommentAttachment() {
    draftCommentMedia = { image: "", video: "", name: "" };
    if (postCommentFileInput) postCommentFileInput.value = "";
    if (postCommentAttachmentPreview) {
      postCommentAttachmentPreview.innerHTML = "";
      postCommentAttachmentPreview.classList.remove("has-file");
    }
  }

  function syncCommentAttachmentPreview() {
    if (!postCommentAttachmentPreview) return;
    postCommentAttachmentPreview.innerHTML = "";
    if (!draftCommentMedia.image && !draftCommentMedia.video) {
      postCommentAttachmentPreview.classList.remove("has-file");
      return;
    }

    if (isDataImage(draftCommentMedia.image)) {
      const img = document.createElement("img");
      img.src = draftCommentMedia.image;
      img.alt = draftCommentMedia.name || "Imagen adjunta";
      postCommentAttachmentPreview.appendChild(img);
    } else if (isDataVideo(draftCommentMedia.video)) {
      const vid = document.createElement("video");
      vid.src = draftCommentMedia.video;
      vid.controls = true;
      vid.preload = "metadata";
      postCommentAttachmentPreview.appendChild(vid);
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "post-comment-attachment-name";
    nameSpan.textContent = draftCommentMedia.name || "Archivo adjunto";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "post-comment-remove-file";
    removeBtn.textContent = "Quitar";
    removeBtn.addEventListener("click", clearCommentAttachment);

    postCommentAttachmentPreview.append(nameSpan, removeBtn);
    postCommentAttachmentPreview.classList.add("has-file");
  }

  postCommentClipBtn?.addEventListener("click", () => postCommentFileInput?.click());

  postCommentFileInput?.addEventListener("change", async () => {
    const file = postCommentFileInput.files?.[0];
    if (!file) return;
    if (file.size > LIMITS.maxStoryMediaBytes) {
      postCommentFileInput.value = "";
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    draftCommentMedia = {
      image: isDataImage(dataUrl) ? dataUrl : "",
      video: isDataVideo(dataUrl) ? dataUrl : "",
      name: file.name || "adjunto"
    };
    syncCommentAttachmentPreview();
  });

  function renderPostDetailModal(kind, postId) {
    if (!postDetailBody) return;
    const { post } = findPostRecord(kind, postId);
    if (!post) return;

    const isCreator = kind === "creator";
    const authorName = isCreator ? post.channel || "Creador" : post.author || "Narrador";
    if (postDetailTitle) postDetailTitle.textContent = `Publicación de ${authorName}`;

    postDetailBody.innerHTML = "";

    const postBox = document.createElement("div");
    postBox.className = "post-detail-post-box";

    const heading = document.createElement("h4");
    heading.style.margin = "0 0 0.35rem 0";
    heading.textContent = isCreator
      ? `${post.type || "Publicación de creador"} · ${authorName}`
      : post.title || "Relato";

    const meta = document.createElement("div");
    meta.className = "story-meta";
    meta.textContent = isCreator
      ? `${authorName} · ${post.network || ""}`
      : `Por ${authorName} · ${post.category || ""}`;

    const textEl = document.createElement("p");
    textEl.style.margin = "0.55rem 0 0 0";
    textEl.textContent = isCreator ? post.message || "" : post.content || "";

    postBox.append(heading, meta, textEl);

    if (isDataImage(post.image) || isDataVideo(post.video)) {
      const mediaWrap = document.createElement("div");
      mediaWrap.className = "story-media-wrap";
      if (isDataImage(post.image)) {
        const img = document.createElement("img");
        img.src = post.image;
        img.alt = heading.textContent;
        img.className = "story-media-img";
        mediaWrap.appendChild(img);
      }
      if (isDataVideo(post.video)) {
        const vid = document.createElement("video");
        vid.src = post.video;
        vid.controls = true;
        vid.preload = "metadata";
        vid.className = "story-media-video";
        mediaWrap.appendChild(vid);
      }
      postBox.appendChild(mediaWrap);
    }

    postBox.appendChild(buildPostSocialBlock(kind, post));
    postDetailBody.appendChild(postBox);

    const commentsSec = document.createElement("div");
    commentsSec.className = "post-detail-comments-section";

    const comments = Array.isArray(post.comments) ? post.comments : [];
    const commentsTitle = document.createElement("h4");
    commentsTitle.className = "post-detail-comments-title";
    commentsTitle.textContent = `Comentarios públicos (${comments.length})`;
    commentsSec.appendChild(commentsTitle);

    if (comments.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "color:#9aa2b8;font-size:0.86rem;margin:0;";
      empty.textContent = "Aún no hay comentarios. ¡Escribe el primero o adjunta una imagen o video!";
      commentsSec.appendChild(empty);
    } else {
      comments.forEach((c) => {
        const item = document.createElement("div");
        item.className = "post-comment-item";

        const cAvatar = lookupAvatarForEntry({
          authorId: c.authorId || "",
          name: c.authorName || "",
          fallbackAvatar: c.authorAvatar || ""
        });
        item.appendChild(buildAvatarElement(c.authorName || "U", cAvatar, "mini-avatar"));

        const cBody = document.createElement("div");
        cBody.className = "post-comment-body";

        const cHead = document.createElement("div");
        cHead.className = "post-comment-head";

        const cAuthor = document.createElement("span");
        cAuthor.className = "post-comment-author";
        cAuthor.textContent = c.authorName || "Usuario";

        const cTime = document.createElement("span");
        cTime.className = "post-comment-time";
        cTime.textContent = c.time || "";

        cHead.append(cAuthor, cTime);
        cBody.appendChild(cHead);

        if (c.text) {
          const cText = document.createElement("p");
          cText.className = "post-comment-text";
          cText.textContent = c.text;
          cBody.appendChild(cText);
        }

        if (isDataImage(c.image)) {
          const cImg = document.createElement("img");
          cImg.src = c.image;
          cImg.alt = `Adjunto de ${c.authorName || "usuario"}`;
          cImg.className = "post-comment-media";
          cBody.appendChild(cImg);
        }

        if (isDataVideo(c.video)) {
          const cVid = document.createElement("video");
          cVid.src = c.video;
          cVid.controls = true;
          cVid.preload = "metadata";
          cVid.className = "post-comment-media";
          cBody.appendChild(cVid);
        }

        item.appendChild(cBody);
        commentsSec.appendChild(item);
      });
    }

    postDetailBody.appendChild(commentsSec);
    postDetailBody.scrollTop = postDetailBody.scrollHeight;
  }

  function openPostDetailModal(kind, postId) {
    const { post } = findPostRecord(kind, postId);
    if (!post) return;
    activePostModalRef = { kind, id: postId };
    clearCommentAttachment();
    if (postCommentInput) {
      const me = getCurrentUser();
      postCommentInput.placeholder = me
        ? `Comentar como ${me.username}...`
        : "Escribe un comentario...";
      postCommentInput.value = "";
    }
    renderPostDetailModal(kind, postId);
    postDetailModal?.classList.add("is-open");
    postDetailModal?.setAttribute("aria-hidden", "false");
    setTimeout(() => postCommentInput?.focus(), 100);
  }

  function closePostDetailModal() {
    activePostModalRef = null;
    clearCommentAttachment();
    postDetailModal?.classList.remove("is-open");
    postDetailModal?.setAttribute("aria-hidden", "true");
  }

  closePostDetailBtn?.addEventListener("click", closePostDetailModal);
  postDetailModal?.addEventListener("click", (e) => {
    if (e.target === postDetailModal) closePostDetailModal();
  });

  postCommentForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!activePostModalRef || !user) return;

    const added = addPublicPostComment(activePostModalRef.kind, activePostModalRef.id, user, {
      text: postCommentInput?.value || "",
      image: draftCommentMedia.image,
      video: draftCommentMedia.video
    });
    if (!added) return;

    if (postCommentInput) postCommentInput.value = "";
    clearCommentAttachment();
    refreshAfterPostMutation();
  });

  tabButtons.forEach((btn) => btn.addEventListener("click", () => switchFeedTab(btn.dataset.tab)));
  railButtons.forEach((btn) =>
    btn.addEventListener("click", () => switchFeedTab(btn.dataset.railTab))
  );

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
        `El creador ${user.username} pidió permiso para relatar "${target.title}".`,
        "",
        "mic"
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
        `${currentUser.username} marcó como ${newStatus} tu solicitud para "${target.title}".`,
        "",
        "pin"
      );
    }
    renderStories();
  }

  // --- ACUERDOS Y CHAT ---
  function hasAcceptedAgreement(story, requestObj, currentUser) {
    if (!currentUser || !story || !requestObj || requestObj.status !== "Aceptada") return false;
    return story.authorId === currentUser.id || requestObj.creatorId === currentUser.id;
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
      setButtonContent(openBtn, "chat", `(${item.messagesCount})`);
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
      if (sharePostModal?.classList.contains("is-open")) closeShareModal();
      if (postDetailModal?.classList.contains("is-open")) closePostDetailModal();
    }
  });

  function renderChatMessages() {
    if (!chatMessagesEl) return;
    chatMessagesEl.innerHTML = "";
    if (!activeChatContext) return;

    const currentUser = getCurrentUser();
    const story = loadData(STORAGE_KEYS.stories, []).find(
      (s) => s.id === activeChatContext.storyId
    );
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

    const result = appendAgreementMessage(
      activeChatContext.storyId,
      activeChatContext.requestId,
      currentUser,
      chatInput?.value || ""
    );
    if (!result) return;

    if (chatInput) chatInput.value = "";
    renderChatMessages();
    renderNotifications();
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
      topRow.append(
        titleEl,
        buildFollowButton(targetKey, story.author, story.authorId || null, isOwner)
      );

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
        badge.append(
          iconEl("lock", "umbral-icon--sm"),
          document.createTextNode(" Solo lectura en la app")
        );
        card.appendChild(badge);
      } else if (isOwner) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.append(
          iconEl("mic", "umbral-icon--sm"),
          document.createTextNode(" Abierto a solicitudes de creadores")
        );
        card.appendChild(badge);
      } else if (currentUser?.role === "creador") {
        if (requests.some((r) => r.creatorId === currentUser.id)) {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.append(
            iconEl("check", "umbral-icon--sm"),
            document.createTextNode(" Ya enviaste solicitud para este relato")
          );
          card.appendChild(badge);
        } else {
          const reqBtn = document.createElement("button");
          reqBtn.type = "button";
          setButtonContent(reqBtn, "mic", "Pedir permiso para relatar");
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
          info.appendChild(
            document.createTextNode(`${r.creator}${r.platform ? ` (${r.platform})` : ""} `)
          );

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
            setButtonContent(acceptBtn, "check", "Aceptar");
            acceptBtn.addEventListener("click", () => updateRequestStatus(story.id, index, "Aceptada"));

            const rejectBtn = document.createElement("button");
            rejectBtn.type = "button";
            rejectBtn.className = "btn-mini btn-reject";
            setButtonContent(rejectBtn, "close", "Rechazar");
            rejectBtn.addEventListener("click", () =>
              updateRequestStatus(story.id, index, "Rechazada")
            );

            actions.append(acceptBtn, rejectBtn);
          }

          if (hasAcceptedAgreement(story, r, currentUser)) {
            const chatBtn = document.createElement("button");
            chatBtn.type = "button";
            chatBtn.className = "btn-chat";
            const count = (r.messages || []).length;
            setButtonContent(chatBtn, "chat", count > 0 ? `Chat (${count})` : "Chat");
            chatBtn.addEventListener("click", () => openChatModal(story.id, r.id));
            actions.appendChild(chatBtn);
          }

          if (actions.children.length > 0) row.appendChild(actions);
          reqBox.appendChild(row);
        });

        card.appendChild(reqBox);
      }

      card.appendChild(buildPostSocialBlock("story", story));
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

      card.append(topRow, titleEl, metaEl, messageEl, buildPostSocialBlock("creator", post));
      creatorPostsList.appendChild(card);
    });

    lastCreatedPostId = null;
  }

  function triggerPublishFeedback(
    button,
    drawer,
    triggerBtn,
    defaultIcon,
    defaultLabel,
    afterCallback
  ) {
    setButtonContent(button, "check", "Publicado");
    button?.classList.add("is-published");

    afterCallback();

    setTimeout(() => {
      setDrawerState(drawer, triggerBtn, false);
      setButtonContent(button, defaultIcon, defaultLabel);
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
      requests: [],
      likes: [],
      sharedBy: [],
      shareMeta: {},
      sharesCount: 0,
      comments: []
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
    triggerPublishFeedback(
      publishBtn,
      composerDrawer,
      toggleComposerBtn,
      "flame",
      "Publicar relato",
      () => {
        draftStoryImage = "";
        draftStoryVideo = "";
        if (storyImageFileInput) storyImageFileInput.value = "";
        if (storyVideoFileInput) storyVideoFileInput.value = "";
        syncDraftMediaPreview();
        renderStories();
        form.reset();
        syncSessionUI();
      }
    );
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
      message,
      likes: [],
      sharedBy: [],
      shareMeta: {},
      sharesCount: 0,
      comments: []
    };

    const posts = loadData(STORAGE_KEYS.creatorPosts, []);
    posts.unshift(newPost);
    saveData(STORAGE_KEYS.creatorPosts, posts);

    lastCreatedPostId = newPost.id;
    triggerPublishFeedback(
      publishCreatorBtn,
      creatorDrawer,
      toggleCreatorComposerBtn,
      "megaphone",
      "Publicar en espacio de creadores",
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

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const postParam = params.get("post");
    if (tabParam === "creators-view" && initialSession.role === "creador") {
      switchFeedTab("creators-view");
    }
    if (postParam) {
      const targetKind = tabParam === "creators-view" ? "creator" : "story";
      openPostDetailModal(targetKind, postParam);
    }
  }
}