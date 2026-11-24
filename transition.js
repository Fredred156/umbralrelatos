(() => {
  const OVERLAY_ID = "umbral-transition";
  const TEXT_ID = "umbral-transition-text";
  const EXIT_CURTAIN_ID = "umbral-exit-curtain";
  const EXIT_QUOTE_ID = "umbral-exit-quote";
  const DIAG_OVERLAY_ID = "umbral-edit-diagonal-transition";
  const DELAY_MS = 340;
  const EXIT_DELAY_MS = 920;
  const DIAG_DELAY_MS = 650;

  const RETURN_HORROR_QUOTES = [
    "Vuelve pronto...",
    "Las sombras te esperan.",
    "No tardes en volver.",
    "La penumbra no olvida.",
    "Regresa cuando caiga la noche."
  ];

  function isEditProfileUrl(url = "") {
    return String(url).toLowerCase().includes("editar-perfil.html");
  }

  function ensureExitCurtain() {
    let curtain = document.getElementById(EXIT_CURTAIN_ID);
    if (curtain) return curtain;

    curtain = document.createElement("div");
    curtain.id = EXIT_CURTAIN_ID;
    curtain.className = "umbral-exit-curtain";
    curtain.setAttribute("aria-hidden", "true");
    curtain.innerHTML = `
      <div class="umbral-curtain-panel is-top"></div>
      <div class="umbral-curtain-panel is-bottom"></div>
      <div class="umbral-exit-message-wrap">
        <div>
          <p id="${EXIT_QUOTE_ID}" class="umbral-exit-quote"></p>
          <span class="umbral-exit-sub">Umbral</span>
        </div>
      </div>
    `;
    document.body.appendChild(curtain);
    return curtain;
  }

  function ensureEditDiagonalOverlay(message = "Abriendo editor de perfil...") {
    let overlay = document.getElementById(DIAG_OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = DIAG_OVERLAY_ID;
      overlay.className = "umbral-diag-transition";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = `
        <div class="umbral-diag-curtain"></div>
        <div class="umbral-diag-center">
          <div class="umbral-u-logo-mark" aria-label="Logo provisional Umbral">
            <span>U</span>
          </div>
          <p class="umbral-diag-label">${message}</p>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      const label = overlay.querySelector(".umbral-diag-label");
      if (label && message) label.textContent = message;
    }
    return overlay;
  }

  function pickHorrorQuote() {
    const idx = Math.floor(Math.random() * RETURN_HORROR_QUOTES.length);
    return RETURN_HORROR_QUOTES[idx];
  }

  function showTransition(message = "Abriendo el umbral...") {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    const label = document.getElementById(TEXT_ID);
    if (label && message) label.textContent = message;

    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
  }

  function hideTransition() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.setAttribute("aria-hidden", "true");
    }

    const curtain = document.getElementById(EXIT_CURTAIN_ID);
    if (curtain) {
      curtain.classList.remove("is-closing");
      curtain.setAttribute("aria-hidden", "true");
    }

    const diagOverlay = document.getElementById(DIAG_OVERLAY_ID);
    if (diagOverlay) {
      diagOverlay.classList.remove("is-closing", "is-active");
      if (isEditProfileUrl(window.location.pathname)) {
        diagOverlay.classList.add("is-entering");
        diagOverlay.classList.remove("is-entered");
        diagOverlay.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            diagOverlay.classList.remove("is-entering");
            diagOverlay.classList.add("is-entered");
          });
        });
      } else {
        diagOverlay.classList.remove("is-entering", "is-entered");
        diagOverlay.setAttribute("aria-hidden", "true");
      }
    }
  }

  function exitToLogin(url = "login.html") {
    const curtain = ensureExitCurtain();
    const quoteEl = document.getElementById(EXIT_QUOTE_ID);
    if (quoteEl) {
      quoteEl.textContent = pickHorrorQuote();
    }

    curtain.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        curtain.classList.add("is-closing");
      });
    });

    window.setTimeout(() => {
      window.location.href = url;
    }, EXIT_DELAY_MS);
  }

  function runEditDiagonalTransition(url, message = "Abriendo editor de perfil...") {
    const diagOverlay = ensureEditDiagonalOverlay(message);
    diagOverlay.classList.remove("is-entering", "is-entered");
    diagOverlay.classList.add("is-closing");
    diagOverlay.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        diagOverlay.classList.add("is-active");
      });
    });

    window.setTimeout(() => {
      window.location.href = url;
    }, DIAG_DELAY_MS);
  }

  function goToPage(url, message = "Abriendo el umbral...") {
    if (url.toLowerCase().includes("login.html")) {
      exitToLogin(url);
      return;
    }

    const leavingEditProfile = isEditProfileUrl(window.location.pathname) && !isEditProfileUrl(url);
    const enteringEditProfile = !isEditProfileUrl(window.location.pathname) && isEditProfileUrl(url);

    if (leavingEditProfile || enteringEditProfile) {
      const diagMessage =
        message && message !== "Abriendo el umbral..."
          ? message
          : enteringEditProfile
            ? "Abriendo editor de perfil..."
            : "Cerrando editor de perfil...";
      runEditDiagonalTransition(url, diagMessage);
      return;
    }

    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      window.location.href = url;
      return;
    }

    showTransition(message);
    window.setTimeout(() => {
      window.location.href = url;
    }, DELAY_MS);
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (isEditProfileUrl(window.location.pathname)) {
      const diagOverlay = ensureEditDiagonalOverlay("Abriendo editor de perfil...");
      diagOverlay.classList.add("is-entering");
      diagOverlay.classList.remove("is-entered", "is-closing", "is-active");
      diagOverlay.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          diagOverlay.classList.remove("is-entering");
          diagOverlay.classList.add("is-entered");
        });
      });
    }
  });

  window.addEventListener("pageshow", hideTransition);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.target === "_blank" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch {
      return;
    }

    if (targetUrl.origin !== window.location.origin) return;
    if (
      targetUrl.pathname === window.location.pathname &&
      targetUrl.search === window.location.search &&
      targetUrl.hash
    ) {
      return;
    }

    event.preventDefault();
    const customLabel = link.dataset.transitionText || "Abriendo el umbral...";
    goToPage(targetUrl.href, customLabel);
  });

  window.umbralTransition = {
    show: showTransition,
    hide: hideTransition,
    go: goToPage,
    exitToLogin,
    editDiagonal: runEditDiagonalTransition
  };
})();