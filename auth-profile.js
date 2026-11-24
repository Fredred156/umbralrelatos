// --- AUTENTICACIÓN Y PERFIL (auth-profile.js) ---

// --- LOGIN ---
const loginPageForm = byId("login-page-form");
if (loginPageForm) {
  if (getCurrentUser()) navigateWithTransition("index.html", "Entrando al muro...");

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
    navigateWithTransition("index.html", "Entrando al muro...");
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
    navigateWithTransition("index.html", "Entrando al muro...");
  });
}

// --- EDITAR PERFIL ---
const editProfileForm = byId("edit-profile-form");
if (editProfileForm) {
  const user = getCurrentUser();
  if (!user) {
    navigateWithTransition("login.html");
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
        allowPublicFollowLists: isPublicFollowListsEnabled(user)
      };

      syncUserAcrossStorage(updatedUser);
      updateUserReferencesInPosts(user.id, newUsername, newAvatar, newChannel);
      navigateWithTransition("perfil.html", "Guardando perfil...");
    });
  }
}

// --- PERFIL ---
const profilePageRoot = byId("profile-page-root");
if (profilePageRoot) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    navigateWithTransition("login.html");
  } else {
    const lightbox = ensureMediaLightbox();
    byId("logout-btn")?.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.session);
      navigateWithTransition("login.html");
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
      allowPublicFollowLists: isPublicFollowListsEnabled(matchedUser)
    };

    let activeListTab = null;
    let creatorSearchTerm = "";
    let notifMode = "all";
    let activeProfileChatContext = null;
    let activeOpenCreatorTile = null;

    const container = byId("profile-card-container");

    const chatBtn = byId("prf-chat-btn");
    const chatPopover = byId("prf-chat-popover");
    const chatListEl = byId("prf-chat-list");
    const chatBadgeEl = byId("prf-chat-badge");

    const bellBtn = byId("prf-bell-btn");
    const notifPopover = byId("prf-notif-popover");
    const notifBadgeEl = byId("prf-notif-badge");
    const notifListEl = byId("prf-notifications-list");
    const markReadBtn = byId("prf-mark-read-btn");
    const filterAllBtn = byId("prf-notif-all");
    const filterUnreadBtn = byId("prf-notif-unread");

    const settingsBtn = byId("prf-settings-btn");
    const settingsPopover = byId("prf-settings-popover");
    const toggleFollowBtn = byId("prf-toggle-follow-list");
    const followListPill = byId("prf-follow-list-pill");
    const toggleCreatorsRailBtn = byId("prf-toggle-creators-rail");
    const creatorsRailPill = byId("prf-creators-rail-pill");
    const goEditBtn = byId("prf-go-edit-profile");
    const clearReadBtn = byId("prf-clear-read-notifs");

    const prfChatModal = byId("prf-chat-modal");
    const prfChatTitle = byId("prf-chat-modal-title");
    const prfChatSubtitle = byId("prf-chat-subtitle");
    const prfChatMessages = byId("prf-chat-messages");
    const prfChatForm = byId("prf-chat-form");
    const prfChatInput = byId("prf-chat-input");
    const prfCloseChatBtn = byId("prf-close-chat-btn");

    const topPopovers = [
      { btn: chatBtn, panel: chatPopover },
      { btn: bellBtn, panel: notifPopover },
      { btn: settingsBtn, panel: settingsPopover }
    ];

    const closeAllTopPopovers = () => {
      topPopovers.forEach(({ btn, panel }) => {
        panel?.classList.remove("is-open");
        btn?.setAttribute("aria-expanded", "false");
      });
    };

    const closeCreatorPopovers = (exceptTile = null) => {
      profilePageRoot.querySelectorAll(".creator-avatar-tile.is-popover-open").forEach((tile) => {
        if (tile !== exceptTile) {
          clearTimeout(tile._closeTimer);
          tile.classList.remove("is-popover-open");
        }
      });
      if (!exceptTile) activeOpenCreatorTile = null;
    };

    const syncCreatorsRailVisibility = () => {
      const prefs = loadData(STORAGE_KEYS.prefs, { showCreatorsRail: true });
      const visible = prefs.showCreatorsRail !== false;
      const hasBox = Boolean(profilePageRoot.querySelector(".narrator-creators-floating-box"));
      document.body.classList.toggle("prf-hide-creators-rail", !visible);
      profilePageRoot.classList.toggle("has-creators-rail", hasBox && visible);
      if (creatorsRailPill) creatorsRailPill.textContent = visible ? "Visible" : "Oculto";
    };

    const syncFollowListPill = () => {
      if (!followListPill) return;
      const sessionNow = getCurrentUser() || currentUser;
      const found =
        loadData(STORAGE_KEYS.users, []).find((u) => u.id === sessionNow.id) || sessionNow;
      const isPublic = isPublicFollowListsEnabled(found);
      if (isOwnProfile) profileData.allowPublicFollowLists = isPublic;
      followListPill.textContent = isPublic ? "Activa" : "Privada";
    };

    const findAcceptedAgreementContext = (storyId, requestId) => {
      const me = getCurrentUser();
      if (!me) return null;
      const story = loadData(STORAGE_KEYS.stories, []).find((s) => s.id === storyId);
      const req = story?.requests?.find((r) => r.id === requestId);
      if (!story || !req || req.status !== "Aceptada") return null;
      if (story.authorId !== me.id && req.creatorId !== me.id) return null;
      return { me, story, req };
    };

    const renderProfileChatMessages = () => {
      if (!prfChatMessages) return;
      prfChatMessages.innerHTML = "";
      if (!activeProfileChatContext) return;

      const ctx = findAcceptedAgreementContext(
        activeProfileChatContext.storyId,
        activeProfileChatContext.requestId
      );
      if (!ctx) return;

      const msgs = Array.isArray(ctx.req.messages) ? ctx.req.messages : [];
      if (msgs.length === 0) {
        const empty = document.createElement("p");
        empty.style.cssText = "color:#9aa2b8;font-size:0.85rem;";
        empty.textContent = "Acuerdo confirmado. Coordina aquí los detalles del relato.";
        prfChatMessages.appendChild(empty);
        return;
      }

      msgs.forEach((m) => {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${ctx.me && m.senderId === ctx.me.id ? "is-mine" : ""}`;

        const sender = document.createElement("div");
        sender.className = "chat-sender";
        sender.textContent = `${m.senderName} (${m.senderRole}) · ${m.time}`;

        const text = document.createElement("div");
        text.textContent = m.text;

        bubble.append(sender, text);
        prfChatMessages.appendChild(bubble);
      });
      prfChatMessages.scrollTop = prfChatMessages.scrollHeight;
    };

    const openProfileChatModal = (storyId, requestId) => {
      const ctx = findAcceptedAgreementContext(storyId, requestId);
      if (!ctx) return;

      activeProfileChatContext = { storyId, requestId };
      const peerName = ctx.story.authorId === ctx.me.id ? ctx.req.creator : ctx.story.author;
      if (prfChatTitle) prfChatTitle.textContent = `Chat con ${peerName}`;
      if (prfChatSubtitle) {
        prfChatSubtitle.textContent = `Acuerdo aceptado · "${ctx.story.title}" · Autor: ${ctx.story.author} · Creador: ${ctx.req.creator}`;
      }
      prfChatForm?.reset();
      renderProfileChatMessages();
      prfChatModal?.classList.add("is-open");
      prfChatModal?.setAttribute("aria-hidden", "false");
      setTimeout(() => prfChatInput?.focus(), 100);
    };

    const closeProfileChatModal = () => {
      activeProfileChatContext = null;
      prfChatModal?.classList.remove("is-open");
      prfChatModal?.setAttribute("aria-hidden", "true");
    };

    prfCloseChatBtn?.addEventListener("click", closeProfileChatModal);
    prfChatModal?.addEventListener("click", (e) => {
      if (e.target === prfChatModal) closeProfileChatModal();
    });

    prfChatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const me = getCurrentUser();
      if (!activeProfileChatContext || !me) return;
      const result = appendAgreementMessage(
        activeProfileChatContext.storyId,
        activeProfileChatContext.requestId,
        me,
        prfChatInput?.value || ""
      );
      if (!result) return;
      if (prfChatInput) prfChatInput.value = "";
      renderProfileChatMessages();
      renderProfileChatDropdown();
      renderProfileNotifications();
    });

    const renderProfileChatDropdown = () => {
      if (!chatListEl) return;
      const me = getCurrentUser();
      const agreements = getAcceptedAgreementsForUser(me);

      if (chatBadgeEl) {
        chatBadgeEl.textContent = String(agreements.length);
        chatBadgeEl.classList.toggle("is-hidden", agreements.length === 0);
      }

      chatListEl.innerHTML = "";
      if (agreements.length === 0) {
        const empty = document.createElement("p");
        empty.className = "prf-chat-empty";
        empty.textContent =
          me?.role === "creador"
            ? "Aún no tienes acuerdos aceptados con narradores."
            : "Aún no tienes acuerdos aceptados con creadores.";
        chatListEl.appendChild(empty);
        return;
      }

      agreements.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "prf-chat-item";

        const main = document.createElement("div");
        main.className = "prf-chat-item-main";

        const nameSpan = document.createElement("span");
        nameSpan.className = "prf-chat-item-name";
        nameSpan.textContent = item.peerName;

        const storySpan = document.createElement("span");
        storySpan.className = "prf-chat-item-story";
        storySpan.textContent = item.storyTitle;

        main.append(nameSpan, storySpan);

        const pill = document.createElement("span");
        pill.className = "prf-pill";
        pill.textContent = item.messagesCount > 0 ? `${item.messagesCount} msg` : "Abrir";

        btn.append(main, pill);
        btn.addEventListener("click", () => {
          closeAllTopPopovers();
          openProfileChatModal(item.storyId, item.requestId);
        });

        chatListEl.appendChild(btn);
      });
    };

    const renderProfileNotifications = () => {
      if (!notifListEl || !notifBadgeEl) return;
      const me = getCurrentUser();
      const mine = me ? loadData(STORAGE_KEYS.notifs, []).filter((n) => n.recipientId === me.id) : [];
      const unread = mine.filter((n) => !n.read);

      if (unread.length > 0) {
        notifBadgeEl.textContent = String(unread.length);
        notifBadgeEl.classList.remove("is-hidden");
      } else {
        notifBadgeEl.classList.add("is-hidden");
      }

      const visibleNotifs = notifMode === "unread" ? unread : mine;
      notifListEl.innerHTML = "";

      if (visibleNotifs.length === 0) {
        const p = document.createElement("p");
        p.style.cssText = "color:#9aa2b8;font-size:0.85rem;margin:0;";
        p.textContent =
          notifMode === "unread"
            ? "No tienes notificaciones sin leer."
            : "No tienes notificaciones todavía.";
        notifListEl.appendChild(p);
        return;
      }

      visibleNotifs.forEach((n) => {
        const item = document.createElement("div");
        item.className = `notif-item ${n.read ? "" : "is-unread"}`;
        item.textContent = n.text;
        if (n.preview) {
          const quote = document.createElement("div");
          quote.className = "notif-quote";
          quote.textContent = `“${n.preview}”`;
          item.appendChild(quote);
        }
        const time = document.createElement("span");
        time.className = "notif-time";
        time.textContent = `${n.createdAt || ""} · ${n.read ? "Leída" : "Nueva"}`;
        item.appendChild(time);
        notifListEl.appendChild(item);
      });
    };

    const bindTopPopover = (btn, panel, onBeforeOpen) => {
      btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !panel?.classList.contains("is-open");
        closeAllTopPopovers();
        if (willOpen) {
          onBeforeOpen?.();
          panel?.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    };

    bindTopPopover(chatBtn, chatPopover, renderProfileChatDropdown);
    bindTopPopover(bellBtn, notifPopover, renderProfileNotifications);
    bindTopPopover(settingsBtn, settingsPopover, () => {
      syncFollowListPill();
      syncCreatorsRailVisibility();
    });

    filterAllBtn?.addEventListener("click", () => {
      notifMode = "all";
      filterAllBtn.classList.add("is-active");
      filterUnreadBtn?.classList.remove("is-active");
      renderProfileNotifications();
    });

    filterUnreadBtn?.addEventListener("click", () => {
      notifMode = "unread";
      filterUnreadBtn.classList.add("is-active");
      filterAllBtn?.classList.remove("is-active");
      renderProfileNotifications();
    });

    markReadBtn?.addEventListener("click", () => {
      const me = getCurrentUser();
      if (!me) return;
      saveData(
        STORAGE_KEYS.notifs,
        loadData(STORAGE_KEYS.notifs, []).map((n) =>
          n.recipientId === me.id ? { ...n, read: true } : n
        )
      );
      renderProfileNotifications();
    });

    clearReadBtn?.addEventListener("click", () => {
      const me = getCurrentUser();
      if (!me) return;
      saveData(
        STORAGE_KEYS.notifs,
        loadData(STORAGE_KEYS.notifs, []).filter((n) => !(n.recipientId === me.id && n.read))
      );
      renderProfileNotifications();
    });

    toggleFollowBtn?.addEventListener("click", () => {
      const me = getCurrentUser();
      if (!me) return;
      const usersNow = loadData(STORAGE_KEYS.users, []);
      const found = usersNow.find((u) => u.id === me.id) || me;
      const nextVal = !isPublicFollowListsEnabled(found);

      const updatedSession = { ...me, allowPublicFollowLists: nextVal };
      syncUserAcrossStorage(updatedSession);
      if (isOwnProfile) profileData.allowPublicFollowLists = nextVal;
      syncFollowListPill();
      renderProfileView();
    });

    toggleCreatorsRailBtn?.addEventListener("click", () => {
      const prefs = loadData(STORAGE_KEYS.prefs, { showCreatorsRail: true });
      saveData(STORAGE_KEYS.prefs, { ...prefs, showCreatorsRail: !(prefs.showCreatorsRail !== false) });
      syncCreatorsRailVisibility();
      renderProfileView();
    });

    goEditBtn?.addEventListener("click", () => {
      navigateWithTransition("editar-perfil.html", "Abriendo editor de perfil...");
    });

    document.addEventListener("click", (e) => {
      const insideTop = topPopovers.some(
        ({ btn, panel }) => panel?.contains(e.target) || btn?.contains(e.target)
      );
      if (!insideTop) closeAllTopPopovers();
      if (!e.target.closest?.(".creator-avatar-tile")) closeCreatorPopovers();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllTopPopovers();
        closeCreatorPopovers();
        if (prfChatModal?.classList.contains("is-open")) closeProfileChatModal();
      }
    });

    const collectAvailableCreators = () => {
      const map = new Map();
      const latestUsers = loadData(STORAGE_KEYS.users, []);
      const latestPosts = loadData(STORAGE_KEYS.creatorPosts, []);

      latestUsers.forEach((u) => {
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

      latestPosts.forEach((p) => {
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

      const openThisPopover = () => {
        clearTimeout(tile._closeTimer);
        closeCreatorPopovers(tile);
        activeOpenCreatorTile = tile;
        tile.classList.add("is-popover-open");
      };

      const scheduleClosePopover = (delayMs = 260) => {
        clearTimeout(tile._closeTimer);
        tile._closeTimer = setTimeout(() => {
          if (tile.contains(document.activeElement)) return;
          tile.classList.remove("is-popover-open");
          if (activeOpenCreatorTile === tile) activeOpenCreatorTile = null;
        }, delayMs);
      };

      const avatarEl = buildAvatarElement(creator.username, creator.avatar, "creator-tile-avatar", {
        onClick: () => {
          if (tile.classList.contains("is-popover-open")) {
            navigateWithTransition(
              getProfileUrlForTarget(creator.id, creator.username),
              `Abriendo perfil de ${creator.username}...`
            );
          } else {
            openThisPopover();
          }
        }
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
      statsEl.append(
        iconEl("users", "umbral-icon--sm"),
        document.createTextNode(
          ` ${followersCount} ${followersCount === 1 ? "seguidor" : "seguidores"}`
        )
      );

      const descEl = document.createElement("p");
      descEl.className = "creator-popover-desc";
      descEl.textContent = creator.shortDesc || "Creador de contenido en Umbral.";

      const actionsEl = document.createElement("div");
      actionsEl.className = "creator-popover-actions";

      const profileLink = document.createElement("a");
      profileLink.href = getProfileUrlForTarget(creator.id, creator.username);
      profileLink.className = "creator-popover-link";
      profileLink.textContent = "Ver perfil";
      profileLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateWithTransition(
          getProfileUrlForTarget(creator.id, creator.username),
          `Abriendo perfil de ${creator.username}...`
        );
      });

      actionsEl.appendChild(profileLink);

      const meNow = getCurrentUser() || currentUser;
      if (creator.id !== meNow.id && !isUserBlocked(creator.id)) {
        const iFollow = follows.some(
          (f) => f.followerId === meNow.id && f.targetKey === creator.id
        );
        const followBtn = document.createElement("button");
        followBtn.type = "button";
        followBtn.className = `btn-follow ${iFollow ? "is-following" : ""}`;
        setButtonContent(followBtn, iFollow ? "check" : "star", iFollow ? "Siguiendo" : "Seguir");
        followBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFollowRecord(creator.id, creator.username);
          renderProfileView();
        });
        actionsEl.appendChild(followBtn);
      }

      popover.append(topLine, statsEl, descEl, actionsEl);
      tile.append(avatarEl, popover);

      tile.addEventListener("pointerenter", openThisPopover);
      tile.addEventListener("pointerleave", () => scheduleClosePopover(280));
      tile.addEventListener("focusin", openThisPopover);
      tile.addEventListener("focusout", () => scheduleClosePopover(220));
      popover.addEventListener("pointerenter", () => clearTimeout(tile._closeTimer));

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
              return fromDir || (resolved.role === "creador" ? resolved : null);
            })
            .filter(Boolean)
        : [];

      const favTitleRow = document.createElement("div");
      favTitleRow.className = "narrator-box-header";
      favTitleRow.innerHTML = `<span>${iconHtml("star", "umbral-icon--sm umbral-icon--accent")} Favoritos</span><small>${favoriteCreators.length}</small>`;
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
        discTitleRow.innerHTML = `<span>${iconHtml("film", "umbral-icon--sm")} Creadores</span><small>${allCreators.length}</small>`;
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

    const buildSavedPostSection = (sectionTitle, iconName, items, emptyText, isSharedList = false) => {
      const sec = document.createElement("div");
      sec.className = "profile-wall-section";

      const head = document.createElement("div");
      head.className = "profile-wall-header";

      const h3 = document.createElement("h3");
      h3.style.cssText = "font-size:1.02rem;display:inline-flex;align-items:center;gap:0.35rem;margin:0;";
      h3.append(iconEl(iconName, "umbral-icon--sm"), document.createTextNode(sectionTitle));

      const countBadge = document.createElement("span");
      countBadge.className = "badge";
      countBadge.textContent = `${items.length}`;

      head.append(h3, countBadge);
      sec.appendChild(head);

      if (items.length === 0) {
        const empty = document.createElement("p");
        empty.style.cssText = "color:#9aa2b8;font-size:0.88rem;";
        empty.textContent = emptyText;
        sec.appendChild(empty);
        return sec;
      }

      items.forEach((entry) => {
        const card = document.createElement("article");
        card.className = "story-card";

        const isCreatorPost = entry._kind === "creator";
        const heading = document.createElement("h4");
        heading.textContent = isCreatorPost
          ? `${entry.type || "Publicación de creador"} · ${entry.channel || "Creador"}`
          : entry.title || "Relato";

        const meta = document.createElement("div");
        meta.className = "story-meta";
        meta.textContent = isCreatorPost
          ? `Creador: ${entry.channel || "Creador"} · ${entry.network || ""}`
          : `Por ${entry.author || "Narrador"} · ${entry.category || ""}`;

        const body = document.createElement("p");
        body.textContent = isCreatorPost ? entry.message || "" : entry.content || "";

        card.append(heading, meta, body);

        if (isSharedList && entry.shareMeta?.[profileData.id]?.note) {
          const noteEl = document.createElement("p");
          noteEl.style.cssText = "color:#c4b5fd;font-size:0.85rem;margin-top:0.4rem;";
          noteEl.textContent = `Nota al compartir (${entry.shareMeta[profileData.id].visibility || "Público"}): “${entry.shareMeta[profileData.id].note}”`;
          card.appendChild(noteEl);
        }

        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "btn-mini";
        openBtn.style.marginTop = "0.5rem";
        openBtn.textContent = "Ver en el muro";
        openBtn.addEventListener("click", () => {
          const tabParam = isCreatorPost ? "creators-view" : "stories-view";
          navigateWithTransition(
            `index.html?tab=${encodeURIComponent(tabParam)}&post=${encodeURIComponent(entry.id)}`,
            "Abriendo publicación en el muro..."
          );
        });

        card.appendChild(openBtn);
        sec.appendChild(card);
      });

      return sec;
    };

    const renderProfileView = () => {
      if (!container) return;
      const activeEl = document.activeElement;
      const wasSearchFocused = activeEl?.classList?.contains("narrator-box-search");
      const prevSearchVal = creatorSearchTerm;

      container.innerHTML = "";
      profilePageRoot.querySelector(".narrator-creators-floating-box")?.remove();

      const meNow = getCurrentUser() || currentUser;
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
        (f) => f.followerId === meNow.id && f.targetKey === profileData.id
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
          ? "Añade un banner desde Editar perfil"
          : "Sin banner de portada";
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
      roleEl.style.cssText =
        "color:#9aa2b8;font-size:0.86rem;display:inline-flex;align-items:center;gap:0.3rem;";
      roleEl.append(
        iconEl(isCreator ? "film" : "quill", "umbral-icon--sm"),
        document.createTextNode(
          isCreator
            ? `Creador${profileData.channel ? ` · ${profileData.channel}` : ""}`
            : "Narrador"
        )
      );

      handleRow.append(handleBadge, roleEl);
      infoWrap.append(nameEl, handleRow);
      avatarGroup.appendChild(infoWrap);
      header.appendChild(avatarGroup);

      if (isOwnProfile) {
        const editLink = document.createElement("a");
        editLink.href = "editar-perfil.html";
        editLink.className = "edit-profile-link";
        editLink.innerHTML = `${iconHtml("edit", "umbral-icon--sm")} <span>Editar perfil</span>`;
        header.appendChild(editLink);
      }

      const actionsRow = document.createElement("div");
      actionsRow.className = "profile-actions-row";

      if (!isOwnProfile) {
        const followBtn = document.createElement("button");
        followBtn.type = "button";
        followBtn.className = `btn-follow ${alreadyFollowing ? "is-following" : ""}`;
        followBtn.disabled = blocked;
        setButtonContent(
          followBtn,
          blocked ? "ban" : alreadyFollowing ? "check" : "star",
          blocked
            ? `Usuario bloqueado · ${followerRecords.length}`
            : `${alreadyFollowing ? "Siguiendo" : "Seguir"} · ${followerRecords.length}`
        );
        followBtn.addEventListener("click", () => {
          if (blocked) return;
          toggleFollowRecord(profileData.id, profileData.username);
          renderProfileView();
        });

        const blockBtn = document.createElement("button");
        blockBtn.type = "button";
        blockBtn.className = `btn-block-user ${blocked ? "is-blocked" : ""}`;
        setButtonContent(
          blockBtn,
          blocked ? "unlock" : "ban",
          blocked ? "Desbloquear usuario" : "Bloquear usuario"
        );
        blockBtn.addEventListener("click", () => {
          toggleBlockUser(profileData.id, profileData.username);
          renderProfileView();
        });

        actionsRow.append(followBtn, blockBtn);
      }

      const descBox = document.createElement("div");
      descBox.className = "profile-bio-text";

      const shortLine = document.createElement("div");
      shortLine.style.cssText = "display:inline-flex;align-items:center;gap:0.35rem;";
      shortLine.append(
        iconEl("flame", "umbral-icon--sm umbral-icon--accent"),
        document.createTextNode(
          profileData.shortDesc
            ? `Lo que le apasiona: ${profileData.shortDesc}`
            : "Sin descripción corta todavía."
        )
      );
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
      storiesBox.innerHTML = `<div class="stat-number">${userStories.length}</div><div class="stat-label">${iconHtml("scroll", "umbral-icon--sm")} Relatos</div>`;

      const makeStatTab = (tabName, count, iconName, label, title) => {
        const box = document.createElement("div");
        box.className = `stat-box stat-box-interactive ${activeListTab === tabName ? "is-selected" : ""}`;
        box.innerHTML = `<div class="stat-number">${count}</div><div class="stat-label">${iconHtml(iconName, "umbral-icon--sm")} ${label}</div>`;
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
          "users",
          "Seguidores",
          "Ver quiénes siguen este perfil"
        ),
        makeStatTab(
          "following",
          followingRecords.length,
          "star",
          "Siguiendo",
          "Ver a quiénes sigue este perfil"
        )
      );

      const followDrawer = document.createElement("div");
      followDrawer.className = `follow-drawer-panel ${activeListTab ? "is-open" : ""}`;

      if (activeListTab) {
        const canViewList = profileData.allowPublicFollowLists !== false;
        const drawerHeader = document.createElement("div");
        drawerHeader.className = "follow-drawer-header";

        const drawerTitle = document.createElement("h4");
        drawerTitle.style.cssText = "display:inline-flex;align-items:center;gap:0.35rem;margin:0;";
        drawerTitle.append(
          iconEl(activeListTab === "followers" ? "users" : "star", "umbral-icon--sm"),
          document.createTextNode(
            activeListTab === "followers"
              ? `Seguidores de ${profileData.username} (${followerRecords.length})`
              : `Perfiles que sigue ${profileData.username} (${followingRecords.length})`
          )
        );

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

        const listTypeLabel = activeListTab === "followers" ? "seguidores" : "seguidos";
        const subjectLabel =
          profileData.role === "creador"
            ? `Este creador ocultó su lista de ${listTypeLabel}`
            : `El usuario ocultó su lista de ${listTypeLabel}`;

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
              if (member.id !== meNow.id && !isUserBlocked(member.id)) {
                const iFollowBack = currentFollows.some(
                  (f) => f.followerId === meNow.id && f.targetKey === member.id
                );
                actionBtn = document.createElement("button");
                actionBtn.type = "button";
                actionBtn.className = `btn-follow ${iFollowBack ? "is-following" : ""}`;
                setButtonContent(
                  actionBtn,
                  iFollowBack ? "check" : "star",
                  iFollowBack ? "Siguiendo" : "Seguir"
                );
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

        if (!canViewList) {
          const privateStage = document.createElement("div");
          privateStage.className = "follow-private-stage";

          const blurredLayer = document.createElement("div");
          blurredLayer.className = "follow-private-blur-content";
          blurredLayer.appendChild(listItemsWrap);

          const overlay = document.createElement("div");
          overlay.className = "follow-private-overlay";

          const lockBadge = document.createElement("div");
          lockBadge.className = "follow-private-lock";
          lockBadge.appendChild(iconEl("lock", "umbral-icon--sm"));

          const titleText = document.createElement("strong");
          titleText.textContent = subjectLabel;

          const subText = document.createElement("span");
          subText.textContent = "Contenido protegido por privacidad";

          overlay.append(lockBadge, titleText, subText);
          privateStage.append(blurredLayer, overlay);
          followDrawer.appendChild(privateStage);
        } else {
          followDrawer.appendChild(listItemsWrap);
        }
      }

      const wallSection = document.createElement("div");
      wallSection.className = "profile-wall-section";

      const wallHeader = document.createElement("div");
      wallHeader.className = "profile-wall-header";

      const wallTitle = document.createElement("h3");
      wallTitle.style.cssText = "font-size:1.02rem;display:inline-flex;align-items:center;gap:0.35rem;margin:0;";
      wallTitle.append(
        iconEl("scroll", "umbral-icon--sm"),
        document.createTextNode(
          isOwnProfile ? "Mi muro de relatos" : `Muro de relatos de ${profileData.username}`
        )
      );

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
          metaEl.style.display = "inline-flex";
          metaEl.style.alignItems = "center";
          metaEl.style.gap = "0.3rem";
          metaEl.append(
            document.createTextNode(`${story.category} · `),
            iconEl(story.allowCreators ? "mic" : "lock", "umbral-icon--sm"),
            document.createTextNode(
              story.allowCreators ? "Abierto a creadores" : "Solo lectura"
            )
          );

          const contentEl = document.createElement("p");
          contentEl.textContent = story.content;

          card.append(titleEl, metaEl, contentEl);
          wallSection.appendChild(card);
        });
      }

      const likedItems = blocked && !isOwnProfile ? [] : getUserLikedPosts(profileData.id);
      const sharedItems = blocked && !isOwnProfile ? [] : getUserSharedPosts(profileData.id);

      const likedSection = buildSavedPostSection(
        isOwnProfile ? "Publicaciones que te gustan" : `Le gusta a ${profileData.username}`,
        "star",
        likedItems,
        "Aún no hay publicaciones marcadas con me gusta.",
        false
      );

      const sharedSection = buildSavedPostSection(
        isOwnProfile ? "Publicaciones compartidas" : `Compartido por ${profileData.username}`,
        "megaphone",
        sharedItems,
        "Aún no hay publicaciones compartidas.",
        true
      );

      const children = [bannerBox, header];
      if (actionsRow.children.length > 0) children.push(actionsRow);
      children.push(descBox);
      if (isCreator && profileData.socials) {
        const socialEl = document.createElement("div");
        socialEl.className = "profile-socials";
        socialEl.style.display = "inline-flex";
        socialEl.style.alignItems = "center";
        socialEl.style.gap = "0.35rem";
        socialEl.append(
          iconEl("globe", "umbral-icon--sm"),
          document.createTextNode(`Redes: ${profileData.socials}`)
        );
        children.push(socialEl);
      }
      children.push(stats, followDrawer, wallSection, likedSection, sharedSection);
      container.append(...children);

      if (!isCreator) {
        profilePageRoot.appendChild(buildNarratorCreatorsWidget(follows));
      }

      syncFollowListPill();
      syncCreatorsRailVisibility();
      renderProfileChatDropdown();
      renderProfileNotifications();

      if (wasSearchFocused && prevSearchVal) {
        const restored = profilePageRoot.querySelector(".narrator-box-search");
        if (restored) {
          restored.focus();
          restored.setSelectionRange(restored.value.length, restored.value.length);
        }
      }
    };

    renderProfileView();
  }
}