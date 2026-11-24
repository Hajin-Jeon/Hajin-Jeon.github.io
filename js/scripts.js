(() => {
  // Theme toggle (respects system preference unless manually overridden)
  const themeToggle = document.getElementById('themeToggle');
  const darkMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const getEffectiveTheme = () => {
    const explicit = document.documentElement.dataset.theme;
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return darkMedia && darkMedia.matches ? 'dark' : 'light';
  };

  const syncToggleLabel = () => {
    if (!themeToggle) return;
    const isDark = getEffectiveTheme() === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeToggle.setAttribute('aria-pressed', String(isDark));
  };

  if (themeToggle) {
    syncToggleLabel();
    themeToggle.addEventListener('click', () => {
      const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch {
        // Ignore storage restrictions
      }
      syncToggleLabel();
    });
    if (darkMedia && typeof darkMedia.addEventListener === 'function') {
      darkMedia.addEventListener('change', syncToggleLabel);
    }
  }

  // Toggle inline BibTeX blocks
  document.querySelectorAll('[data-bibtex-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-bibtex-target');
      const panel = document.getElementById(targetId);
      if (!panel) return;

      const isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Copy BibTeX snippet to clipboard
  document.querySelectorAll('[data-copy-bibtex]').forEach((button) => {
    button.addEventListener('click', async () => {
      const codeId = button.getAttribute('data-copy-bibtex');
      const codeEl = document.getElementById(codeId);
      if (!codeEl) return;

      const text = codeEl.textContent || '';
      const originalLabel = button.textContent;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
        }
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = originalLabel;
        }, 1600);
      } catch {
        button.textContent = 'Copy failed';
        setTimeout(() => {
          button.textContent = originalLabel;
        }, 1600);
      }
    });
  });

  // Native <dialog> lightbox for publication figures
  const dialog = document.getElementById('figureDialog');
  const dialogImg = document.getElementById('figureDialogImg');
  const dialogCaption = document.getElementById('figureDialogCaption');
  const dialogClose = document.getElementById('figureDialogClose');

  if (!dialog || !dialogImg || !dialogCaption || !dialogClose) return;

  document.querySelectorAll('[data-figure-src]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-figure-src');
      const caption = trigger.getAttribute('data-figure-caption') || '';
      if (!src) return;

      dialogImg.src = src;
      dialogImg.alt = caption;
      dialogCaption.textContent = caption;

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        window.open(src, '_blank', 'noopener,noreferrer');
      }
    });
  });

  dialogClose.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    dialogImg.removeAttribute('src');
    dialogImg.alt = '';
  });
})();
