/* Instagram sharing kit. Edit this config when a partner campaign is confirmed. */
(() => {
  'use strict';

  const SHARE_CONFIG = {
    campaign: 'instagram_challenge',
    url: 'https://www.pickleballrulesquiz.com/',
    instagramUrl: 'https://www.instagram.com/',
    formats: {
      feed: { width: 1080, height: 1350 },
      square: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 }
    },
    copy: {
      en: {
        title: 'Prepare an Instagram post',
        intro: 'Choose a format, then save the image and copy the caption for Instagram.',
        nativeButton: 'Share from my phone',
        copyButton: 'Copy caption',
        downloadButton: 'Download image',
        openButton: 'Open Instagram',
        note: 'Instagram may ask you to add the image and caption separately.',
        previewLabel: 'Preview',
        formatLabelText: 'Image format',
        feedFormat: 'Feed 4:5',
        squareFormat: 'Square 1:1',
        storyFormat: 'Story 9:16',
        formatLabel: 'Choose an Instagram image format',
        captionTitle: 'Caption',
        backLink: 'Back to challenge',
        posterLink: 'Poster',
        navLabel: 'Share navigation',
        captionAria: 'Instagram caption',
        statusCopied: 'Caption copied.',
        statusDownloaded: 'Image downloaded.',
        statusShared: 'Share sheet opened.',
        statusFallback: 'Sharing is unavailable. Download the image and copy the caption below.',
        statusCopyFailed: 'Copy the selected caption manually.',
        statusImageFailed: 'Could not prepare the image. Try again.',
        canvasKicker: 'PICKLEBALL RULES CHALLENGE',
        canvasTitle: 'THINK YOU KNOW\nTHE RULES?',
        canvasBody: 'Get an explanation after every answer.',
        canvasCta: 'TRY 2 GAMES FREE',
        canvasUrl: 'pickleballrulesquiz.com',
        canvasFooter: 'Based on the USA Pickleball rulebook',
        caption: 'Think you know the pickleball rules?\n\nTry the Pickleball Rules Challenge and get an explanation after every answer.\n\nTry 2 games free. No signup required.\n\n{url}'
      },
      fr: {
        title: 'Préparer un post Instagram',
        intro: "Choisissez un format, puis enregistrez l’image et copiez la légende pour Instagram.",
        nativeButton: 'Partager depuis mon téléphone',
        copyButton: 'Copier la légende',
        downloadButton: "Télécharger l'image",
        openButton: 'Ouvrir Instagram',
        note: "Instagram peut vous demander d'ajouter l'image et la légende séparément.",
        previewLabel: 'Aperçu',
        formatLabelText: "Format de l'image",
        feedFormat: 'Fil 4:5',
        squareFormat: 'Carré 1:1',
        storyFormat: 'Story 9:16',
        formatLabel: 'Choisissez un format d’image Instagram',
        captionTitle: 'Légende',
        backLink: 'Retour au défi',
        posterLink: 'Affiche',
        navLabel: 'Navigation du partage',
        captionAria: 'Légende Instagram',
        statusCopied: 'Légende copiée.',
        statusDownloaded: 'Image téléchargée.',
        statusShared: 'Menu de partage ouvert.',
        statusFallback: "Le partage est indisponible. Téléchargez l’image et copiez la légende.",
        statusCopyFailed: 'Copiez manuellement la légende sélectionnée.',
        statusImageFailed: 'Impossible de préparer l’image. Réessayez.',
        canvasKicker: 'DÉFI DES RÈGLES DU PICKLEBALL',
        canvasTitle: 'VOUS CONNAISSEZ\nLES RÈGLES ?',
        canvasBody: 'Une explication après chaque réponse.',
        canvasCta: '2 PARTIES GRATUITES',
        canvasUrl: 'pickleballrulesquiz.com/fr.html',
        canvasFooter: 'Basé sur le règlement USA Pickleball',
        caption: 'Vous connaissez les règles du pickle ?\n\nEssayez le Défi des règles du pickle et découvrez une explication après chaque réponse.\n\n2 parties gratuites. Sans inscription.\n\n{url}'
      }
    }
  };

  const locale = new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en';
  const copy = SHARE_CONFIG.copy[locale];
  const targetUrl = locale === 'fr' ? `${SHARE_CONFIG.url}fr.html` : SHARE_CONFIG.url;
  const campaignUrl = `${targetUrl}?utm_source=instagram&utm_medium=organic_social&utm_campaign=${SHARE_CONFIG.campaign}`;
  let selectedFormat = 'feed';
  let brandLogo = null;
  let imageFile = null;
  let imageJob = null;

  function setText(name, value) {
    const element = document.querySelector(`[data-share="${name}"]`);
    if (element) element.textContent = value;
  }

  function setAria(name, value) {
    document.querySelectorAll(`[data-share-aria="${name}"]`).forEach((element) => {
      element.setAttribute('aria-label', value);
    });
  }

  function track(action) {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({
          path: `event/instagram-share/${action}/${locale}`,
          title: `instagram_share | action=${action} | lang=${locale}`,
          event: true
        });
      }
    } catch (_) { /* optional analytics */ }
  }

  function wrapLines(ctx, text, maxWidth) {
    return String(text || '').split('\n').flatMap((paragraph) => {
      if (!paragraph) return [''];
      const words = paragraph.split(' ');
      const lines = [];
      let line = '';
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      if (line) lines.push(line);
      return lines;
    });
  }

  function drawText(ctx, text, x, y, maxWidth, lineHeight) {
    wrapLines(ctx, text, maxWidth).forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
  }

  function renderCanvas() {
    const canvas = document.getElementById('instagram-art');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const format = SHARE_CONFIG.formats[selectedFormat];
    const width = format.width;
    const height = format.height;
    const offset = (height - 1080) / 2;
    canvas.width = width;
    canvas.height = height;

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#07172d');
    background.addColorStop(1, '#103d57');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(822, offset + 460);
    ctx.rotate(-0.35);
    ctx.strokeStyle = '#7dd3fc40';
    ctx.lineWidth = 6;
    ctx.strokeRect(-180, -310, 360, 620);
    ctx.strokeRect(-180, -84, 360, 168);
    ctx.beginPath();
    ctx.moveTo(0, -310);
    ctx.lineTo(0, -84);
    ctx.moveTo(0, 84);
    ctx.lineTo(0, 310);
    ctx.stroke();
    ctx.restore();

    const panelY = 115 + offset;
    const lime = '#d9fa73';
    ctx.beginPath();
    ctx.arc(895, panelY + 605, 72, 0, 2 * Math.PI);
    ctx.fillStyle = lime;
    ctx.fill();
    ctx.fillStyle = '#31523a';
    for (const [x, y, radius] of [
      [-28, -22, 9], [5, -37, 8], [39, -15, 8],
      [-37, 13, 8], [-3, 0, 10], [29, 21, 9], [-13, 36, 8]
    ]) {
      ctx.beginPath();
      ctx.arc(895 + x, panelY + 605 + y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (brandLogo) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(88, panelY + 34, 104, 104);
      ctx.drawImage(brandLogo, 96, panelY + 42, 88, 88);
    }

    ctx.fillStyle = '#cfe7f5';
    ctx.font = '800 26px Arial, sans-serif';
    ctx.fillText(copy.canvasKicker, brandLogo ? 230 : 88, panelY + 96);

    ctx.fillStyle = '#fff';
    ctx.font = '900 86px Arial, sans-serif';
    drawText(ctx, copy.canvasTitle, 88, panelY + 295, 904, 100);

    ctx.fillStyle = '#cfe7f5';
    ctx.font = '700 34px Arial, sans-serif';
    drawText(ctx, copy.canvasBody, 88, panelY + 490, 904, 48);

    ctx.fillStyle = '#145c85';
    ctx.fillRect(88, panelY + 545, 470, 76);
    ctx.fillStyle = '#fff';
    ctx.font = '900 30px Arial, sans-serif';
    ctx.fillText(copy.canvasCta, 116, panelY + 594);

    ctx.fillStyle = '#fff';
    ctx.font = '800 31px Arial, sans-serif';
    ctx.fillText(copy.canvasUrl, 88, panelY + 710);
    ctx.fillStyle = '#cfe7f5';
    ctx.font = '600 24px Arial, sans-serif';
    ctx.fillText(copy.canvasFooter, 88, panelY + 754);
    prepareImage(canvas);
  }

  function prepareImage(canvas) {
    const name = `pickleball-rules-challenge-${selectedFormat}-${locale}.png`;
    imageFile = null;
    const job = new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      .then((blob) => blob ? new File([blob], name, { type: 'image/png' }) : null)
      .catch(() => null);
    imageJob = job;
    job.then((file) => {
      if (imageJob === job) imageFile = file;
    });
  }

  async function copyCaption() {
    const caption = document.getElementById('instagram-caption')?.value || '';
    try {
      await navigator.clipboard.writeText(caption);
    } catch (_) {
      const field = document.getElementById('instagram-caption');
      field.focus();
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) {}
      if (!copied) {
        setText('status', copy.statusCopyFailed);
        return;
      }
    }
    setText('status', copy.statusCopied);
    track('copy-caption');
  }

  async function downloadImage() {
    const file = await imageJob;
    if (!file) {
      setText('status', copy.statusImageFailed);
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    const objectUrl = link.href;
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setText('status', copy.statusDownloaded);
    track('download-image');
  }

  async function nativeShare() {
    const payload = {
      title: locale === 'fr' ? 'Défi des règles du pickle' : 'Pickleball Rules Challenge',
      text: document.getElementById('instagram-caption').value,
      files: imageFile ? [imageFile] : []
    };
    try {
      if (!imageFile || !navigator.canShare?.(payload)) {
        setText('status', copy.statusFallback);
        track('instagram-fallback');
        return;
      }
      await navigator.share(payload);
      setText('status', copy.statusShared);
      track('native-share');
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      setText('status', copy.statusFallback);
      track('instagram-fallback');
    }
  }

  function init() {
    document.documentElement.lang = locale;
    document.title = locale === 'fr' ? 'Partager le Défi des règles du pickle' : 'Share Pickleball Rules Challenge';
    setText('title', copy.title);
    setText('intro', copy.intro);
    setText('nativeButton', copy.nativeButton);
    setText('copyButton', copy.copyButton);
    setText('downloadButton', copy.downloadButton);
    setText('openButton', copy.openButton);
    setText('note', copy.note);
    setText('previewLabel', copy.previewLabel);
    setText('formatLabelText', copy.formatLabelText);
    setText('feedFormat', copy.feedFormat);
    setText('squareFormat', copy.squareFormat);
    setText('storyFormat', copy.storyFormat);
    setText('captionTitle', copy.captionTitle);
    setText('backLink', copy.backLink);
    setText('posterLink', copy.posterLink);
    setAria('navLabel', copy.navLabel);
    setAria('formatLabel', copy.formatLabel);
    setAria('captionAria', copy.captionAria);
    setAria('previewImage', `${copy.canvasTitle.replace('\n', ' ')} ${copy.canvasBody} ${copy.canvasCta}`);
    const instagramLink = document.querySelector('[data-share="instagramLink"]');
    if (instagramLink) instagramLink.href = SHARE_CONFIG.instagramUrl;
    if (locale === 'fr') {
      document.querySelector('[data-share="backLink"]').href = './fr.html';
      document.querySelector('[data-share="posterLink"]').href = './poster/?lang=fr';
    }
    const caption = document.getElementById('instagram-caption');
    if (caption) caption.value = copy.caption.replace('{url}', campaignUrl);
    const logo = new Image();
    logo.onload = () => {
      brandLogo = logo;
      renderCanvas();
    };
    logo.src = './icons/brand-logo-512.png';
    renderCanvas();
    document.querySelectorAll('[data-format]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedFormat = button.getAttribute('data-format') || 'feed';
        document.querySelectorAll('[data-format]').forEach((option) => {
          const selected = option === button;
          option.classList.toggle('is-selected', selected);
          option.setAttribute('aria-pressed', String(selected));
        });
        renderCanvas();
        track(`format-${selectedFormat}`);
      });
    });
    document.querySelector('[data-action="copy-caption"]')?.addEventListener('click', copyCaption);
    document.querySelector('[data-action="download-image"]')?.addEventListener('click', downloadImage);
    const nativeButton = document.querySelector('[data-action="native-share"]');
    nativeButton.hidden = typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function';
    nativeButton.addEventListener('click', nativeShare);
    document.querySelector('[data-action="open-instagram"]')?.addEventListener('click', () => track('open-instagram'));
    track('open');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
