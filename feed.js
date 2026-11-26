// --- MURO PRINCIPAL (feed.js / index.html) ---
const storiesList = byId("stories-list");
if (storiesList) {
  const initialSession = getCurrentUser();
  if (!initialSession) navigateWithTransition("login.html");

  const compactSectionLabel = byId("compact-section-label");
  const compactRoleBadge = byId("compact-role-badge");
  const creatorsTabBtn = byId("creators-tab-btn");
  const vaultTabBtn = byId("vault-tab-btn");
  const railCreatorsBtn = byId("rail-creators-btn");
  const railVaultBtn = byId("rail-vault-btn");
  const creatorsView = byId("creators-view");
  const vaultView = byId("vault-view");
  const storiesView = byId("stories-view");
  const vaultStoriesList = byId("vault-stories-list");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const railButtons = document.querySelectorAll("[data-rail-tab]");
  const feedSearchInput = byId("feed-search-input");

  // Botón de simulación de suscripción e indicador VIP
  const simulatePlanBtn = byId("simulate-plan-btn");
  const simulatePlanBtnLabel = byId("simulate-plan-btn-label");
  const menuSimulatePlanBtn = byId("menu-simulate-plan-btn");
  const menuSimulatePlanLabel = byId("menu-simulate-plan-label");
  const vipAlertIndicator = byId("vip-alert-indicator");

  // Filtros avanzados sobre el muro
  const filterReadingTimeEl = byId("filter-reading-time");
  const filterSubgenreEl = byId("filter-subgenre");
  const filterStoryStatusEl = byId("filter-story-status");
  const filterResetBtn = byId("filter-reset-btn");

  const topProfileWrap = byId("top-profile-wrap");
  const topAvatarBtn = byId("top-avatar-btn");
  const menuUserAvatar = byId("menu-user-avatar");
  const hoverProfileName = byId("hover-profile-name");
  const hoverProfileHandle = byId("hover-profile-handle");
  const hoverFollowersCount = byId("hover-followers-count");
  const hoverFollowingCount = byId("hover-following-count");
  const leftRailAvatar = byId("left-rail-avatar");
  const leftRailName = byId("left-rail-name");
  const quickComposerAvatar =
    byId("umbral-quick-avatar") || byId("quick-composer-avatar");
  const modalUserAvatar = byId("umbral-modal-avatar");
  const modalAuthorName = byId("umbral-modal-author-name");
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
  const storyImageCard = byId("story-image-card");
  const storyVideoCard = byId("story-video-card");
  const storyImageLabel = byId("story-image-label");
  const storyVideoLabel = byId("story-video-label");

  // Controles de la barra tipo Facebook
  const quickPromptTrigger =
    byId("umbral-open-post-modal-btn") ||
    byId("quick-composer-trigger") ||
    byId("quick-post-input") ||
    byId("open-create-post-modal-btn") ||
    byId("quick-create-post-btn") ||
    document.querySelector("[data-quick-composer-trigger], [data-open-create-post-modal]");

  const quickVideoBtn =
    byId("umbral-quick-video-btn") ||
    byId("quick-video-btn") ||
    byId("fb-quick-video-btn") ||
    document.querySelector("[data-quick-video], [data-action='quick-video']");

  const quickImageBtn =
    byId("umbral-quick-media-btn") ||
    byId("quick-image-btn") ||
    byId("fb-quick-image-btn") ||
    document.querySelector("[data-quick-image], [data-action='quick-image']");

  const quickMoodBtn =
    byId("umbral-quick-mood-btn") ||
    byId("quick-mood-btn") ||
    byId("quick-horror-mood-btn") ||
    byId("fb-quick-mood-btn") ||
    document.querySelector("[data-quick-mood], [data-horror-mood], [data-action='quick-mood']");

  const publishNoveltyOrVideoBtn =
    byId("umbral-novelty-or-video-btn") ||
    byId("publish-novelty-video-btn") ||
    byId("btn-publish-novelty-video") ||
    document.querySelector("[data-publish-novelty-video]");

  // Modal "Crear publicación" y controles asociados
  const createPostModal =
    byId("umbral-create-post-modal") || byId("create-post-modal");
  const closeCreatePostModalBtn =
    byId("umbral-close-post-modal-btn") ||
    byId("close-create-post-modal-btn") ||
    byId("cancel-create-post-btn");
  const createPostModalForm =
    byId("umbral-unified-post-form") || byId("create-post-modal-form");
  const unifiedPostTitleEl = byId("umbral-unified-post-title");
  const unifiedPostTextEl =
    byId("umbral-unified-post-text") ||
    byId("modal-post-content") ||
    byId("create-post-content");
  const unifiedPostSubgenreEl = byId("umbral-post-subgenre");
  const modalMediaPreviewEl = byId("umbral-modal-media-preview");
  const modalVideoErrorEl = byId("umbral-video-error-msg");
  const modalVideoLimitHintEl = byId("umbral-video-limit-hint");
  const vipCallWrapEl = byId("umbral-vip-call-wrap");
  const vipCallCheckboxEl = byId("umbral-vip-call-checkbox");
  const submitUnifiedPostBtn = byId("umbral-submit-unified-post-btn");
  const activeExtrasSummaryEl = byId("umbral-active-extras-summary");

  // Popover de cuenta usuario_estandar al pulsar "Publicar novedad o video"
  const narratorCreatorPopover = byId("umbral-narrator-creator-popover");
  const narratorCancelBtn = byId("umbral-narrator-cancel-btn");
  const narratorGoRegisterBtn = byId("umbral-narrator-go-register-btn");

  // Botones extra dentro del modal
  const modalAddMediaBtn = byId("umbral-add-media-btn");
  const modalAddVideoBtn = byId("umbral-add-video-btn");
  const modalAddTagBtn = byId("umbral-add-tag-btn");
  const modalAddFeelingBtn = byId("umbral-add-feeling-btn");
  const modalAddLocationBtn = byId("umbral-add-location-btn");
  const modalAddFlagBtn = byId("umbral-add-flag-btn");
  const modalAddMoreBtn = byId("umbral-add-more-btn");

  const postAudienceSelect =
    byId("umbral-post-visibility") ||
    byId("post-audience-select") ||
    byId("modal-post-audience") ||
    byId("story-audience") ||
    byId("creator-audience") ||
    byId("audience-select");

  const postAiLabelSelect =
    byId("umbral-post-ai-label") ||
    byId("post-ai-label-select") ||
    byId("modal-post-ai-label") ||
    byId("story-ai-label") ||
    byId("creator-ai-label") ||
    byId("ai-label-select");

  const aaStyleBtn =
    byId("umbral-cycle-theme-btn") ||
    byId("aa-style-btn") ||
    byId("toggle-aa-style-btn") ||
    document.querySelector("[data-aa-toggle]");
  const aaPaletteEl =
    byId("aa-style-palette") ||
    byId("aa-bg-palette") ||
    document.querySelector("[data-aa-palette]");
  const aaPreviewBox =
    byId("aa-preview-box") ||
    byId("modal-aa-preview") ||
    document.querySelector("[data-aa-preview]");

  const creatorPostForm = byId("creator-post-form");
  const creatorChannelInput = byId("creator-channel");
  const creatorNetworkInput = byId("creator-network");
  const creatorPostsList = byId("creator-posts-list");
  const toggleCreatorComposerBtn = byId("toggle-creator-composer");
  const creatorComposerBox = byId("creator-composer-box");
  const creatorDrawer = byId("creator-drawer");
  const publishCreatorBtn = byId("publish-creator-btn");
  const creatorImageFileInput = byId("creator-media-image");
  const creatorVideoFileInput = byId("creator-media-video");
  const creatorMediaPreviewEl = byId("creator-media-preview");
  const creatorPostErrorEl = byId("creator-post-error");
  const creatorImageCard = byId("creator-image-card");
  const creatorVideoCard = byId("creator-video-card");
  const creatorImageLabel = byId("creator-image-label");
  const creatorVideoLabel = byId("creator-video-label");

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

  const postDetailModal = byId("post-detail-modal");
  const postDetailTitle = byId("post-detail-modal-title");
  const postDetailBody = byId("post-detail-modal-title") ? byId("post-detail-body") : null;
  const closePostDetailBtn = byId("close-post-detail-btn");
  const postCommentForm = byId("post-comment-form");
  const postCommentFileInput = byId("post-comment-file");
  const postCommentClipBtn = byId("post-comment-clip-btn");
  const postCommentInput = byId("post-comment-input");
  const postCommentAttachmentPreview = byId("post-comment-attachment-preview");

  const MAX_CREATOR_IMAGE_BYTES = LIMITS.maxUploadBytes;

  const HORROR_MOODS = [
    { id: "inquietante", label: "Inquietante", intensity: "Nivel 1 · Suspenso" },
    { id: "escalofriante", label: "Escalofriante", intensity: "Nivel 2 · Escalofríos" },
    { id: "paranormal", label: "Paranormal", intensity: "Nivel 3 · Sobrenatural" },
    { id: "psicologico", label: "Terror psicológico", intensity: "Nivel 3 · Mente" },
    { id: "pesadilla", label: "Pesadilla pura", intensity: "Nivel 4 · Terror extremo" },
    { id: "sangriento", label: "Slasher / Oscuro", intensity: "Nivel 4 · Brutal" }
  ];

  const AA_STYLE_ORDER = ["none", "umbral", "nebula", "crimson", "emerald", "amber"];

  const AA_STYLES = {
    none: {
      key: "none",
      label: "Sin fondo",
      background: "",
      color: "",
      borderColor: ""
    },
    umbral: {
      key: "umbral",
      label: "Umbral Púrpura",
      background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 52%, #1e1b4b 100%)",
      color: "#f5f3ff",
      borderColor: "rgba(192, 132, 252, 0.55)"
    },
    nebula: {
      key: "nebula",
      label: "Nebulosa Azul",
      background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 55%, #0f172a 100%)",
      color: "#eff6ff",
      borderColor: "rgba(147, 197, 253, 0.5)"
    },
    crimson: {
      key: "crimson",
      label: "Carmesí Nocturno",
      background: "linear-gradient(135deg, #9f1239 0%, #be185d 55%, #2a0d29 100%)",
      color: "#fff1f2",
      borderColor: "rgba(251, 113, 133, 0.5)"
    },
    emerald: {
      key: "emerald",
      label: "Bosque Umbral",
      background: "linear-gradient(135deg, #047857 0%, #0f766e 55%, #0b192c 100%)",
      color: "#ecfdf5",
      borderColor: "rgba(52, 211, 153, 0.5)"
    },
    amber: {
      key: "amber",
      label: "Ámbar Crepúsculo",
      background: "linear-gradient(135deg, #b45309 0%, #9a3412 55%, #27130a 100%)",
      color: "#fffbeb",
      borderColor: "rgba(251, 191, 36, 0.5)"
    }
  };

  let lastCreatedStoryId = null;
  let lastCreatedPostId = null;
  let pendingStoryId = null;
  let activeChatContext = null;
  let activeShareModalRef = null;
  let activePostModalRef = null;
  let draftCommentMedia = { image: "", video: "", name: "" };
  let notifFilterMode = "all";
  let searchQuery = "";
  let filterReadingTime = "all";
  let filterSubgenre = "all";
  let filterStoryStatus = "all";
  let draftStoryImage = "";
  let draftStoryVideo = "";
  let draftStoryVideoFile = null;
  let draftCreatorImage = "";
  let draftCreatorVideo = "";
  let draftCreatorVideoFile = null;
  let draftBgStyle = "none";
  let draftHorrorMood = "";
  let draftLocationTag = "";
  let draftMentionTag = "";
  let draftNoticeFlag = "";
  let forceCreatorNoveltyMode = false;
  let aaPaletteOpen = false;
  let horrorMoodMenuOpen = false;

  // --- IMÁGENES COMPLETAS SIN RECORTE ---
  function applyFullImageStyle(imgEl) {
    if (!imgEl) return;
    imgEl.style.width = "100%";
    imgEl.style.maxWidth = "100%";
    imgEl.style.height = "auto";
    imgEl.style.maxHeight = "none";
    imgEl.style.objectFit = "contain";
    imgEl.style.display = "block";
    imgEl.style.borderRadius = "12px";
  }

  function syncUnifiedSubmitState() {
    if (!submitUnifiedPostBtn) return;
    const textVal = (unifiedPostTextEl?.value || "").trim();
    const hasMedia = hasAnyDraftMediaAttached();
    submitUnifiedPostBtn.disabled = !textVal && !hasMedia;

    if (activeExtrasSummaryEl) {
      const parts = [];
      if (vipCallCheckboxEl?.checked) parts.push("Convocatoria VIP");
      if (draftHorrorMood) parts.push(`Terror: ${draftHorrorMood}`);
      if (draftLocationTag) parts.push(`Lugar: ${draftLocationTag}`);
      if (draftMentionTag) parts.push(`Mención: ${draftMentionTag}`);
      if (draftNoticeFlag) parts.push(`Aviso: ${draftNoticeFlag}`);
      if (forceCreatorNoveltyMode) parts.push("Modo: Novedad / Video");
      activeExtrasSummaryEl.textContent = parts.join(" · ");
    }
  }

  function hideLegacyBottomButtons() {
    [
      toggleComposerBtn,
      toggleCreatorComposerBtn,
      byId("legacy-create-story-btn"),
      byId("legacy-publish-novelty-btn")
    ].forEach((el) => {
      if (el) {
        el.style.setProperty("display", "none", "important");
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  function syncPlanSimulationUI() {
    const user = getCurrentUser();
    const isCreator = isCreatorUser(user);

    if (simulatePlanBtn) {
      simulatePlanBtn.classList.toggle("is-creator-active", isCreator);
    }
    if (simulatePlanBtnLabel) {
      simulatePlanBtnLabel.textContent = isCreator
        ? "Plan: Creador Suscrito (Cambiar a Gratis)"
        : "Simular Suscripción Creador";
    }
    if (menuSimulatePlanLabel) {
      menuSimulatePlanLabel.textContent = isCreator
        ? "Cambiar a Usuario Gratis (Estándar)"
        : "Simular Suscripción Creador";
    }
    if (modalVideoLimitHintEl) {
      modalVideoLimitHintEl.textContent = isCreator
        ? "Video Creador Suscrito: hasta 25 MB / 10 min"
        : "Video Gratis (usuario_estandar): máx. 5 MB / 60s";
    }
    if (vipCallWrapEl) {
      vipCallWrapEl.classList.toggle("is-hidden", !isCreator);
      if (!isCreator && vipCallCheckboxEl) vipCallCheckboxEl.checked = false;
    }
  }

  function handlePlanToggleClick() {
    const updated = toggleCurrentUserSubscriptionPlan();
    if (!updated) return;
    syncSessionUI();
    renderStories();
    renderVaultStories();
    renderCreatorPosts();
    renderNotifications();
  }

  simulatePlanBtn?.addEventListener("click", handlePlanToggleClick);
  menuSimulatePlanBtn?.addEventListener("click", () => {
    profileMenuCtrl.setOpen(false);
    handlePlanToggleClick();
  });

  // Filtros avanzados sobre el muro
  filterReadingTimeEl?.addEventListener("change", () => {
    filterReadingTime = filterReadingTimeEl.value || "all";
    renderStories();
  });

  filterSubgenreEl?.addEventListener("change", () => {
    filterSubgenre = filterSubgenreEl.value || "all";
    renderStories();
  });

  filterStoryStatusEl?.addEventListener("change", () => {
    filterStoryStatus = filterStoryStatusEl.value || "all";
    renderStories();
  });

  filterResetBtn?.addEventListener("click", () => {
    filterReadingTime = "all";
    filterSubgenre = "all";
    filterStoryStatus = "all";
    searchQuery = "";
    if (filterReadingTimeEl) filterReadingTimeEl.value = "all";
    if (filterSubgenreEl) filterSubgenreEl.value = "all";
    if (filterStoryStatusEl) filterStoryStatusEl.value = "all";
    if (feedSearchInput) feedSearchInput.value = "";
    renderStories();
  });

  // --- ESTADO DE ÁNIMO DE TERROR (FLOTANDO ARRIBA DE TODO) ---
  function getHorrorMoodPillEl() {
    let pill = byId("selected-horror-mood-pill");
    if (!pill) {
      pill = document.createElement("div");
      pill.id = "selected-horror-mood-pill";
      pill.className = "horror-mood-pill";
      pill.style.display = "none";
      const anchor = byId("umbral-quick-composer-bar") || quickPromptTrigger;
      anchor?.insertAdjacentElement("afterend", pill);
    }
    return pill;
  }

  function getHorrorMoodPopoverEl() {
    let pop = byId("horror-mood-popover");
    if (!pop) {
      pop = document.createElement("div");
      pop.id = "horror-mood-popover";
      pop.className = "horror-mood-popover";
      pop.style.cssText = `
        display: none;
        position: fixed;
        z-index: 9999;
        width: min(360px, calc(100vw - 24px));
        background: #141224;
        border: 1px solid rgba(167, 139, 250, 0.45);
        border-radius: 14px;
        padding: 0.75rem;
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.72);
      `;

      const title = document.createElement("div");
      title.className = "horror-mood-popover-title";
      title.style.cssText = "font-weight:700;font-size:0.9rem;color:#f5f3ff;margin-bottom:0.6rem;";
      title.textContent = "¿Qué tan terrorífico es tu relato, video o novedad?";
      pop.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "horror-mood-grid";
      grid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.45rem;";

      HORROR_MOODS.forEach((mood) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "horror-mood-option";
        btn.dataset.moodLabel = mood.label;
        btn.style.cssText =
          "display:flex;flex-direction:column;align-items:flex-start;gap:0.15rem;padding:0.55rem 0.65rem;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#f3f4f6;cursor:pointer;text-align:left;";
        btn.innerHTML = `<strong style="font-size:0.84rem;">${mood.label}</strong><span style="font-size:0.73rem;color:#a5b4fc;">${mood.intensity}</span>`;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          draftHorrorMood = draftHorrorMood === mood.label ? "" : mood.label;
          horrorMoodMenuOpen = false;
          syncHorrorMoodUI();
          syncUnifiedSubmitState();
        });
        grid.appendChild(btn);
      });

      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "horror-mood-clear-btn";
      clearBtn.style.cssText =
        "margin-top:0.55rem;width:100%;padding:0.45rem;border-radius:9px;background:transparent;border:1px solid rgba(255,255,255,0.12);color:#cbd5e1;font-size:0.8rem;cursor:pointer;";
      clearBtn.textContent = "Quitar estado de terror";
      clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        draftHorrorMood = "";
        horrorMoodMenuOpen = false;
        syncHorrorMoodUI();
        syncUnifiedSubmitState();
      });

      pop.append(grid, clearBtn);
      document.body.appendChild(pop);
    }
    return pop;
  }

  function positionHorrorMoodPopover(pop) {
    const anchorBtn =
      createPostModal?.classList.contains("is-open") && modalAddFeelingBtn
        ? modalAddFeelingBtn
        : quickMoodBtn;
    if (!pop || !anchorBtn) return;

    const rect = anchorBtn.getBoundingClientRect();
    const popWidth = Math.min(360, window.innerWidth - 24);
    const leftPos = Math.min(
      Math.max(12, rect.right - popWidth),
      window.innerWidth - popWidth - 12
    );
    const estimatedHeight = 290;
    let topPos = rect.bottom + 8;
    if (topPos + estimatedHeight > window.innerHeight - 12) {
      topPos = Math.max(12, rect.top - estimatedHeight - 8);
    }
    pop.style.width = `${popWidth}px`;
    pop.style.left = `${leftPos}px`;
    pop.style.top = `${topPos}px`;
  }

  function syncHorrorMoodUI() {
    const pop = getHorrorMoodPopoverEl();
    pop.style.display = horrorMoodMenuOpen ? "block" : "none";
    pop.classList.toggle("is-open", horrorMoodMenuOpen);

    if (horrorMoodMenuOpen) {
      positionHorrorMoodPopover(pop);
    }

    pop.querySelectorAll(".horror-mood-option").forEach((btn) => {
      const selected = btn.dataset.moodLabel === draftHorrorMood;
      btn.classList.toggle("is-selected", selected);
      btn.style.borderColor = selected ? "rgba(192,132,252,0.8)" : "rgba(255,255,255,0.1)";
      btn.style.background = selected ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)";
    });

    if (quickMoodBtn) {
      quickMoodBtn.classList.toggle("has-mood", Boolean(draftHorrorMood) || horrorMoodMenuOpen);
      quickMoodBtn.setAttribute(
        "title",
        draftHorrorMood
          ? `Nivel de terror: ${draftHorrorMood} (clic para cambiar)`
          : "Estado de ánimo de terror"
      );
    }

    const pill = getHorrorMoodPillEl();
    if (draftHorrorMood) {
      pill.style.display = "inline-flex";
      pill.innerHTML = "";
      const txt = document.createElement("span");
      txt.textContent = `Nivel de terror: ${draftHorrorMood}`;
      const xBtn = document.createElement("button");
      xBtn.type = "button";
      xBtn.className = "horror-mood-pill-remove";
      xBtn.setAttribute("aria-label", "Quitar estado de terror");
      xBtn.textContent = "×";
      xBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        draftHorrorMood = "";
        syncHorrorMoodUI();
        syncUnifiedSubmitState();
      });
      pill.append(txt, xBtn);
    } else {
      pill.style.display = "none";
      pill.innerHTML = "";
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (horrorMoodMenuOpen) positionHorrorMoodPopover(getHorrorMoodPopoverEl());
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (horrorMoodMenuOpen) positionHorrorMoodPopover(getHorrorMoodPopoverEl());
  });

  function bindFacebookComposerBar() {
    quickPromptTrigger?.addEventListener("click", (e) => {
      e.preventDefault();
      horrorMoodMenuOpen = false;
      syncHorrorMoodUI();
      openCreatePostModal();
    });

    quickVideoBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      horrorMoodMenuOpen = false;
      syncHorrorMoodUI();
      openCreatePostModal();
      const user = getCurrentUser();
      const targetVideoInput =
        isCreatorUser(user) && creatorVideoFileInput
          ? creatorVideoFileInput
          : storyVideoFileInput || creatorVideoFileInput;
      setTimeout(() => targetVideoInput?.click(), 80);
    });

    quickImageBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      horrorMoodMenuOpen = false;
      syncHorrorMoodUI();
      openCreatePostModal();
      const user = getCurrentUser();
      const targetImageInput =
        isCreatorUser(user) && creatorImageFileInput
          ? creatorImageFileInput
          : storyImageFileInput || creatorImageFileInput;
      setTimeout(() => targetImageInput?.click(), 80);
    });

    quickMoodBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      horrorMoodMenuOpen = !horrorMoodMenuOpen;
      syncHorrorMoodUI();
    });

    publishNoveltyOrVideoBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      if (isCreatorUser(user)) {
        forceCreatorNoveltyMode = !forceCreatorNoveltyMode;
        publishNoveltyOrVideoBtn.classList.toggle("is-active", forceCreatorNoveltyMode);
        syncUnifiedSubmitState();
        return;
      }

      if (narratorCreatorPopover) {
        const isShown =
          narratorCreatorPopover.classList.contains("is-open") ||
          narratorCreatorPopover.style.display === "block";
        const nextOpen = !isShown;
        narratorCreatorPopover.classList.toggle("is-open", nextOpen);
        narratorCreatorPopover.style.display = nextOpen ? "block" : "none";
      } else {
        showCreatorRoleWarning();
      }
    });

    narratorCancelBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (narratorCreatorPopover) {
        narratorCreatorPopover.classList.remove("is-open");
        narratorCreatorPopover.style.display = "none";
      }
    });

    narratorGoRegisterBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      clearActiveSession();
      navigateWithTransition("registro.html", "Cerrando sesión para registro de creador...");
    });

    modalAddMediaBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      const targetInput =
        isCreatorUser(user) && creatorImageFileInput
          ? creatorImageFileInput
          : storyImageFileInput || creatorImageFileInput;
      targetInput?.click();
    });

    modalAddVideoBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      const targetInput =
        isCreatorUser(user) && creatorVideoFileInput
          ? creatorVideoFileInput
          : storyVideoFileInput || creatorVideoFileInput;
      targetInput?.click();
    });

    modalAddFeelingBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      horrorMoodMenuOpen = !horrorMoodMenuOpen;
      syncHorrorMoodUI();
    });

    modalAddTagBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const val = window.prompt("Etiquetar persona o mención:", draftMentionTag || "");
      if (val !== null) {
        draftMentionTag = val.trim();
        syncUnifiedSubmitState();
      }
    });

    modalAddLocationBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const val = window.prompt("Lugar o ubicación del suceso:", draftLocationTag || "");
      if (val !== null) {
        draftLocationTag = val.trim();
        syncUnifiedSubmitState();
      }
    });

    modalAddFlagBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const val = window.prompt("Etiqueta de aviso o suceso:", draftNoticeFlag || "");
      if (val !== null) {
        draftNoticeFlag = val.trim();
        syncUnifiedSubmitState();
      }
    });

    modalAddMoreBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (unifiedPostTextEl) {
        unifiedPostTextEl.focus();
      }
    });

    vipCallCheckboxEl?.addEventListener("change", () => {
      syncUnifiedSubmitState();
    });

    unifiedPostTextEl?.addEventListener("input", () => {
      syncUnifiedSubmitState();
      if (draftBgStyle !== "none" && aaPreviewBox) {
        const val = unifiedPostTextEl.value.trim() || "Vista previa de texto con fondo Aa";
        aaPreviewBox.textContent = val;
        applyAaBackgroundStyle(aaPreviewBox, draftBgStyle, val);
      }
    });

    document.addEventListener("click", (e) => {
      const pop = byId("horror-mood-popover");
      if (
        horrorMoodMenuOpen &&
        pop &&
        !pop.contains(e.target) &&
        quickMoodBtn &&
        !quickMoodBtn.contains(e.target) &&
        modalAddFeelingBtn &&
        !modalAddFeelingBtn.contains(e.target)
      ) {
        horrorMoodMenuOpen = false;
        syncHorrorMoodUI();
      }
    });
  }

  function applyAaBackgroundStyle(el, styleKey, textContent = "") {
    if (!el) return;
    const styleCfg = AA_STYLES[styleKey] || AA_STYLES.none;
    if (styleCfg.key === "none") {
      el.classList.remove("aa-styled-text");
      el.style.background = "";
      el.style.color = "";
      el.style.borderColor = "";
      el.style.padding = "";
      el.style.borderRadius = "";
      el.style.textAlign = "";
      el.style.fontWeight = "";
      el.style.fontSize = "";
      el.style.minHeight = "";
      el.style.display = "";
      el.style.alignItems = "";
      el.style.justifyContent = "";
      return;
    }

    el.classList.add("aa-styled-text");
    el.style.background = styleCfg.background;
    el.style.color = styleCfg.color;
    el.style.border = `1px solid ${styleCfg.borderColor}`;
    el.style.padding = "1.3rem 1.1rem";
    el.style.borderRadius = "14px";
    el.style.textAlign = "center";
    el.style.fontWeight = "600";
    el.style.fontSize = String(textContent).length > 150 ? "1rem" : "1.18rem";
    el.style.lineHeight = "1.45";
    el.style.minHeight = "130px";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
  }

  function hasAnyDraftMediaAttached() {
    return Boolean(
      draftStoryImage ||
        draftStoryVideo ||
        draftStoryVideoFile ||
        draftCreatorImage ||
        draftCreatorVideo ||
        draftCreatorVideoFile
    );
  }

  function syncAaStyleControls() {
    const mediaAttached = hasAnyDraftMediaAttached();
    if (mediaAttached && draftBgStyle !== "none") {
      draftBgStyle = "none";
    }

    const activeCfg = AA_STYLES[draftBgStyle] || AA_STYLES.none;

    if (aaStyleBtn) {
      aaStyleBtn.disabled = mediaAttached;
      aaStyleBtn.classList.toggle("is-active", aaPaletteOpen || draftBgStyle !== "none");
      aaStyleBtn.setAttribute("aria-expanded", String(aaPaletteOpen && !mediaAttached));
      aaStyleBtn.setAttribute(
        "title",
        mediaAttached
          ? "No disponible al adjuntar foto o video"
          : `Estilo de fondo (${activeCfg.label}) — clic para cambiar`
      );
    }

    if (unifiedPostTextEl) {
      if (!mediaAttached && draftBgStyle !== "none") {
        unifiedPostTextEl.style.background = activeCfg.background;
        unifiedPostTextEl.style.color = activeCfg.color;
        unifiedPostTextEl.style.borderColor = activeCfg.borderColor;
        unifiedPostTextEl.style.fontWeight = "600";
      } else {
        unifiedPostTextEl.style.background = "";
        unifiedPostTextEl.style.color = "";
        unifiedPostTextEl.style.borderColor = "";
        unifiedPostTextEl.style.fontWeight = "";
      }
    }

    if (aaPaletteEl) {
      const showPalette = aaPaletteOpen && !mediaAttached;
      aaPaletteEl.classList.toggle("is-open", showPalette);
      aaPaletteEl.style.display = showPalette ? "flex" : "none";
      aaPaletteEl.querySelectorAll("[data-aa-style]").forEach((btn) => {
        const active = btn.dataset.aaStyle === draftBgStyle;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    const currentText =
      (
        unifiedPostTextEl?.value ||
        byId("modal-post-content")?.value ||
        byId("create-post-content")?.value ||
        byId("content")?.value ||
        byId("creator-message")?.value ||
        ""
      ).trim() || "Vista previa de texto con fondo Aa";

    if (aaPreviewBox) {
      const showPreview = draftBgStyle !== "none" && !mediaAttached;
      aaPreviewBox.style.display = showPreview ? "flex" : "none";
      aaPreviewBox.textContent = currentText;
      applyAaBackgroundStyle(aaPreviewBox, showPreview ? draftBgStyle : "none", currentText);
    }
  }

  function bindAaStyleControls() {
    aaStyleBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (hasAnyDraftMediaAttached()) return;

      if (aaPaletteEl) {
        aaPaletteOpen = !aaPaletteOpen;
      } else {
        const idx = AA_STYLE_ORDER.indexOf(draftBgStyle);
        draftBgStyle = AA_STYLE_ORDER[(idx + 1) % AA_STYLE_ORDER.length];
      }
      syncAaStyleControls();
    });

    if (aaPaletteEl) {
      aaPaletteEl.querySelectorAll("[data-aa-style]").forEach((btn) => {
        const key = btn.dataset.aaStyle || "none";
        const cfg = AA_STYLES[key] || AA_STYLES.none;
        if (cfg.background) {
          btn.style.background = cfg.background;
          btn.style.color = cfg.color;
        }
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          draftBgStyle = key;
          syncAaStyleControls();
        });
      });
    }

    ["modal-post-content", "create-post-content", "content", "creator-message"].forEach((id) => {
      byId(id)?.addEventListener("input", () => {
        if (draftBgStyle !== "none" && aaPreviewBox) {
          const val = byId(id)?.value.trim() || "Vista previa de texto con fondo Aa";
          aaPreviewBox.textContent = val;
          applyAaBackgroundStyle(aaPreviewBox, draftBgStyle, val);
        }
      });
    });
  }

  function getSelectedPostAudience() {
    return (postAudienceSelect?.value || "Público").trim() || "Público";
  }

  function getSelectedPostAiLabel() {
    return (postAiLabelSelect?.value || "Sin etiqueta de IA").trim() || "Sin etiqueta de IA";
  }

  function openCreatePostModal(prefillOptions = {}) {
    if (!createPostModal) return;
    const user = getCurrentUser();
    if (user) {
      fillAvatarSlot(modalUserAvatar, user);
      if (modalAuthorName) {
        modalAuthorName.textContent = user.username || "Usuario";
        if (isCreatorUser(user)) {
          modalAuthorName.appendChild(buildVerifiedBadgeEl());
        }
      }
    }
    if (narratorCreatorPopover) {
      narratorCreatorPopover.classList.remove("is-open");
      narratorCreatorPopover.style.display = "none";
    }
    hideFormError(modalVideoErrorEl);
    if (prefillOptions.title && unifiedPostTitleEl) {
      unifiedPostTitleEl.value = prefillOptions.title;
    }
    if (prefillOptions.noticeFlag) {
      draftNoticeFlag = prefillOptions.noticeFlag;
    }
    syncPlanSimulationUI();
    syncAaStyleControls();
    syncHorrorMoodUI();
    syncUnifiedSubmitState();
    createPostModal.classList.add("is-open");
    createPostModal.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      const targetInput =
        unifiedPostTextEl ||
        byId("modal-post-title") ||
        byId("create-post-title") ||
        byId("modal-post-content") ||
        byId("create-post-content") ||
        createPostModal.querySelector("input, textarea, select");
      targetInput?.focus();
    }, 100);
  }

  function closeCreatePostModal() {
    if (!createPostModal) return;
    if (narratorCreatorPopover) {
      narratorCreatorPopover.classList.remove("is-open");
      narratorCreatorPopover.style.display = "none";
    }
    createPostModal.classList.remove("is-open");
    createPostModal.setAttribute("aria-hidden", "true");
  }

  closeCreatePostModalBtn?.addEventListener("click", closeCreatePostModal);
  createPostModal?.addEventListener("click", (e) => {
    if (e.target === createPostModal) closeCreatePostModal();
  });

  // --- FECHA Y LÍNEA DE TIEMPO AL COMPARTIR ---
  function formatSharedTimelineStamp(meta = {}) {
    const ts = Number(meta?.sharedAtTs);
    if (Number.isFinite(ts) && ts > 0) {
      const dateObj = new Date(ts);
      const fecha = dateObj.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      const hora = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `${fecha} · ${hora}`;
    }
    if (meta?.sharedAtDate && meta?.sharedAt) {
      return `${meta.sharedAtDate} · ${meta.sharedAt}`;
    }
    return meta?.sharedAt || "Hace un momento";
  }

  function recordShareWithTimeline(kind, postId, user, options = {}) {
    const nowTs = Date.now();
    const nowDateLabelLocal = new Date(nowTs).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const nowTime = nowTimeLabel();
    const { post } = findPostRecord(kind, postId);
    const prevMeta = post?.shareMeta?.[user?.id] || {};

    return sharePostRecord(kind, postId, user, {
      ...options,
      sharedAtTs: prevMeta.sharedAtTs || nowTs,
      sharedAtDate: prevMeta.sharedAtDate || nowDateLabelLocal,
      sharedAt: prevMeta.sharedAt || nowTime
    });
  }

  function collectSharedTimelineEntries(kind) {
    const storageKey = kind === "creator" ? STORAGE_KEYS.creatorPosts : STORAGE_KEYS.stories;
    const items = loadData(storageKey, []);
    const entries = [];

    items.forEach((post) => {
      const sharedIds = Array.from(new Set(Array.isArray(post.sharedBy) ? post.sharedBy : []));
      const metaMap = post.shareMeta && typeof post.shareMeta === "object" ? post.shareMeta : {};

      sharedIds.forEach((sharerId) => {
        const meta = metaMap[sharerId] || {};
        const sharerInfo = resolveUserInfo(sharerId, meta.sharerName || "");
        entries.push({
          _kind: kind,
          _entryType: "shared",
          _sharerId: sharerInfo.id,
          _sharerName: sharerInfo.username,
          _sharerHandle: sharerInfo.handle,
          _shareMeta: meta,
          _shareStamp: formatSharedTimelineStamp(meta),
          _shareTs: Number(meta.sharedAtTs) || 0,
          ...post
        });
      });
    });

    entries.sort((a, b) => b._shareTs - a._shareTs);
    return entries;
  }

  // --- ALMACÉN INDEXEDDB PARA VIDEOS PESADOS ---
  const MEDIA_DB_NAME = "umbral_media_db_v1";
  const MEDIA_STORE_NAME = "videos";
  const mediaBlobUrlCache = new Map();

  function openMediaDb() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB no disponible"));
      const req = indexedDB.open(MEDIA_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
          db.createObjectStore(MEDIA_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveVideoToMediaDb(key, dataOrFile) {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE_NAME, "readwrite");
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.put(dataOrFile, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function getVideoFromMediaDb(key) {
    const db = await openMediaDb();
    return new Promise((resolve) => {
      const tx = db.transaction(MEDIA_STORE_NAME, "readonly");
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  function isStoredVideoRef(v) {
    return typeof v === "string" && v.startsWith("idb:");
  }

  function hasPlayableVideo(v) {
    return isDataVideo(v) || isStoredVideoRef(v);
  }

  async function hydrateVideoElement(videoEl, srcVal) {
    if (!videoEl || !srcVal) return;
    if (isDataVideo(srcVal)) {
      videoEl.src = srcVal;
      return;
    }
    if (!isStoredVideoRef(srcVal)) return;

    if (mediaBlobUrlCache.has(srcVal)) {
      videoEl.src = mediaBlobUrlCache.get(srcVal);
      return;
    }

    const stored = await getVideoFromMediaDb(srcVal);
    if (!stored) return;

    if (stored instanceof Blob || stored instanceof File) {
      const url = URL.createObjectURL(stored);
      mediaBlobUrlCache.set(srcVal, url);
      videoEl.src = url;
    } else if (typeof stored === "string" && isDataVideo(stored)) {
      videoEl.src = stored;
    }
  }

  const getTargetKey = (item) =>
    item.authorId || `author:${(item.author || item.channel || "").toLowerCase()}`;

  function setDrawerState(drawer, triggerBtn, isOpen) {
    if (!drawer) return;
    const nextOpen = Boolean(isOpen);

    if (nextOpen) {
      const otherDrawer = drawer === composerDrawer ? creatorDrawer : composerDrawer;
      const otherTrigger = drawer === composerDrawer ? toggleCreatorComposerBtn : toggleComposerBtn;
      if (otherDrawer && otherDrawer !== drawer) {
        otherDrawer.classList.remove("is-open");
        otherDrawer.setAttribute("aria-hidden", "true");
        otherDrawer.style.removeProperty("display");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        if (otherDrawer === creatorDrawer && creatorComposerBox) {
          creatorComposerBox.classList.remove("is-creator-composer-open");
        }
      }
    }

    drawer.classList.toggle("is-open", nextOpen);
    drawer.setAttribute("aria-hidden", String(!nextOpen));
    drawer.style.removeProperty("display");
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", String(nextOpen));
    if (drawer === creatorDrawer && creatorComposerBox) {
      creatorComposerBox.classList.toggle("is-creator-composer-open", nextOpen);
    }
  }

  function showCreatorRoleWarning() {
    const anchor = publishNoveltyOrVideoBtn || toggleCreatorComposerBtn || creatorDrawer || storiesList;
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
      "Tu cuenta actual es usuario_estandar. Para publicar novedades de creador necesitas rol creador_suscrito.";
    notice.style.display = "block";
    clearTimeout(notice._hideTimer);
    notice._hideTimer = setTimeout(() => {
      notice.style.display = "none";
    }, 4000);
  }

  function appendMediaPreview(container, src, isVideo, altText) {
    const box = document.createElement("div");
    box.className = "fb-media-preview-item creator-media-preview-item story-media-preview-item";
    if (isVideo) {
      const vid = document.createElement("video");
      vid.src = src;
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = "metadata";
      box.appendChild(vid);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = altText;
      applyFullImageStyle(img);
      box.appendChild(img);
    }
    container.appendChild(box);
  }

  function syncUploadCardState(cardEl, labelEl, fileName, defaultText) {
    if (cardEl) cardEl.classList.toggle("has-file", Boolean(fileName));
    if (labelEl) labelEl.textContent = fileName ? fileName : defaultText;
  }

  function syncModalMediaPreview() {
    if (!modalMediaPreviewEl) return;
    modalMediaPreviewEl.innerHTML = "";
    let count = 0;

    const imgSrc = draftStoryImage || draftCreatorImage;
    const vidSrc = draftStoryVideo || draftCreatorVideo;

    if (isDataImage(imgSrc)) {
      appendMediaPreview(modalMediaPreviewEl, imgSrc, false, "Imagen adjunta");
      count++;
    }
    if (vidSrc) {
      appendMediaPreview(modalMediaPreviewEl, vidSrc, true, "Video adjunto");
      count++;
    }

    modalMediaPreviewEl.classList.toggle("has-media", count > 0);
    modalMediaPreviewEl.classList.toggle("is-visible", count > 0);
  }

  function syncDraftMediaPreview() {
    if (storyMediaPreviewEl) {
      storyMediaPreviewEl.innerHTML = "";
      let count = 0;

      if (isDataImage(draftStoryImage)) {
        appendMediaPreview(storyMediaPreviewEl, draftStoryImage, false, "Vista previa de imagen");
        count++;
      }
      if (draftStoryVideo) {
        appendMediaPreview(storyMediaPreviewEl, draftStoryVideo, true, "Vista previa de video");
        count++;
      }

      storyMediaPreviewEl.classList.toggle("has-media", count > 0);
      storyMediaPreviewEl.classList.toggle("is-visible", count > 0);
    }
    syncModalMediaPreview();
    syncAaStyleControls();
    syncUnifiedSubmitState();
  }

  function syncCreatorDraftMediaPreview() {
    if (creatorMediaPreviewEl) {
      creatorMediaPreviewEl.innerHTML = "";
      let count = 0;

      if (isDataImage(draftCreatorImage)) {
        appendMediaPreview(
          creatorMediaPreviewEl,
          draftCreatorImage,
          false,
          "Vista previa de foto de creador"
        );
        count++;
      }
      if (draftCreatorVideo) {
        appendMediaPreview(
          creatorMediaPreviewEl,
          draftCreatorVideo,
          true,
          "Vista previa de video de creador"
        );
        count++;
      }

      creatorMediaPreviewEl.classList.toggle("has-media", count > 0);
      creatorMediaPreviewEl.classList.toggle("is-visible", count > 0);
    }
    syncModalMediaPreview();
    syncAaStyleControls();
    syncUnifiedSubmitState();
  }

  storyImageFileInput?.addEventListener("change", async () => {
    hideFormError(modalVideoErrorEl);
    const file = storyImageFileInput.files?.[0];
    if (!file || file.size > LIMITS.maxUploadBytes) {
      if (file) {
        showFormError(modalVideoErrorEl, "La imagen supera el límite de 2 MB.");
        storyImageFileInput.value = "";
      }
      draftStoryImage = "";
      syncUploadCardState(storyImageCard, storyImageLabel, "", "Opcional · Imagen de apoyo");
      syncDraftMediaPreview();
      return;
    }
    draftStoryImage = await readFileAsDataUrl(file);
    syncUploadCardState(storyImageCard, storyImageLabel, file.name, "Opcional · Imagen de apoyo");
    syncDraftMediaPreview();
  });

  storyVideoFileInput?.addEventListener("change", async () => {
    hideFormError(modalVideoErrorEl);
    const file = storyVideoFileInput.files?.[0];
    if (!file) {
      draftStoryVideo = "";
      draftStoryVideoFile = null;
      syncUploadCardState(storyVideoCard, storyVideoLabel, "", "Opcional · Clip corto");
      syncDraftMediaPreview();
      return;
    }

    const user = getCurrentUser();
    const validation = await validateVideoFileForUser(file, user);
    if (!validation.ok) {
      showFormError(modalVideoErrorEl, validation.error);
      storyVideoFileInput.value = "";
      draftStoryVideo = "";
      draftStoryVideoFile = null;
      syncUploadCardState(storyVideoCard, storyVideoLabel, "", "Opcional · Clip corto");
      syncDraftMediaPreview();
      return;
    }

    draftStoryVideoFile = file;
    draftStoryVideo = URL.createObjectURL(file);
    syncUploadCardState(storyVideoCard, storyVideoLabel, file.name, "Opcional · Clip corto");
    syncDraftMediaPreview();
  });

  creatorImageFileInput?.addEventListener("change", async () => {
    hideFormError(creatorPostErrorEl);
    hideFormError(modalVideoErrorEl);
    const file = creatorImageFileInput.files?.[0];
    if (!file) {
      draftCreatorImage = "";
      syncUploadCardState(creatorImageCard, creatorImageLabel, "", "Opcional · Máx. 2 MB");
      syncCreatorDraftMediaPreview();
      return;
    }

    if (!file.type.startsWith("image/")) {
      showFormError(creatorPostErrorEl, "Selecciona un archivo de imagen válido.");
      showFormError(modalVideoErrorEl, "Selecciona un archivo de imagen válido.");
      creatorImageFileInput.value = "";
      draftCreatorImage = "";
      syncUploadCardState(creatorImageCard, creatorImageLabel, "", "Opcional · Máx. 2 MB");
      syncCreatorDraftMediaPreview();
      return;
    }

    if (file.size > MAX_CREATOR_IMAGE_BYTES) {
      showFormError(creatorPostErrorEl, "La foto supera el límite de 2 MB para creadores.");
      showFormError(modalVideoErrorEl, "La foto supera el límite de 2 MB.");
      creatorImageFileInput.value = "";
      draftCreatorImage = "";
      syncUploadCardState(creatorImageCard, creatorImageLabel, "", "Opcional · Máx. 2 MB");
      syncCreatorDraftMediaPreview();
      return;
    }

    draftCreatorImage = await readFileAsDataUrl(file);
    syncUploadCardState(creatorImageCard, creatorImageLabel, file.name, "Opcional · Máx. 2 MB");
    syncCreatorDraftMediaPreview();
  });

  creatorVideoFileInput?.addEventListener("change", async () => {
    hideFormError(creatorPostErrorEl);
    hideFormError(modalVideoErrorEl);
    const file = creatorVideoFileInput.files?.[0];
    if (!file) {
      draftCreatorVideo = "";
      draftCreatorVideoFile = null;
      syncUploadCardState(creatorVideoCard, creatorVideoLabel, "", "Opcional · Máx. 25 MB");
      syncCreatorDraftMediaPreview();
      return;
    }

    const user = getCurrentUser();
    const validation = await validateVideoFileForUser(file, user);
    if (!validation.ok) {
      showFormError(creatorPostErrorEl, validation.error);
      showFormError(modalVideoErrorEl, validation.error);
      creatorVideoFileInput.value = "";
      draftCreatorVideo = "";
      draftCreatorVideoFile = null;
      syncUploadCardState(creatorVideoCard, creatorVideoLabel, "", "Opcional · Máx. 25 MB");
      syncCreatorDraftMediaPreview();
      return;
    }

    draftCreatorVideoFile = file;
    draftCreatorVideo = URL.createObjectURL(file);
    syncUploadCardState(creatorVideoCard, creatorVideoLabel, file.name, "Opcional · Máx. 25 MB");
    syncCreatorDraftMediaPreview();
  });

  function syncCompactSectionLabel(tabId = "stories-view") {
    if (compactSectionLabel) {
      if (tabId === "creators-view") {
        compactSectionLabel.innerHTML = `${iconHtml("film", "umbral-icon--sm")} Espacio de Creadores`;
      } else if (tabId === "vault-view") {
        compactSectionLabel.innerHTML = `${iconHtml("unlock", "umbral-icon--sm")} Bóveda Creadores`;
      } else {
        compactSectionLabel.innerHTML = `${iconHtml("scroll", "umbral-icon--sm")} Muro de Relatos`;
      }
    }
  }

  function switchFeedTab(targetId) {
    const user = getCurrentUser();
    if ((targetId === "creators-view" || targetId === "vault-view") && !isCreatorUser(user)) {
      return;
    }

    tabButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === targetId));
    railButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.railTab === targetId));
    storiesView?.classList.toggle("is-active", targetId === "stories-view");
    vaultView?.classList.toggle("is-active", targetId === "vault-view");
    creatorsView?.classList.toggle("is-active", targetId === "creators-view");
    syncCompactSectionLabel(targetId);

    if (targetId === "vault-view") renderVaultStories();
  }

  function resolveBestAvatarForUser(user) {
    if (!user) return "";
    const directCandidates = [
      user.avatar,
      user.photo,
      user.avatarUrl,
      typeof lookupAvatarForEntry === "function"
        ? lookupAvatarForEntry({
            authorId: user.id,
            name: user.username,
            fallbackAvatar: user.avatar || ""
          })
        : ""
    ];

    for (const item of directCandidates) {
      if (typeof item === "string" && item.trim()) {
        return item.trim();
      }
    }

    try {
      const storageKeys = [STORAGE_KEYS?.users, "umbral_users", "users"].filter(Boolean);
      for (const key of storageKeys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
        const match = list.find(
          (u) =>
            u &&
            ((user.id && u.id === user.id) ||
              (user.username &&
                String(u.username || "").toLowerCase() === String(user.username).toLowerCase()))
        );
        if (match) {
          const found = match.avatar || match.photo || match.avatarUrl || "";
          if (typeof found === "string" && found.trim()) return found.trim();
        }
      }
    } catch (_) {}

    return "";
  }

  function fillAvatarSlot(slotEl, user) {
    if (!slotEl || !user) return;
    slotEl.innerHTML = "";
    slotEl.classList.add("umbral-avatar-slot");

    const fallbackChar = (user.username || "U").trim().charAt(0).toUpperCase() || "U";
    const renderFallback = () => {
      slotEl.innerHTML = "";
      slotEl.classList.remove("has-avatar-img");
      slotEl.classList.add("is-avatar-fallback");
      const span = document.createElement("span");
      span.className = "umbral-avatar-letter";
      span.textContent = fallbackChar;
      slotEl.appendChild(span);
    };

    const avatarUrl = resolveBestAvatarForUser(user);
    if (avatarUrl) {
      slotEl.classList.remove("is-avatar-fallback");
      slotEl.classList.add("has-avatar-img");
      const img = document.createElement("img");
      img.className = "umbral-avatar-img";
      img.src = avatarUrl;
      img.alt = user.username || "Perfil";
      img.onerror = renderFallback;
      slotEl.appendChild(img);
    } else {
      renderFallback();
    }
  }

  function syncTopProfileWidget() {
    const user = getCurrentUser();
    if (!user) return;

    [
      topAvatarBtn,
      menuUserAvatar,
      leftRailAvatar,
      quickComposerAvatar,
      modalUserAvatar,
      shareModalAvatar
    ].forEach((slot) => fillAvatarSlot(slot, user));

    if (leftRailName) {
      leftRailName.textContent = user.username || "Mi perfil";
      if (isCreatorUser(user)) leftRailName.appendChild(buildVerifiedBadgeEl());
    }
    if (hoverProfileName) {
      hoverProfileName.textContent = user.username || "Usuario";
      if (isCreatorUser(user)) hoverProfileName.appendChild(buildVerifiedBadgeEl());
    }
    if (modalAuthorName) {
      modalAuthorName.textContent = user.username || "Usuario";
      if (isCreatorUser(user)) modalAuthorName.appendChild(buildVerifiedBadgeEl());
    }
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
    filterReadingTime = "all";
    filterSubgenre = "all";
    filterStoryStatus = "all";
    if (feedSearchInput) feedSearchInput.value = "";
    if (filterReadingTimeEl) filterReadingTimeEl.value = "all";
    if (filterSubgenreEl) filterSubgenreEl.value = "all";
    if (filterStoryStatusEl) filterStoryStatusEl.value = "all";
    switchFeedTab("stories-view");
    renderStories();
    renderVaultStories();
    renderCreatorPosts();
    settingsMenuCtrl.setOpen(false);
  });

  const performLogout = () => {
    clearActiveSession();
    navigateWithTransition("login.html", "Cerrando sesión...");
  };
  logoutBtn?.addEventListener("click", performLogout);
  menuLogoutBtn?.addEventListener("click", performLogout);

  function setSessionLabel(iconName, text, modeClass, showVerified = false) {
    if (!sessionStatusEl) return;
    sessionStatusEl.classList.remove("is-creator", "is-user");
    if (modeClass) sessionStatusEl.classList.add(modeClass);
    sessionStatusEl.innerHTML = "";
    sessionStatusEl.append(iconEl(iconName, "umbral-icon--sm"), document.createTextNode(text));
    if (showVerified) {
      sessionStatusEl.appendChild(buildVerifiedBadgeEl());
    }
  }

  function syncSessionUI() {
    const user = getCurrentUser();
    if (!user) return;

    const isCreator = isCreatorUser(user);
    if (authorInput) {
      authorInput.value = user.username || "";
      authorInput.readOnly = true;
    }

    if (isCreator) {
      setSessionLabel("crown", `Creador: ${user.username}`, "is-creator", true);
      if (compactRoleBadge) {
        compactRoleBadge.innerHTML = `${iconHtml("crown", "umbral-icon--sm")} Creador: ${user.username}`;
      }
      creatorsTabBtn?.classList.remove("is-hidden");
      vaultTabBtn?.classList.remove("is-hidden");
      railCreatorsBtn?.classList.remove("is-hidden");
      railVaultBtn?.classList.remove("is-hidden");
      if (creatorChannelInput) {
        creatorChannelInput.value = user.username || "";
        creatorChannelInput.readOnly = true;
      }
      if (creatorNetworkInput && user.channel) creatorNetworkInput.value = user.channel;
    } else {
      setSessionLabel("quill", `Estándar: ${user.username}`, "is-user", false);
      if (compactRoleBadge) {
        compactRoleBadge.innerHTML = `${iconHtml("quill", "umbral-icon--sm")} Estándar: ${user.username}`;
      }
      creatorsTabBtn?.classList.add("is-hidden");
      vaultTabBtn?.classList.add("is-hidden");
      railCreatorsBtn?.classList.add("is-hidden");
      railVaultBtn?.classList.add("is-hidden");
      setDrawerState(creatorDrawer, toggleCreatorComposerBtn, false);
      if (creatorsView?.classList.contains("is-active") || vaultView?.classList.contains("is-active")) {
        switchFeedTab("stories-view");
      }
      if (creatorChannelInput) {
        creatorChannelInput.value = "";
        creatorChannelInput.readOnly = false;
      }
    }

    hideLegacyBottomButtons();
    syncPlanSimulationUI();
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

  function syncVipAlertIndicator(mineNotifs = []) {
    if (!vipAlertIndicator) return;
    const vipPosts = loadData(STORAGE_KEYS.creatorPosts, []).filter((p) => Boolean(p.isVipCall));
    const hasUnreadVipNotif = mineNotifs.some((n) => !n.read && n.isVipCallNotif);
    const shouldShow = vipPosts.length > 0 || hasUnreadVipNotif;
    vipAlertIndicator.classList.toggle("is-hidden", !shouldShow);
    vipAlertIndicator.classList.toggle("is-pulsing", hasUnreadVipNotif);
  }

  vipAlertIndicator?.addEventListener("click", () => {
    switchFeedTab("stories-view");
    storiesList.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderNotifications() {
    if (!notificationsList || !notifBadge) return;
    const user = getCurrentUser();
    const mine = user ? loadData(STORAGE_KEYS.notifs, []).filter((n) => n.recipientId === user.id) : [];
    const unreadAll = mine.filter((n) => !n.read);

    syncVipAlertIndicator(mine);

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
      item.className = `notif-item ${n.read ? "" : "is-unread"} ${n.isVipCallNotif ? "is-vip-notif" : ""}`;

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
    renderVaultStories();
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

  function buildAuthorLink(name, avatarUrl, profileHref, isVerifiedCreator = false) {
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

    if (isVerifiedCreator) {
      wrap.appendChild(buildVerifiedBadgeEl());
    }

    return wrap;
  }

  function buildPostBadgesRow(item, options = {}) {
    const audience = item?.audience || "Público";
    const aiLabel = item?.aiLabel || "Sin etiqueta de IA";
    const horrorMood = item?.horrorMood || "";
    const showReadingTime = Boolean(options.showReadingTime);
    const inEarlyAccess = Boolean(options.inEarlyAccess);

    const row = document.createElement("div");
    row.className = "post-badges-row";
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.35rem;";

    if (item?.isVipCall) {
      const vipBadge = document.createElement("span");
      vipBadge.className = "badge umbral-vip-badge";
      vipBadge.append(
        iconEl("crown", "umbral-icon--sm"),
        document.createTextNode(" CONVOCATORIA VIP · FIJADA")
      );
      row.appendChild(vipBadge);
    }

    if (inEarlyAccess) {
      const vaultBadge = document.createElement("span");
      vaultBadge.className = "badge umbral-early-badge";
      vaultBadge.append(
        iconEl("unlock", "umbral-icon--sm"),
        document.createTextNode(` Acceso Anticipado · ${getEarlyAccessRemainingText(item)}`)
      );
      row.appendChild(vaultBadge);
    }

    if (showReadingTime) {
      const reading = estimateReadingTime(item?.content || "");
      const readBadge = document.createElement("span");
      readBadge.className = "badge umbral-reading-badge";
      readBadge.append(
        iconEl("clock", "umbral-icon--sm"),
        document.createTextNode(` ~${reading.minutesRounded} min lectura (${reading.words} pal.)`)
      );
      row.appendChild(readBadge);
    }

    const audBadge = document.createElement("span");
    audBadge.className = "badge";
    audBadge.style.fontSize = "0.75rem";
    audBadge.append(
      iconEl("globe", "umbral-icon--sm"),
      document.createTextNode(` Público: ${audience}`)
    );
    row.appendChild(audBadge);

    if (horrorMood) {
      const moodBadge = document.createElement("span");
      moodBadge.className = "badge post-horror-mood-badge";
      moodBadge.style.fontSize = "0.75rem";
      moodBadge.append(
        iconEl("flame", "umbral-icon--sm"),
        document.createTextNode(` Terror: ${horrorMood}`)
      );
      row.appendChild(moodBadge);
    }

    if (aiLabel && aiLabel !== "Sin etiqueta de IA" && aiLabel !== "Etiqueta de IA desactivada") {
      const aiBadge = document.createElement("span");
      aiBadge.className = "badge";
      aiBadge.style.cssText =
        "font-size:0.75rem;border-color:rgba(167,139,250,0.45);color:#ddd6fe;";
      aiBadge.append(
        iconEl("flame", "umbral-icon--sm"),
        document.createTextNode(` ${aiLabel}`)
      );
      row.appendChild(aiBadge);
    }

    return row;
  }

  function buildSharedBanner(kind, item, currentUser) {
    if (item._entryType !== "shared") return null;

    const banner = document.createElement("div");
    banner.className = "shared-timeline-banner";
    banner.style.cssText =
      "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.45rem;padding:0.45rem 0.7rem;margin-bottom:0.65rem;border-radius:10px;background:rgba(139,92,246,0.12);border:1px solid rgba(167,139,250,0.28);font-size:0.83rem;color:#ddd6fe;";

    const left = document.createElement("div");
    left.style.cssText = "display:inline-flex;flex-wrap:wrap;align-items:center;gap:0.35rem;";

    const isSharerSelf = Boolean(currentUser && item._sharerId === currentUser.id);
    const sharerHref = isSharerSelf
      ? "perfil.html"
      : getProfileUrlForTarget(item._sharerId, item._sharerName);
    const sharerAvatar = lookupAvatarForEntry({
      authorId: item._sharerId,
      name: item._sharerName
    });
    const sharerVerified = isUserVerifiedCreator(item._sharerId, item._sharerName);

    const originalName = kind === "creator" ? item.channel || "Creador" : item.author || "Narrador";
    const isOriginalSelf = Boolean(currentUser && item.authorId === currentUser.id);
    const originalHref = isOriginalSelf
      ? "perfil.html"
      : getProfileUrlForTarget(getTargetKey(item), originalName);
    const originalVerified = isUserVerifiedCreator(item.authorId, originalName, kind === "creator");

    left.append(
      iconEl("megaphone", "umbral-icon--sm umbral-icon--accent"),
      document.createTextNode("Compartido por "),
      buildAuthorLink(item._sharerName, sharerAvatar, sharerHref, sharerVerified),
      document.createTextNode(" · Original de "),
      buildAuthorLink(originalName, "", originalHref, originalVerified)
    );

    const timelineEl = document.createElement("span");
    timelineEl.className = "shared-timeline-stamp";
    timelineEl.style.cssText = "color:#a5b4fc;font-size:0.79rem;font-weight:600;";
    timelineEl.textContent = `Compartido: ${item._shareStamp}`;

    banner.append(left, timelineEl);

    if (item._shareMeta?.note) {
      const noteEl = document.createElement("div");
      noteEl.style.cssText = "width:100%;color:#e9d5ff;font-size:0.84rem;margin-top:0.15rem;";
      noteEl.textContent = `Nota (${item._shareMeta.visibility || "Público"}): “${item._shareMeta.note}”`;
      banner.appendChild(noteEl);
    }

    return banner;
  }

  function refreshAfterPostMutation() {
    renderStories();
    renderVaultStories();
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
        recordShareWithTimeline(kind, postId, user, {
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
        ? `Ya compartiste esta publicación en tu perfil (${formatSharedTimelineStamp(existingMeta)}). Elige dónde o a quién enviarla:`
        : "Al compartir se agregará a tu muro y a tu perfil con su fecha de compartido.";
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

    const { alreadyShared, addedNow } = recordShareWithTimeline(
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
        ? "Listo: ya quedó compartida en tu muro y perfil con su fecha."
        : alreadyShared
          ? "Nota actualizada; conserva la fecha de cuando la compartiste."
          : "Compartido.";
    }
  });

  shareTargetsGrid?.addEventListener("click", async (e) => {
    const btn = e.target.closest?.("[data-share-target]");
    if (!btn || !activeShareModalRef) return;
    const user = getCurrentUser();
    if (!user) return;

    const target = btn.dataset.shareTarget;
    recordShareWithTimeline(activeShareModalRef.kind, activeShareModalRef.id, user, {
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
    } else if (target === "creadores" && isCreatorUser(user)) {
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

  function handleShareAction(kind, postId) {
    const user = getCurrentUser();
    if (!user) return;
    const { post } = findPostRecord(kind, postId);
    if (!post) return;

    if (!hasUserSharedPost(post, user.id)) {
      recordShareWithTimeline(kind, postId, user, { visibility: "Público" });
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
    leftStats.textContent = `${likes.length} me gusta`;

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
      applyFullImageStyle(img);
      postCommentAttachmentPreview.appendChild(img);
    } else if (isDataVideo(draftCommentMedia.video)) {
      const vid = document.createElement("video");
      vid.src = draftCommentMedia.video;
      vid.controls = true;
      vid.playsInline = true;
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
    const user = getCurrentUser();
    if (file.type.startsWith("video/")) {
      const check = await validateVideoFileForUser(file, user);
      if (!check.ok) {
        alert(check.error);
        postCommentFileInput.value = "";
        return;
      }
    } else if (file.size > LIMITS.maxStoryMediaBytes) {
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
    meta.style.cssText = "display:inline-flex;align-items:center;gap:0.3rem;flex-wrap:wrap;";
    meta.append(document.createTextNode(isCreator ? `${authorName}` : `Por ${authorName}`));
    if (isUserVerifiedCreator(post.authorId, authorName, isCreator)) {
      meta.appendChild(buildVerifiedBadgeEl());
    }
    meta.append(
      document.createTextNode(
        isCreator
          ? post.network ? ` · ${post.network}` : ""
          : post.category ? ` · ${post.category}` : ""
      )
    );

    const textEl = document.createElement("p");
    textEl.style.margin = "0.55rem 0 0 0";
    const bodyText = isCreator ? post.message || "" : post.content || "";
    textEl.textContent = bodyText;
    if (
      !isDataImage(post.image) &&
      !hasPlayableVideo(post.video) &&
      post.bgStyle &&
      post.bgStyle !== "none"
    ) {
      applyAaBackgroundStyle(textEl, post.bgStyle, bodyText);
    }

    postBox.append(
      heading,
      meta,
      buildPostBadgesRow(post, {
        showReadingTime: !isCreator,
        inEarlyAccess: !isCreator && isStoryInEarlyAccess(post)
      }),
      textEl
    );

    if (isDataImage(post.image) || hasPlayableVideo(post.video)) {
      const mediaWrap = document.createElement("div");
      mediaWrap.className = "story-media-wrap";
      mediaWrap.style.overflow = "visible";
      mediaWrap.style.height = "auto";
      mediaWrap.style.maxHeight = "none";
      if (isDataImage(post.image)) {
        const img = document.createElement("img");
        img.src = post.image;
        img.alt = heading.textContent;
        img.className = "story-media-img";
        applyFullImageStyle(img);
        mediaWrap.appendChild(img);
      }
      if (hasPlayableVideo(post.video)) {
        const vid = document.createElement("video");
        vid.controls = true;
        vid.playsInline = true;
        vid.preload = "metadata";
        vid.className = "story-media-video";
        hydrateVideoElement(vid, post.video);
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
        cAuthor.style.cssText = "display:inline-flex;align-items:center;gap:0.28rem;";
        cAuthor.textContent = c.authorName || "Usuario";
        if (
          isCreatorUser(c.authorRole) ||
          isUserVerifiedCreator(c.authorId || "", c.authorName || "")
        ) {
          cAuthor.appendChild(buildVerifiedBadgeEl());
        }

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
          applyFullImageStyle(cImg);
          cBody.appendChild(cImg);
        }

        if (hasPlayableVideo(c.video)) {
          const cVid = document.createElement("video");
          cVid.controls = true;
          cVid.playsInline = true;
          cVid.preload = "metadata";
          cVid.className = "post-comment-media";
          hydrateVideoElement(cVid, c.video);
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
    renderVaultStories();
    renderCreatorPosts();
  });

  function setupAccordion(button, drawer, { requireCreator = false, openTabId = null } = {}) {
    if (!button || !drawer) return;
    button.addEventListener("click", () => {
      if (requireCreator) {
        const currentUser = getCurrentUser();
        if (!isCreatorUser(currentUser)) {
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
      !isCreatorUser(user) ||
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
    if (!pendingStoryId || !user || !isCreatorUser(user)) return;

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
    renderVaultStories();
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
    renderVaultStories();
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
      horrorMoodMenuOpen = false;
      syncHorrorMoodUI();
      allPopoverCtrls.forEach((c) => c.setOpen(false));
      if (createPostModal?.classList.contains("is-open")) closeCreatePostModal();
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
    renderVaultStories();
  });

  // --- BLOQUE DE RESERVA (7 DÍAS), DESCARGA DE GUION .TXT Y ENLACES DE PROMOCIÓN ---
  function buildStoryReservationBlock(story, currentUser) {
    const activeRes = getActiveStoryReservation(story);
    const wrap = document.createElement("div");
    wrap.className = "umbral-reservation-box";

    if (activeRes) {
      const statusRow = document.createElement("div");
      statusRow.className = "umbral-reservation-status";
      statusRow.append(
        iconEl("bookmark", "umbral-icon--sm"),
        document.createTextNode(`En producción por ${activeRes.creatorName}`)
      );
      if (isUserVerifiedCreator(activeRes.creatorId, activeRes.creatorName, true)) {
        statusRow.appendChild(buildVerifiedBadgeEl());
      }
      const dateNote = document.createElement("small");
      dateNote.textContent = ` · Reservado el ${activeRes.reservedDateLabel} (vence ${activeRes.expiresDateLabel})`;
      statusRow.appendChild(dateNote);
      wrap.appendChild(statusRow);

      const creatorInfo = resolveUserInfo(activeRes.creatorId, activeRes.creatorName);
      const promoRow = buildPromoLinksEl(
        creatorInfo.promoLinks || activeRes.promoLinks || {},
        `Escucha o sigue a ${activeRes.creatorName}:`
      );
      if (promoRow) wrap.appendChild(promoRow);

      if (isCreatorUser(currentUser) && activeRes.creatorId === currentUser.id) {
        const dlBtn = document.createElement("button");
        dlBtn.type = "button";
        dlBtn.className = "umbral-download-script-btn";
        setButtonContent(dlBtn, "download", "Descargar guion (.txt)");
        dlBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          downloadStoryScriptTxt(story);
        });
        wrap.appendChild(dlBtn);
      } else if (isCreatorUser(currentUser)) {
        const lockedNotice = document.createElement("span");
        lockedNotice.className = "umbral-reservation-locked-pill";
        lockedNotice.append(
          iconEl("lock", "umbral-icon--sm"),
          document.createTextNode(" Reserva bloqueada para otros creadores")
        );
        wrap.appendChild(lockedNotice);
      }
    } else if (isCreatorUser(currentUser)) {
      const reserveBtn = document.createElement("button");
      reserveBtn.type = "button";
      reserveBtn.className = "umbral-reserve-btn";
      setButtonContent(reserveBtn, "bookmark", "Reservar relato (7 días)");
      reserveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const res = reserveStoryRecord(story.id, currentUser);
        if (!res.ok) {
          alert(res.error);
          return;
        }
        renderStories();
        renderVaultStories();
        renderNotifications();
      });
      wrap.appendChild(reserveBtn);
    }

    return wrap.children.length > 0 ? wrap : null;
  }

  // --- TARJETA DE CONVOCATORIA VIP / CREADOR ---
  function buildCreatorPostCard(post, currentUser) {
    const card = document.createElement("article");
    card.className = `story-card ${post.id === lastCreatedPostId ? "story-enter" : ""} ${post.isVipCall ? "is-vip-call" : ""}`;

    const sharedBanner = buildSharedBanner("creator", post, currentUser);
    if (sharedBanner) card.appendChild(sharedBanner);

    const topRow = document.createElement("div");
    topRow.className = "creator-card-top";

    const tag = document.createElement("span");
    tag.className = `creator-tag ${post.isVipCall ? "is-vip-tag" : ""}`;
    tag.style.marginBottom = "0";
    tag.textContent = post.isVipCall ? "Convocatoria VIP · Solicitud de relatos" : post.type;

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
    titleEl.appendChild(buildAuthorLink(post.channel, activeAvatar, profileHref, true));

    const metaEl = document.createElement("div");
    metaEl.className = "story-meta";
    metaEl.appendChild(document.createTextNode(post.network || "Umbral"));

    const messageEl = document.createElement("p");
    messageEl.textContent = post.message;
    if (
      !isDataImage(post.image) &&
      !hasPlayableVideo(post.video) &&
      post.bgStyle &&
      post.bgStyle !== "none"
    ) {
      applyAaBackgroundStyle(messageEl, post.bgStyle, post.message);
    }

    card.append(topRow, titleEl, metaEl, buildPostBadgesRow(post), messageEl);

    if (isDataImage(post.image) || hasPlayableVideo(post.video)) {
      const mediaWrap = document.createElement("div");
      mediaWrap.className = "story-media-wrap";
      mediaWrap.style.overflow = "visible";
      mediaWrap.style.height = "auto";
      mediaWrap.style.maxHeight = "none";
      if (isDataImage(post.image)) {
        const imgEl = document.createElement("img");
        imgEl.src = post.image;
        imgEl.alt = `Imagen de ${post.channel || "creador"}`;
        imgEl.className = "story-media-img";
        applyFullImageStyle(imgEl);
        mediaWrap.appendChild(imgEl);
      }
      if (hasPlayableVideo(post.video)) {
        const vidEl = document.createElement("video");
        vidEl.controls = true;
        vidEl.playsInline = true;
        vidEl.preload = "metadata";
        vidEl.className = "story-media-video";
        hydrateVideoElement(vidEl, post.video);
        mediaWrap.appendChild(vidEl);
      }
      card.appendChild(mediaWrap);
    }

    if (post.isVipCall && !isSelf) {
      const respondBtn = document.createElement("button");
      respondBtn.type = "button";
      respondBtn.className = "umbral-vip-respond-btn";
      setButtonContent(respondBtn, "quill", "Publicar relato para esta Convocatoria VIP");
      respondBtn.addEventListener("click", () => {
        openCreatePostModal({
          title: `Para Convocatoria VIP de ${post.channel}`,
          noticeFlag: `Convocatoria VIP: ${post.channel}`
        });
      });
      card.appendChild(respondBtn);
    }

    card.appendChild(buildPostSocialBlock("creator", post));
    return card;
  }

  // --- CONSTRUCCIÓN DE TARJETA DE RELATO ---
  function buildStoryCardElement(story, currentUser, { isVaultView = false } = {}) {
    const inEarlyAccess = isStoryInEarlyAccess(story);
    const isOwner = Boolean(currentUser && story.authorId === currentUser.id);
    const isLockedForFreeUser =
      !isVaultView && inEarlyAccess && !isCreatorUser(currentUser) && !isOwner;

    if (isLockedForFreeUser) {
      const lockedCard = document.createElement("article");
      lockedCard.className = "story-card umbral-vault-locked-card";

      const lockHead = document.createElement("div");
      lockHead.className = "umbral-vault-lock-head";
      lockHead.innerHTML = `<span class="umbral-vault-lock-icon">${iconHtml("lock", "umbral-icon--sm")}</span><strong>Relato en Bóveda de Acceso Anticipado (24h)</strong>`;

      const lockMeta = document.createElement("div");
      lockMeta.className = "story-meta";
      lockMeta.textContent = `Publicado por ${story.author} · ${story.category} · ${getEarlyAccessRemainingText(story)}`;

      const lockDesc = document.createElement("p");
      lockDesc.className = "umbral-vault-lock-desc";
      lockDesc.textContent =
        "Este relato se encuentra en periodo exclusivo de 24 horas para Creadores Suscritos. Activa tu 1er mes gratis en la Beta para leerlo antes que nadie y reservarlo por 7 días.";

      const lockActions = document.createElement("div");
      lockActions.className = "umbral-vault-lock-actions";

      const goSubLink = document.createElement("a");
      goSubLink.href = "suscripcion.html";
      goSubLink.className = "umbral-unlock-cta-link";
      goSubLink.setAttribute("data-transition-text", "Abriendo Suscripción Creador...");
      setButtonContent(goSubLink, "crown", "Activar 1er mes gratis (Beta)");

      const unlockBtn = document.createElement("button");
      unlockBtn.type = "button";
      unlockBtn.className = "umbral-unlock-cta-btn";
      setButtonContent(unlockBtn, "unlock", "Simular rol creador aquí");
      unlockBtn.addEventListener("click", handlePlanToggleClick);

      lockActions.append(goSubLink, unlockBtn);
      lockedCard.append(lockHead, lockMeta, lockDesc, lockActions);
      return lockedCard;
    }

    const card = document.createElement("article");
    card.className = `story-card ${story.id === lastCreatedStoryId ? "story-enter" : ""}`;

    const sharedBanner = buildSharedBanner("story", story, currentUser);
    if (sharedBanner) card.appendChild(sharedBanner);

    const targetKey = getTargetKey(story);
    const activeAvatar = lookupAvatarForEntry({
      authorId: story.authorId || "",
      name: story.author || "",
      fallbackAvatar: isOwner ? currentUser.avatar || "" : story.authorAvatar || ""
    });
    const profileHref = isOwner ? "perfil.html" : getProfileUrlForTarget(targetKey, story.author);
    const authorVerified = isUserVerifiedCreator(story.authorId, story.author);

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
      buildAuthorLink(story.author, activeAvatar, profileHref, authorVerified),
      document.createTextNode(` · ${story.category}${isOwner ? " · (Tu relato)" : ""}`)
    );

    const contentEl = document.createElement("p");
    contentEl.textContent = story.content;
    if (
      !isDataImage(story.image) &&
      !hasPlayableVideo(story.video) &&
      story.bgStyle &&
      story.bgStyle !== "none"
    ) {
      applyAaBackgroundStyle(contentEl, story.bgStyle, story.content);
    }

    card.append(
      topRow,
      metaEl,
      buildPostBadgesRow(story, { showReadingTime: true, inEarlyAccess }),
      contentEl
    );

    if (isDataImage(story.image) || hasPlayableVideo(story.video)) {
      const mediaWrap = document.createElement("div");
      mediaWrap.className = "story-media-wrap";
      mediaWrap.style.overflow = "visible";
      mediaWrap.style.height = "auto";
      mediaWrap.style.maxHeight = "none";
      if (isDataImage(story.image)) {
        const imgEl = document.createElement("img");
        imgEl.src = story.image;
        imgEl.alt = `Imagen de ${story.title}`;
        imgEl.className = "story-media-img";
        applyFullImageStyle(imgEl);
        mediaWrap.appendChild(imgEl);
      }
      if (hasPlayableVideo(story.video)) {
        const vidEl = document.createElement("video");
        vidEl.controls = true;
        vidEl.playsInline = true;
        vidEl.preload = "metadata";
        vidEl.className = "story-media-video";
        hydrateVideoElement(vidEl, story.video);
        mediaWrap.appendChild(vidEl);
      }
      card.appendChild(mediaWrap);
    }

    const reservationBlock = buildStoryReservationBlock(story, currentUser);
    if (reservationBlock) card.appendChild(reservationBlock);

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
    } else if (isCreatorUser(currentUser)) {
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
        info.style.cssText = "display:inline-flex;align-items:center;gap:0.25rem;flex-wrap:wrap;";
        const creatorAvatar = lookupAvatarForEntry({
          authorId: r.creatorId || "",
          name: r.creator || ""
        });
        if (isDataImage(creatorAvatar)) {
          const cMini = document.createElement("img");
          cMini.src = creatorAvatar;
          cMini.alt = r.creator;
          cMini.className = "mini-avatar";
          cMini.style.marginRight = "0.2rem";
          info.appendChild(cMini);
        }
        info.appendChild(document.createTextNode(r.creator));
        if (isUserVerifiedCreator(r.creatorId, r.creator, true)) {
          info.appendChild(buildVerifiedBadgeEl());
        }
        info.appendChild(
          document.createTextNode(`${r.platform ? ` (${r.platform})` : ""} `)
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
    return card;
  }

  function matchesStoryFilters(s) {
    if (isUserBlocked(getTargetKey(s))) return false;
    if (s._entryType === "shared" && isUserBlocked(s._sharerId)) return false;

    if (searchQuery) {
      const hay = `${s.title} ${s.author} ${s._sharerName || ""} ${s._shareStamp || ""} ${s.category} ${s.audience || ""} ${s.aiLabel || ""} ${s.horrorMood || ""} ${s.content}`
        .toLowerCase();
      if (!hay.includes(searchQuery)) return false;
    }

    if (filterReadingTime !== "all") {
      const reading = estimateReadingTime(s.content || "");
      if (reading.bucket !== filterReadingTime) return false;
    }

    if (filterSubgenre !== "all") {
      const catMatch = (s.category || "").toLowerCase() === filterSubgenre.toLowerCase();
      const moodMatch = (s.horrorMood || "").toLowerCase() === filterSubgenre.toLowerCase();
      if (!catMatch && !moodMatch) return false;
    }

    if (filterStoryStatus !== "all") {
      const isReserved = Boolean(getActiveStoryReservation(s));
      if (filterStoryStatus === "disponible" && isReserved) return false;
      if (filterStoryStatus === "reservado" && !isReserved) return false;
    }

    return true;
  }

  // --- RENDER RELATOS + CONVOCATORIAS VIP FIJADAS ARRIBA ---
  function renderStories() {
    const currentUser = getCurrentUser();
    const vipCalls = loadData(STORAGE_KEYS.creatorPosts, [])
      .filter((p) => Boolean(p.isVipCall) && !isUserBlocked(getTargetKey(p)))
      .filter((p) => {
        if (!searchQuery) return true;
        return `${p.channel} ${p.network} ${p.message}`.toLowerCase().includes(searchQuery);
      });

    const originalStories = loadData(STORAGE_KEYS.stories, []).map((s) => ({
      ...s,
      _entryType: "original"
    }));
    const sharedStories = collectSharedTimelineEntries("story");
    const stories = [...originalStories, ...sharedStories].filter(matchesStoryFilters);

    storiesList.innerHTML = "";

    if (vipCalls.length > 0) {
      const vipSection = document.createElement("div");
      vipSection.className = "umbral-vip-pinned-section";
      vipCalls.forEach((vipPost) => {
        vipSection.appendChild(buildCreatorPostCard(vipPost, currentUser));
      });
      storiesList.appendChild(vipSection);
    }

    if (stories.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent =
        searchQuery || filterReadingTime !== "all" || filterSubgenre !== "all" || filterStoryStatus !== "all"
          ? "No hay relatos que coincidan con los filtros seleccionados."
          : "Aún no hay relatos publicados. ¡Haz clic en la barra superior para escribir el primero!";
      emptyMsg.style.color = "#9aa2b8";
      emptyMsg.style.marginTop = "0.75rem";
      storiesList.appendChild(emptyMsg);
      renderAgreedChatsSidebar();
      return;
    }

    stories.forEach((story) => {
      storiesList.appendChild(buildStoryCardElement(story, currentUser, { isVaultView: false }));
    });

    lastCreatedStoryId = null;
    renderAgreedChatsSidebar();
  }

  // --- RENDER BÓVEDA CREADORES (RELATOS < 24 HORAS) ---
  function renderVaultStories() {
    if (!vaultStoriesList) return;
    const currentUser = getCurrentUser();
    vaultStoriesList.innerHTML = "";

    if (!isCreatorUser(currentUser)) {
      const denied = document.createElement("p");
      denied.style.color = "#fca5a5";
      denied.textContent = "Acceso exclusivo para cuentas con rol creador_suscrito.";
      vaultStoriesList.appendChild(denied);
      return;
    }

    const vaultStories = loadData(STORAGE_KEYS.stories, [])
      .filter((s) => isStoryInEarlyAccess(s) && !isUserBlocked(getTargetKey(s)))
      .filter((s) => {
        if (!searchQuery) return true;
        return `${s.title} ${s.author} ${s.category} ${s.content}`.toLowerCase().includes(searchQuery);
      });

    if (vaultStories.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.style.color = "#9aa2b8";
      emptyMsg.textContent =
        "No hay relatos en Bóveda de Acceso Anticipado (menos de 24h) en este momento.";
      vaultStoriesList.appendChild(emptyMsg);
      return;
    }

    vaultStories.forEach((story) => {
      vaultStoriesList.appendChild(buildStoryCardElement(story, currentUser, { isVaultView: true }));
    });
  }

  // --- RENDER CREADORES ---
  function renderCreatorPosts() {
    if (!creatorPostsList) return;
    const originalPosts = loadData(STORAGE_KEYS.creatorPosts, []).map((p) => ({
      ...p,
      _entryType: "original"
    }));
    const sharedPosts = collectSharedTimelineEntries("creator");

    const posts = [...originalPosts, ...sharedPosts]
      .filter((p) => {
        if (isUserBlocked(getTargetKey(p))) return false;
        if (p._entryType === "shared" && isUserBlocked(p._sharerId)) return false;
        if (!searchQuery) return true;
        return `${p.channel} ${p._sharerName || ""} ${p._shareStamp || ""} ${p.network} ${p.type} ${p.audience || ""} ${p.aiLabel || ""} ${p.horrorMood || ""} ${p.message}`
          .toLowerCase()
          .includes(searchQuery);
      })
      .sort((a, b) => Number(Boolean(b.isVipCall)) - Number(Boolean(a.isVipCall)));

    const currentUser = getCurrentUser();
    creatorPostsList.innerHTML = "";

    if (posts.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = searchQuery
        ? "No hay publicaciones de creadores que coincidan con tu búsqueda."
        : "Aún no hay anuncios de creadores. ¡Usa la barra superior para publicar un adelanto o convocatoria VIP!";
      emptyMsg.style.color = "#9aa2b8";
      creatorPostsList.appendChild(emptyMsg);
      return;
    }

    posts.forEach((post) => {
      creatorPostsList.appendChild(buildCreatorPostCard(post, currentUser));
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

  function clearDraftComposerState() {
    draftStoryImage = "";
    draftStoryVideo = "";
    draftStoryVideoFile = null;
    draftCreatorImage = "";
    draftCreatorVideo = "";
    draftCreatorVideoFile = null;
    draftBgStyle = "none";
    draftHorrorMood = "";
    draftLocationTag = "";
    draftMentionTag = "";
    draftNoticeFlag = "";
    forceCreatorNoveltyMode = false;
    aaPaletteOpen = false;
    horrorMoodMenuOpen = false;
    if (vipCallCheckboxEl) vipCallCheckboxEl.checked = false;
    if (unifiedPostTitleEl) unifiedPostTitleEl.value = "";
    hideFormError(modalVideoErrorEl);
    publishNoveltyOrVideoBtn?.classList.remove("is-active");
    if (storyImageFileInput) storyImageFileInput.value = "";
    if (storyVideoFileInput) storyVideoFileInput.value = "";
    if (creatorImageFileInput) creatorImageFileInput.value = "";
    if (creatorVideoFileInput) creatorVideoFileInput.value = "";
    syncUploadCardState(storyImageCard, storyImageLabel, "", "Opcional · Imagen de apoyo");
    syncUploadCardState(storyVideoCard, storyVideoLabel, "", "Opcional · Clip corto");
    syncUploadCardState(creatorImageCard, creatorImageLabel, "", "Opcional · Máx. 2 MB");
    syncUploadCardState(creatorVideoCard, creatorVideoLabel, "", "Opcional · Máx. 25 MB");
    syncDraftMediaPreview();
    syncCreatorDraftMediaPreview();
    syncAaStyleControls();
    syncHorrorMoodUI();
    syncUnifiedSubmitState();
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const title = byId("title")?.value.trim() || "";
    const content = byId("content")?.value.trim() || "";
    if (!title || !content) return;

    const storyId = crypto.randomUUID();
    let storedVideoRef = "";

    if (draftStoryVideoFile) {
      const dbKey = `idb:story_video_${storyId}`;
      try {
        await saveVideoToMediaDb(dbKey, draftStoryVideoFile);
        storedVideoRef = dbKey;
        if (draftStoryVideo && draftStoryVideo.startsWith("blob:")) {
          mediaBlobUrlCache.set(dbKey, draftStoryVideo);
        }
      } catch (_) {
        const dataUrl = await readFileAsDataUrl(draftStoryVideoFile);
        if (isDataVideo(dataUrl)) storedVideoRef = dataUrl;
      }
    } else if (isDataVideo(draftStoryVideo)) {
      storedVideoRef = draftStoryVideo;
    }

    const hasMedia = Boolean(isDataImage(draftStoryImage) || hasPlayableVideo(storedVideoRef));
    const nowTs = Date.now();

    const newStory = {
      id: storyId,
      authorId: currentUser.id,
      author: currentUser.username,
      authorAvatar: lookupAvatarForEntry({
        authorId: currentUser.id,
        name: currentUser.username,
        fallbackAvatar: currentUser.avatar || ""
      }),
      title,
      category: byId("category")?.value || "Casa / Habitación",
      audience: getSelectedPostAudience(),
      aiLabel: getSelectedPostAiLabel(),
      horrorMood: draftHorrorMood,
      bgStyle: hasMedia ? "none" : draftBgStyle,
      content,
      image: draftStoryImage || "",
      video: storedVideoRef,
      allowCreators: Boolean(byId("allow-creators")?.checked),
      createdAtTs: nowTs,
      earlyAccessUntil: nowTs + EARLY_ACCESS_DURATION_MS,
      reservation: null,
      requests: [],
      likes: [],
      sharedBy: [],
      shareMeta: {},
      sharesCount: 0,
      comments: []
    };

    const stories = loadData(STORAGE_KEYS.stories, []);
    stories.unshift(newStory);
    if (!saveData(STORAGE_KEYS.stories, stories)) {
      stories.shift();
      newStory.image = "";
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
        clearDraftComposerState();
        renderStories();
        renderVaultStories();
        form.reset();
        syncSessionUI();
      }
    );
  });

  createPostModalForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const rawBody =
      (
        unifiedPostTextEl?.value ||
        byId("modal-post-content")?.value ||
        byId("create-post-content")?.value ||
        ""
      ).trim();

    const extraNotes = [];
    if (draftLocationTag) extraNotes.push(`Lugar: ${draftLocationTag}`);
    if (draftMentionTag) extraNotes.push(`Mención: ${draftMentionTag}`);
    if (draftNoticeFlag) extraNotes.push(`Aviso: ${draftNoticeFlag}`);

    const modalContent = [rawBody, ...extraNotes].filter(Boolean).join("\n");
    const modalTitle =
      unifiedPostTitleEl?.value.trim() ||
      byId("modal-post-title")?.value.trim() ||
      byId("create-post-title")?.value.trim() ||
      (rawBody ? rawBody.slice(0, 68) : `Publicación de ${currentUser.username}`);
    const modalCategory =
      unifiedPostSubgenreEl?.value ||
      byId("modal-post-category")?.value ||
      byId("create-post-category")?.value ||
      "Casa / Habitación";
    const modalAllowCreators = Boolean(
      byId("modal-post-allow-creators")?.checked ??
        byId("create-post-allow-creators")?.checked ??
        true
    );

    const activeImage = draftStoryImage || draftCreatorImage || "";
    const activeVideoFile = draftStoryVideoFile || draftCreatorVideoFile || null;
    const activeVideoUrl = draftStoryVideo || draftCreatorVideo || "";
    const hasMedia = Boolean(
      isDataImage(activeImage) || activeVideoFile || hasPlayableVideo(activeVideoUrl)
    );

    if (!modalContent && !hasMedia) return;

    const isVipCallSelected = Boolean(isCreatorUser(currentUser) && vipCallCheckboxEl?.checked);
    const isCreatorVideoNovelty =
      isCreatorUser(currentUser) &&
      (isVipCallSelected ||
        forceCreatorNoveltyMode ||
        Boolean(activeVideoFile || hasPlayableVideo(activeVideoUrl)) ||
        byId("modal-post-type")?.value === "creator-novelty");

    if (isCreatorVideoNovelty) {
      const postId = crypto.randomUUID();
      let storedVideoRef = "";

      if (activeVideoFile) {
        const dbKey = `idb:creator_video_${postId}`;
        try {
          await saveVideoToMediaDb(dbKey, activeVideoFile);
          storedVideoRef = dbKey;
          if (activeVideoUrl && activeVideoUrl.startsWith("blob:")) {
            mediaBlobUrlCache.set(dbKey, activeVideoUrl);
          }
        } catch (_) {
          const dataUrl = await readFileAsDataUrl(activeVideoFile);
          if (isDataVideo(dataUrl)) storedVideoRef = dataUrl;
        }
      } else if (isDataVideo(activeVideoUrl)) {
        storedVideoRef = activeVideoUrl;
      }

      const newPost = {
        id: postId,
        authorId: currentUser.id,
        authorAvatar: lookupAvatarForEntry({
          authorId: currentUser.id,
          name: currentUser.username,
          fallbackAvatar: currentUser.avatar || ""
        }),
        channel: currentUser.username,
        network: currentUser.channel || "Umbral",
        type: isVipCallSelected
          ? "Convocatoria VIP"
          : storedVideoRef
            ? "Video / Estreno"
            : "Novedad de creador",
        isVipCall: isVipCallSelected,
        createdAtTs: Date.now(),
        audience: getSelectedPostAudience(),
        aiLabel: getSelectedPostAiLabel(),
        horrorMood: draftHorrorMood,
        bgStyle: isDataImage(activeImage) || hasPlayableVideo(storedVideoRef) ? "none" : draftBgStyle,
        message: modalContent || modalTitle,
        image: isDataImage(activeImage) ? activeImage : "",
        video: storedVideoRef,
        likes: [],
        sharedBy: [],
        shareMeta: {},
        sharesCount: 0,
        comments: []
      };

      const posts = loadData(STORAGE_KEYS.creatorPosts, []);
      posts.unshift(newPost);
      saveData(STORAGE_KEYS.creatorPosts, posts);

      if (isVipCallSelected) {
        notifyUsersOfVipCall(currentUser, newPost);
      }

      lastCreatedPostId = newPost.id;
      clearDraftComposerState();
      createPostModalForm.reset();
      closeCreatePostModal();
      switchFeedTab(isVipCallSelected ? "stories-view" : "creators-view");
      renderStories();
      renderCreatorPosts();
      renderNotifications();
      return;
    }

    const storyId = crypto.randomUUID();
    let storedVideoRef = "";

    if (activeVideoFile) {
      const dbKey = `idb:story_video_${storyId}`;
      try {
        await saveVideoToMediaDb(dbKey, activeVideoFile);
        storedVideoRef = dbKey;
        if (activeVideoUrl && activeVideoUrl.startsWith("blob:")) {
          mediaBlobUrlCache.set(dbKey, activeVideoUrl);
        }
      } catch (_) {
        const dataUrl = await readFileAsDataUrl(activeVideoFile);
        if (isDataVideo(dataUrl)) storedVideoRef = dataUrl;
      }
    } else if (isDataVideo(activeVideoUrl)) {
      storedVideoRef = activeVideoUrl;
    }

    const nowTs = Date.now();
    const newStory = {
      id: storyId,
      authorId: currentUser.id,
      author: currentUser.username,
      authorAvatar: lookupAvatarForEntry({
        authorId: currentUser.id,
        name: currentUser.username,
        fallbackAvatar: currentUser.avatar || ""
      }),
      title: modalTitle,
      category: modalCategory,
      audience: getSelectedPostAudience(),
      aiLabel: getSelectedPostAiLabel(),
      horrorMood: draftHorrorMood,
      bgStyle: hasMedia ? "none" : draftBgStyle,
      content: modalContent || modalTitle,
      image: activeImage,
      video: storedVideoRef,
      allowCreators: modalAllowCreators,
      createdAtTs: nowTs,
      earlyAccessUntil: nowTs + EARLY_ACCESS_DURATION_MS,
      reservation: null,
      requests: [],
      likes: [],
      sharedBy: [],
      shareMeta: {},
      sharesCount: 0,
      comments: []
    };

    const stories = loadData(STORAGE_KEYS.stories, []);
    stories.unshift(newStory);
    if (!saveData(STORAGE_KEYS.stories, stories)) {
      stories.shift();
      newStory.image = "";
      stories.unshift(newStory);
      saveData(STORAGE_KEYS.stories, stories);
    }

    lastCreatedStoryId = newStory.id;
    clearDraftComposerState();
    createPostModalForm.reset();
    closeCreatePostModal();
    switchFeedTab("stories-view");
    renderStories();
    renderVaultStories();
  });

  creatorPostForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideFormError(creatorPostErrorEl);

    const currentUser = getCurrentUser();
    if (!isCreatorUser(currentUser)) {
      setDrawerState(creatorDrawer, toggleCreatorComposerBtn, false);
      showCreatorRoleWarning();
      return;
    }

    const network = creatorNetworkInput?.value.trim() || "";
    const message = byId("creator-message")?.value.trim() || "";
    const hasImg = isDataImage(draftCreatorImage);
    const hasVid = Boolean(draftCreatorVideoFile || isDataVideo(draftCreatorVideo));

    if (!network || (!message && !hasImg && !hasVid)) {
      showFormError(
        creatorPostErrorEl,
        "Completa la plataforma y escribe un mensaje o adjunta una foto o video."
      );
      return;
    }

    const postId = crypto.randomUUID();
    let storedVideoRef = "";

    if (draftCreatorVideoFile) {
      const dbKey = `idb:creator_video_${postId}`;
      try {
        await saveVideoToMediaDb(dbKey, draftCreatorVideoFile);
        storedVideoRef = dbKey;
        if (draftCreatorVideo && draftCreatorVideo.startsWith("blob:")) {
          mediaBlobUrlCache.set(dbKey, draftCreatorVideo);
        }
      } catch (_) {
        if (draftCreatorVideoFile.size <= LIMITS.maxStoryMediaBytes) {
          const dataUrl = await readFileAsDataUrl(draftCreatorVideoFile);
          if (isDataVideo(dataUrl)) storedVideoRef = dataUrl;
        }
      }
    } else if (isDataVideo(draftCreatorVideo)) {
      storedVideoRef = draftCreatorVideo;
    }

    const hasMedia = Boolean(hasImg || hasPlayableVideo(storedVideoRef));

    const newPost = {
      id: postId,
      authorId: currentUser.id,
      authorAvatar: lookupAvatarForEntry({
        authorId: currentUser.id,
        name: currentUser.username,
        fallbackAvatar: currentUser.avatar || ""
      }),
      channel: currentUser.username,
      network,
      type: byId("creator-post-type")?.value || "Próximo video / Estreno",
      isVipCall: false,
      createdAtTs: Date.now(),
      audience: getSelectedPostAudience(),
      aiLabel: getSelectedPostAiLabel(),
      horrorMood: draftHorrorMood,
      bgStyle: hasMedia ? "none" : draftBgStyle,
      message,
      image: hasImg ? draftCreatorImage : "",
      video: storedVideoRef,
      likes: [],
      sharedBy: [],
      shareMeta: {},
      sharesCount: 0,
      comments: []
    };

    const posts = loadData(STORAGE_KEYS.creatorPosts, []);
    posts.unshift(newPost);
    if (!saveData(STORAGE_KEYS.creatorPosts, posts)) {
      posts.shift();
      newPost.image = "";
      posts.unshift(newPost);
      saveData(STORAGE_KEYS.creatorPosts, posts);
    }

    lastCreatedPostId = newPost.id;
    triggerPublishFeedback(
      publishCreatorBtn,
      creatorDrawer,
      toggleCreatorComposerBtn,
      "megaphone",
      "Publicar en espacio de creadores",
      () => {
        clearDraftComposerState();
        renderCreatorPosts();
        creatorPostForm.reset();
        syncSessionUI();
      }
    );
  });

  if (initialSession) {
    hideLegacyBottomButtons();
    bindFacebookComposerBar();
    bindAaStyleControls();
    syncSessionUI();
    syncAaStyleControls();
    syncHorrorMoodUI();
    syncUnifiedSubmitState();
    setDrawerState(composerDrawer, toggleComposerBtn, false);
    setDrawerState(creatorDrawer, toggleCreatorComposerBtn, false);
    syncCompactSectionLabel("stories-view");
    renderStories();
    renderVaultStories();
    renderCreatorPosts();
    renderNotifications();

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const postParam = params.get("post");
    if (tabParam === "creators-view" && isCreatorUser(initialSession)) {
      switchFeedTab("creators-view");
    } else if (tabParam === "vault-view" && isCreatorUser(initialSession)) {
      switchFeedTab("vault-view");
    }
    if (postParam) {
      const targetKind = tabParam === "creators-view" ? "creator" : "story";
      openPostDetailModal(targetKind, postParam);
    }
  }
}