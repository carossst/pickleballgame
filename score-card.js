/* Score card: a 1080x1350 image of the player's score, drawn on a canvas and
   shared as a picture (or downloaded when the browser cannot share files). */
(() => {
  'use strict';

  const W = 1080;
  const H = 1350;

  const COPY = {
    en: { title: 'Pickleball Rules Quiz', points: 'points', cta: 'Can you beat me?', url: 'pickleballrulesquiz.com' },
    fr: { title: 'Défi des règles du pickleball', points: 'points', cta: 'Tu fais mieux ?', url: 'pickleballrulesquiz.com/fr.html' }
  };

  function copyFor(lang) {
    return COPY[lang === 'fr' ? 'fr' : 'en'];
  }

  // Draws the card on any 2D context (a real canvas or a recording stub in tests).
  function draw(ctx, options) {
    const o = options || {};
    const c = copyFor(o.lang);
    const score = Math.max(0, Math.floor(Number(o.score) || 0));

    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, W, H);

    // court
    ctx.fillStyle = '#0b4e7c';
    ctx.fillRect(90, 130, W - 180, 760);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(90, 130, W - 180, 760);
    ctx.beginPath();
    ctx.moveTo(90, 340);
    ctx.lineTo(W - 90, 340);
    ctx.moveTo(90, 680);
    ctx.lineTo(W - 90, 680);
    ctx.moveTo(W / 2, 130);
    ctx.lineTo(W / 2, 340);
    ctx.moveTo(W / 2, 680);
    ctx.lineTo(W / 2, 890);
    ctx.stroke();
    ctx.setLineDash([18, 14]);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(60, 510);
    ctx.lineTo(W - 60, 510);
    ctx.stroke();
    ctx.setLineDash([]);

    // score
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 330px Inter, Arial, sans-serif';
    ctx.fillText(String(score), W / 2, 520);
    ctx.font = '700 56px Inter, Arial, sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(c.points.toUpperCase(), W / 2, 600);

    // ball
    ctx.beginPath();
    ctx.arc(W - 190, 250, 44, 0, Math.PI * 2);
    ctx.fillStyle = '#d9f03c';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // texts below the court
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 76px Inter, Arial, sans-serif';
    ctx.fillText(c.cta, W / 2, 1010);
    ctx.font = '700 52px Inter, Arial, sans-serif';
    ctx.fillText(c.title, W / 2, 1100);
    ctx.fillStyle = '#fde047';
    ctx.font = '700 46px Inter, Arial, sans-serif';
    ctx.fillText(c.url, W / 2, 1200);
    if (o.label) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 44px Inter, Arial, sans-serif';
      ctx.fillText(String(o.label), W / 2, 90);
    }
  }

  function toBlob(options) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas unavailable'));
        return;
      }
      draw(ctx, options);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no image'))), 'image/png');
    });
  }

  function fileName(score) {
    return `pickleball-score-${Math.max(0, Math.floor(Number(score) || 0))}.png`;
  }

  function download(blob, name) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  // options: { score, lang, label, text }. Shares the picture when the browser
  // can share files, otherwise downloads it.
  async function share(options) {
    const o = options || {};
    const blob = await toBlob(o);
    const name = fileName(o.score);
    try {
      const file = new File([blob], name, { type: 'image/png' });
      const data = { files: [file], text: String(o.text || '') };
      if (navigator.canShare && navigator.canShare(data) && navigator.share) {
        await navigator.share(data);
        return 'shared';
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
    }
    download(blob, name);
    return 'downloaded';
  }

  window.WT_ScoreCard = { W, H, draw, toBlob, share, fileName };
})();
