// --- GESTIÓN DE SUSCRIPCIÓN DE CREADORES (suscripcion.js) ---
(() => {
  const rootEl = byId("subscription-page-root");
  if (!rootEl) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    navigateWithTransition("login.html", "Inicia sesión para gestionar tu suscripción...");
    return;
  }

  persistSession(currentUser);

  const urlParams = new URLSearchParams(window.location.search);
  const isWelcomeBeta = urlParams.get("welcome") === "beta";

  const welcomeBetaBox = byId("sub-beta-welcome-box");
  const userAvatarEl = byId("sub-user-avatar");
  const userNameEl = byId("sub-user-name");
  const userPlanDescEl = byId("sub-user-plan-desc");
  const statusPillEl = byId("sub-status-pill");

  const planCardFree = byId("plan-card-free");
  const planCardCreator = byId("plan-card-creator");
  const cardPriceMainEl = byId("sub-card-price-main");
  const cardPriceSubEl = byId("sub-card-price-sub");
  const btnChooseFree = byId("btn-choose-free");
  const btnScrollCheckout = byId("btn-scroll-checkout");
  const checkoutSection = byId("sub-checkout-section");

  const checkoutTitleEl = byId("sub-checkout-title");
  const checkoutSubtitleEl = byId("sub-checkout-subtitle");
  const checkoutForm = byId("subscription-checkout-form");
  const channelInput = byId("sub-channel-name");
  const youtubeInput = byId("sub-youtube-url");
  const tiktokInput = byId("sub-tiktok-url");
  const spotifyInput = byId("sub-spotify-url");

  const payMethodsContainer = byId("sub-pay-methods");
  const betaFreeOptionEl = byId("sub-beta-free-option");
  const betaFreeInfoEl = byId("sub-beta-free-info");
  const cardFieldsEl = byId("sub-card-fields");
  const summaryLabelEl = byId("sub-summary-label");
  const summaryPriceEl = byId("sub-summary-price");
  const billingNoteEl = byId("sub-billing-note");

  const feedbackEl = byId("sub-form-feedback");
  const cancelPlanBtn = byId("sub-cancel-plan-btn");
  const submitBtn = byId("sub-submit-btn");

  if (welcomeBetaBox && isWelcomeBeta) {
    welcomeBetaBox.classList.remove("is-hidden");
  }

  function getStoredUserRecord(userId) {
    return loadData(STORAGE_KEYS.users, []).find((u) => u.id === userId) || null;
  }

  function saveExtraUserMetadata(userId, patch = {}) {
    const users = loadData(STORAGE_KEYS.users, []);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...patch };
      saveData(STORAGE_KEYS.users, users);
    }
  }

  function renderAvatar(user) {
    if (!userAvatarEl || !user) return;
    userAvatarEl.innerHTML = "";
    const avatarSrc = lookupAvatarForEntry({
      authorId: user.id,
      name: user.username,
      fallbackAvatar: user.avatar || ""
    });
    if (isDataImage(avatarSrc)) {
      const img = document.createElement("img");
      img.src = avatarSrc;
      img.alt = user.username || "Perfil";
      userAvatarEl.appendChild(img);
    } else {
      userAvatarEl.textContent = (user.username || "U").charAt(0).toUpperCase();
    }
  }

  function showSubFeedback(message, isError = false) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.classList.toggle("is-error", isError);
    feedbackEl.classList.toggle("is-success", !isError);
    feedbackEl.style.display = "block";
  }

  function hideSubFeedback() {
    if (feedbackEl) feedbackEl.style.display = "none";
  }

  function getSelectedPayMethod() {
    const checked = checkoutForm?.querySelector('input[name="pay-method"]:checked');
    return checked ? checked.value : "Pase Beta (1er Mes Gratis)";
  }

  function syncPaymentMethodFields(hasUsedBetaFree = false) {
    const selected = getSelectedPayMethod();
    payMethodsContainer?.querySelectorAll(".umbral-pay-option").forEach((label) => {
      const radio = label.querySelector('input[type="radio"]');
      label.classList.toggle("is-selected", Boolean(radio?.checked));
    });

    const isBetaFree = selected === "Pase Beta (1er Mes Gratis)";
    const isCard = selected === "Tarjeta (Simulada)";

    betaFreeInfoEl?.classList.toggle("is-hidden", !isBetaFree);
    cardFieldsEl?.classList.toggle("is-hidden", !isCard);

    if (summaryLabelEl && summaryPriceEl) {
      if (!hasUsedBetaFree && isBetaFree) {
        summaryLabelEl.textContent = "Total hoy (1er mes Beta)";
        summaryPriceEl.textContent = "$0.00 USD";
      } else if (!hasUsedBetaFree) {
        summaryLabelEl.textContent = "1er mes gratis Beta (luego $9.99/mes)";
        summaryPriceEl.textContent = "$0.00 USD hoy";
      } else {
        summaryLabelEl.textContent = "Suscripción Mensual Creador";
        summaryPriceEl.textContent = "$9.99 USD / mes";
      }
    }
  }

  function syncSubscriptionUI() {
    const user = getCurrentUser();
    if (!user) return;

    const isCreator = isCreatorUser(user);
    const fullUserRecord = getStoredUserRecord(user.id) || user;
    const subMeta = fullUserRecord.subscription || null;
    const hasUsedBetaFree = Boolean(fullUserRecord.betaFreeTrialUsed);

    renderAvatar(user);

    if (userNameEl) {
      userNameEl.innerHTML = "";
      userNameEl.appendChild(document.createTextNode(user.username || "Usuario"));
      if (isCreator) {
        userNameEl.appendChild(buildVerifiedBadgeEl("Creador Suscrito Verificado"));
      }
    }

    if (statusPillEl) {
      statusPillEl.textContent = isCreator
        ? subMeta?.isFirstMonthFreeBeta
          ? "creador_suscrito · 1er Mes Beta Gratis"
          : "creador_suscrito · Activo"
        : "usuario_estandar · Gratis";
      statusPillEl.classList.toggle("is-creator", isCreator);
    }

    if (userPlanDescEl) {
      if (isCreator) {
        userPlanDescEl.textContent = subMeta?.isFirstMonthFreeBeta
          ? `Primer mes GRATIS (Versión Beta) activo hasta ${subMeta.nextBillingDate || "30 días"}.`
          : subMeta?.nextBillingDate
            ? `Membresía activa (${subMeta.method || "Mensual"}) · Próxima renovación simulada: ${subMeta.nextBillingDate}`
            : "Tienes todos los beneficios de Creador Suscrito activos.";
      } else {
        userPlanDescEl.textContent = hasUsedBetaFree
          ? "Actualmente usas el plan gratuito. Reactiva tu suscripción cuando quieras."
          : "¡Tu cuenta aún tiene disponible el 1er mes GRATIS de la versión Beta!";
      }
    }

    planCardFree?.classList.toggle("is-current-plan", !isCreator);
    planCardCreator?.classList.toggle("is-current-plan", isCreator);

    if (cardPriceMainEl && cardPriceSubEl) {
      if (!hasUsedBetaFree || subMeta?.isFirstMonthFreeBeta) {
        cardPriceMainEl.textContent = "$0";
        cardPriceSubEl.textContent = "1er mes (Beta) · luego $9.99/mes";
      } else {
        cardPriceMainEl.textContent = "$9.99";
        cardPriceSubEl.textContent = "USD / mes";
      }
    }

    if (betaFreeOptionEl) {
      const betaRadio = betaFreeOptionEl.querySelector('input[type="radio"]');
      if (hasUsedBetaFree && !isCreator) {
        betaFreeOptionEl.classList.add("is-hidden");
        if (betaRadio?.checked) {
          const cardRadio = payMethodsContainer?.querySelector('input[value="Tarjeta (Simulada)"]');
          if (cardRadio) cardRadio.checked = true;
        }
      } else {
        betaFreeOptionEl.classList.remove("is-hidden");
      }
    }

    if (btnChooseFree) {
      btnChooseFree.textContent = !isCreator ? "Plan actual" : "Cambiar a plan gratuito";
      btnChooseFree.disabled = !isCreator;
    }

    if (btnScrollCheckout) {
      btnScrollCheckout.textContent = isCreator
        ? "Gestionar suscripción y enlaces"
        : hasUsedBetaFree
          ? "Reactivar Suscripción Mensual"
          : "Activar 1er Mes Gratis (Beta)";
    }

    if (checkoutTitleEl) {
      checkoutTitleEl.textContent = isCreator
        ? "Tu suscripción de Creador está activa"
        : hasUsedBetaFree
          ? "Reactivar suscripción mensual de Creador"
          : "Activar tu Primer Mes Gratis de Creador (Beta)";
    }

    if (checkoutSubtitleEl) {
      checkoutSubtitleEl.textContent = isCreator
        ? "Puedes actualizar tu canal y tus enlaces promocionales de YouTube, TikTok o Spotify en cualquier momento."
        : hasUsedBetaFree
          ? "Entorno de prototipo: no se realiza ningún cobro real. Activa los beneficios al instante."
          : "Versión Beta: tu primer mes no tiene ningún costo ($0 USD). Configura tu canal y enlaces promocionales ahora.";
    }

    if (channelInput) channelInput.value = user.channel || "";
    if (youtubeInput) youtubeInput.value = user.promoLinks?.youtube || "";
    if (tiktokInput) tiktokInput.value = user.promoLinks?.tiktok || "";
    if (spotifyInput) spotifyInput.value = user.promoLinks?.spotify || "";

    cancelPlanBtn?.classList.toggle("is-hidden", !isCreator);

    if (submitBtn) {
      const span = submitBtn.querySelector("span") || submitBtn;
      span.textContent = isCreator
        ? "Guardar canal y enlaces promocionales"
        : hasUsedBetaFree
          ? "Activar Suscripción ($9.99/mes simulado)"
          : "Activar 1er Mes Gratis (Creador Suscrito)";
    }

    if (billingNoteEl && isCreator && subMeta?.startedAtDate) {
      billingNoteEl.textContent = subMeta.isFirstMonthFreeBeta
        ? `Pase Beta Gratis activo desde ${subMeta.startedAtDate} · Vigente hasta ${subMeta.nextBillingDate}`
        : `Activo desde ${subMeta.startedAtDate} · Próxima renovación: ${subMeta.nextBillingDate || "30 días"}`;
    } else if (billingNoteEl) {
      billingNoteEl.textContent =
        "Después del 1er mes gratis: $9.99 USD/mes (simulado) · Cancela cuando quieras.";
    }

    syncPaymentMethodFields(hasUsedBetaFree && !subMeta?.isFirstMonthFreeBeta);
  }

  function downgradeToFreePlan() {
    hideSubFeedback();
    const user = getCurrentUser();
    if (!user) return;

    const existing = getStoredUserRecord(user.id);
    const updated = {
      ...user,
      role: USER_ROLES.standard
    };

    syncUserAcrossStorage(updated);
    saveExtraUserMetadata(user.id, {
      betaFreeTrialUsed: Boolean(existing?.betaFreeTrialUsed ?? true),
      subscription: {
        status: "cancelled",
        plan: "gratis",
        cancelledAtDate: nowDateLabel()
      }
    });

    updateUserReferencesInPosts(
      updated.id,
      updated.username,
      updated.avatar,
      updated.channel,
      updated.promoLinks
    );

    showSubFeedback(
      "Has vuelto al plan gratuito (usuario_estandar). Tus enlaces y datos siguen guardados por si decides regresar."
    );
    syncSubscriptionUI();
  }

  btnChooseFree?.addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user || !isCreatorUser(user)) return;
    downgradeToFreePlan();
  });

  cancelPlanBtn?.addEventListener("click", downgradeToFreePlan);

  btnScrollCheckout?.addEventListener("click", () => {
    checkoutSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => channelInput?.focus(), 250);
  });

  payMethodsContainer?.addEventListener("change", () => {
    const user = getCurrentUser();
    const full = user ? getStoredUserRecord(user.id) : null;
    syncPaymentMethodFields(Boolean(full?.betaFreeTrialUsed && !full?.subscription?.isFirstMonthFreeBeta));
  });

  checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    hideSubFeedback();

    const user = getCurrentUser();
    if (!user) return;

    const channel = channelInput?.value.trim() || "";
    if (!channel) {
      showSubFeedback("Ingresa el nombre de tu canal o proyecto principal.", true);
      channelInput?.focus();
      return;
    }

    const promoLinks = normalizePromoLinks({
      youtube: youtubeInput?.value || "",
      tiktok: tiktokInput?.value || "",
      spotify: spotifyInput?.value || ""
    });

    const fullUser = getStoredUserRecord(user.id) || user;
    const isFirstFree = !fullUser.betaFreeTrialUsed || Boolean(fullUser.subscription?.isFirstMonthFreeBeta);
    const method = getSelectedPayMethod();
    const nowTs = Date.now();
    const nextMonthTs = nowTs + 30 * 24 * 60 * 60 * 1000;
    const wasAlreadyCreator = isCreatorUser(user);

    const updatedUser = {
      ...user,
      role: USER_ROLES.creator,
      channel,
      promoLinks
    };

    syncUserAcrossStorage(updatedUser);
    saveExtraUserMetadata(user.id, {
      betaFreeTrialUsed: true,
      subscription: {
        status: "active",
        plan: isFirstFree ? "beta-primer-mes-gratis" : "mensual",
        isFirstMonthFreeBeta: isFirstFree,
        priceUsd: isFirstFree ? 0 : 9.99,
        method: isFirstFree ? "Pase Beta (1er Mes Gratis)" : method,
        startedAtTs: fullUser.subscription?.startedAtTs || nowTs,
        startedAtDate: fullUser.subscription?.startedAtDate || nowDateLabel(nowTs),
        nextBillingDate: fullUser.subscription?.nextBillingDate || nowDateLabel(nextMonthTs)
      }
    });

    updateUserReferencesInPosts(
      updatedUser.id,
      updatedUser.username,
      updatedUser.avatar,
      updatedUser.channel,
      updatedUser.promoLinks
    );

    if (!wasAlreadyCreator) {
      const notifs = loadData(STORAGE_KEYS.notifs, []);
      notifs.unshift({
        id: crypto.randomUUID(),
        recipientId: updatedUser.id,
        text: isFirstFree
          ? "¡Primer mes Beta GRATIS activado! Ya tienes insignia verificada, Bóveda 24h, Reservas y Convocatorias VIP."
          : "¡Suscripción Creador VIP activada! Ya tienes todos los beneficios desbloqueados.",
        preview: `Canal: ${channel}`,
        iconName: "crown",
        read: false,
        createdAt: nowTimeLabel()
      });
      saveData(STORAGE_KEYS.notifs, notifs);
    }

    syncSubscriptionUI();
    showSubFeedback(
      wasAlreadyCreator
        ? "Canal y enlaces promocionales guardados correctamente."
        : isFirstFree
          ? "¡Primer mes Beta GRATIS activado! Ya eres creador_suscrito con todos los beneficios."
          : "¡Suscripción activada! Ya eres creador_suscrito con insignia verificada y Bóveda 24h."
    );
  });

  syncSubscriptionUI();
})();