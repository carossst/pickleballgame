/* Instagram sharing kit. Edit this config when a partner campaign is confirmed. */
(() => {
  'use strict';

  const SHARE_CONFIG = {
    campaign: 'instagram_challenge',
    url: 'https://www.pickleballrulesquiz.com/',
    instagramUrl: 'https://www.instagram.com/',
    formats: {
      feed: { width: 1080, height: 1350, fileSuffix: 'feed-4x5' },
      square: { width: 1080, height: 1080, fileSuffix: 'square' },
      story: { width: 1080, height: 1920, fileSuffix: 'story-9x16' }
    },
    colors: {
      ink: '#0f172a',
      accent: '#075985',
      sky: '#38bdf8',
      paper: '#ffffff',
      muted: '#475569'
    },
    copy: {
      en: {
        eyebrow: 'Ready to share',
        title: 'Prepare an Instagram post',
        intro: 'Download a ready made image, copy the caption, and share the challenge with your friends.',
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
        statusFallback: 'Caption copied. Add the image on Instagram.',
        canvasKicker: 'PICKLEBALL RULES CHALLENGE',
        canvasTitle: 'THINK YOU KNOW\nTHE RULES?',
        canvasBody: 'Three mistakes and the challenge ends.',
        canvasCta: 'TRY 2 GAMES FREE',
        canvasUrl: 'pickleballrulesquiz.com',
        caption: 'Think you know the pickleball rules?\n\nTry the Pickleball Rules Challenge. Three mistakes and the challenge ends.\n\nTry 2 games free. No signup required.\n\n{url}'
      },
      fr: {
        eyebrow: 'Prêt à partager',
        title: 'Préparer un post Instagram',
        intro: "Téléchargez une image prête à publier, copiez la légende et partagez le défi avec vos amis.",
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
        statusFallback: "Légende copiée. Ajoutez l'image sur Instagram.",
        canvasKicker: 'DÉFI DES RÈGLES DU PICKLEBALL',
        canvasTitle: 'VOUS CONNAISSEZ\nLES RÈGLES ?',
        canvasBody: 'Trois erreurs et le défi s’arrête.',
        canvasCta: '2 PARTIES GRATUITES',
        canvasUrl: 'pickleballrulesquiz.com/fr.html',
        caption: 'Vous connaissez les règles du pickleball ?\n\nEssayez le Défi des règles du pickleball. Trois erreurs et le défi s’arrête.\n\n2 parties gratuites. Sans inscription.\n\n{url}'
      }
    }
  };

  const locale = new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en';
  const copy = SHARE_CONFIG.copy[locale];
  const targetUrl = locale === 'fr' ? `${SHARE_CONFIG.url}fr.html` : SHARE_CONFIG.url;
  const campaignUrl = `${targetUrl}?utm_source=instagram&utm_medium=organic_social&utm_campaign=${SHARE_CONFIG.campaign}`;
  let selectedFormat = 'feed';
  let brandLogo = null;

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
    const { colors } = SHARE_CONFIG;
    const format = SHARE_CONFIG.formats[selectedFormat];
    const width = format.width;
    const height = format.height;
    const offset = Math.max(0, (height - 1080) * 0.42);
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, width, 26);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, height - 26, width, 26);

    const panelY = 72 + offset;
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(60, panelY, 960, 880);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(60, panelY, 12, 880);

    if (brandLogo) {
      ctx.fillStyle = colors.paper;
      ctx.fillRect(88, panelY + 34, 104, 104);
      ctx.drawImage(brandLogo, 96, panelY + 42, 88, 88);
    }

    ctx.fillStyle = colors.accent;
    ctx.font = '900 30px Arial, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(copy.canvasKicker, brandLogo ? 230 : 88, panelY + 96);

    ctx.fillStyle = colors.ink;
    ctx.font = '900 82px Arial, sans-serif';
    drawText(ctx, copy.canvasTitle, 112, panelY + 300, 820, 94);

    ctx.fillStyle = colors.muted;
    ctx.font = '700 34px Arial, sans-serif';
    drawText(ctx, copy.canvasBody, 112, panelY + 570, 800, 48);

    ctx.fillStyle = colors.accent;
    ctx.fillRect(112, panelY + 720, 520, 86);
    ctx.fillStyle = colors.paper;
    ctx.font = '900 30px Arial, sans-serif';
    ctx.fillText(copy.canvasCta, 144, panelY + 775);

    ctx.fillStyle = colors.ink;
    ctx.font = '800 31px Arial, sans-serif';
    ctx.fillText(copy.canvasUrl, 88, height - 144);
    ctx.fillStyle = colors.muted;
    ctx.font = '600 24px Arial, sans-serif';
    ctx.fillText('Based on the USA Pickleball rulebook', 88, height - 98);
  }

  function getBlob() {
    const canvas = document.getElementById('instagram-art');
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  async function copyCaption() {
    const caption = document.getElementById('instagram-caption')?.value || '';
    try {
      await navigator.clipboard.writeText(caption);
    } catch (_) {
      const field = document.getElementById('instagram-caption');
      field.focus();
      field.select();
      document.execCommand('copy');
    }
    setText('status', copy.statusCopied);
    track('copy-caption');
  }

  async function downloadImage() {
    const blob = await getBlob();
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pickleball-rules-challenge-${selectedFormat}-${locale}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    setText('status', copy.statusDownloaded);
    track('download-image');
  }

  async function nativeShare() {
    const blob = await getBlob();
    const file = blob ? new File([blob], `pickleball-rules-challenge-${selectedFormat}-${locale}.png`, { type: 'image/png' }) : null;
    const payload = { title: 'Pickleball Rules Challenge', text: document.getElementById('instagram-caption')?.value || '', url: campaignUrl };
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) payload.files = [file];
    try {
      if (typeof navigator.share !== 'function') throw new Error('share unavailable');
      await navigator.share(payload);
      setText('status', copy.statusShared);
      track('native-share');
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      await copyCaption();
      window.open(SHARE_CONFIG.instagramUrl, '_blank', 'noopener');
      setText('status', copy.statusFallback);
      track('instagram-fallback');
    }
  }

  function init() {
    document.documentElement.lang = locale;
    document.title = locale === 'fr' ? 'Partager le Défi des règles du pickleball' : 'Share Pickleball Rules Challenge';
    setText('eyebrow', copy.eyebrow);
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
    const instagramLink = document.querySelector('[data-share="instagramLink"]');
    if (instagramLink) instagramLink.href = SHARE_CONFIG.instagramUrl;
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
    document.querySelector('[data-action="native-share"]')?.addEventListener('click', nativeShare);
    document.querySelector('[data-action="open-instagram"]')?.addEventListener('click', () => track('open-instagram'));
    track('open');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
