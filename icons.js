(() => {
  const SVG_ATTRS =
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  const UMBRAL_ICONS = {
    search: `<svg ${SVG_ATTRS}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`,
    scroll: `<svg ${SVG_ATTRS}><path d="M8 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8"></path><path d="M8 4v4H4"></path><path d="M8 12h8"></path><path d="M8 16h5"></path></svg>`,
    film: `<svg ${SVG_ATTRS}><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 5v14"></path><path d="M17 5v14"></path><path d="M3 10h4"></path><path d="M17 10h4"></path><path d="M3 14h4"></path><path d="M17 14h4"></path></svg>`,
    bell: `<svg ${SVG_ATTRS}><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"></path><path d="M9.5 17a2.5 2.5 0 0 0 5 0"></path></svg>`,
    gear: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    user: `<svg ${SVG_ATTRS}><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg>`,
    edit: `<svg ${SVG_ATTRS}><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"></path></svg>`,
    chat: `<svg ${SVG_ATTRS}><path d="M21 12a8 8 0 0 1-8 8H4l2.2-3.3A8 8 0 1 1 21 12Z"></path></svg>`,
    logout: `<svg ${SVG_ATTRS}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path></svg>`,
    quill: `<svg ${SVG_ATTRS}><path d="M20 4c-6 0-12 4-14 11l-2 5 5-2c7-2 11-8 11-14Z"></path><path d="m14 10-8 8"></path></svg>`,
    mic: `<svg ${SVG_ATTRS}><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path><path d="M8 21h8"></path></svg>`,
    eye: `<svg ${SVG_ATTRS}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    flame: `<svg ${SVG_ATTRS}><path d="M12 3c2.5 3 4 5.2 4 8a4 4 0 1 1-8 0c0-1.7.7-3.2 2-4.8-.2 2 .8 3.2 2 3.2 1.1 0 2-.9 2-2.2 0-1.6-.8-2.9-2-4.2Z"></path></svg>`,
    star: `<svg ${SVG_ATTRS}><polygon points="12 3 14.9 8.9 21.4 9.8 16.7 14.4 17.8 20.9 12 17.8 6.2 20.9 7.3 14.4 2.6 9.8 9.1 8.9 12 3"></polygon></svg>`,
    users: `<svg ${SVG_ATTRS}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    lock: `<svg ${SVG_ATTRS}><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>`,
    unlock: `<svg ${SVG_ATTRS}><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.4-2"></path></svg>`,
    ban: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"></circle><path d="m5.6 5.6 12.8 12.8"></path></svg>`,
    globe: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 0 0 18"></path><path d="M12 3a14 14 0 0 1 0 18"></path></svg>`,
    check: `<svg ${SVG_ATTRS}><path d="m5 12 4.5 4.5L19 7"></path></svg>`,
    close: `<svg ${SVG_ATTRS}><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg>`,
    pin: `<svg ${SVG_ATTRS}><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path></svg>`,
    megaphone: `<svg ${SVG_ATTRS}><path d="m3 11 14-5v12L3 13v-2Z"></path><path d="M17 9a3 3 0 0 1 0 6"></path><path d="M7 14.5 9 20h3l-1-5.5"></path></svg>`,
    verified: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12.2 2.3 2.3 4.7-4.8"></path></svg>`,
    crown: `<svg ${SVG_ATTRS}><path d="m3 17 2-9 4.5 4L12 5l2.5 7L19 8l2 9Z"></path><path d="M4 20h16"></path></svg>`,
    download: `<svg ${SVG_ATTRS}><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M4 20h16"></path></svg>`,
    clock: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
    bookmark: `<svg ${SVG_ATTRS}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"></path></svg>`,
    youtube: `<svg ${SVG_ATTRS}><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"></rect><polygon points="10 9.5 15.5 12 10 14.5 10 9.5"></polygon></svg>`,
    tiktok: `<svg ${SVG_ATTRS}><path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.46"></path><path d="M14 4c1 2.2 2.8 3.5 5 3.8"></path></svg>`,
    spotify: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"></circle><path d="M7.5 10c3-.9 6.5-.6 9 .7"></path><path d="M8.5 13c2.4-.7 5.2-.4 7.2.6"></path><path d="M9.5 15.8c1.7-.5 3.7-.3 5.2.5"></path></svg>`
  };

  function createUmbralIcon(name, extraClass = "") {
    const span = document.createElement("span");
    span.className = `umbral-icon ${extraClass}`.trim();
    span.innerHTML = UMBRAL_ICONS[name] || UMBRAL_ICONS.flame;
    return span;
  }

  function umbralIconHtml(name, extraClass = "") {
    const svgMarkup = UMBRAL_ICONS[name] || UMBRAL_ICONS.flame;
    return `<span class="umbral-icon ${extraClass}">${svgMarkup}</span>`;
  }

  window.UMBRAL_ICONS = UMBRAL_ICONS;
  window.createUmbralIcon = createUmbralIcon;
  window.umbralIconHtml = umbralIconHtml;
})();