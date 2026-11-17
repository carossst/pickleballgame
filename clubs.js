/* Clubs and coaches page: builds tracking links, a poster link, a ready-to-paste
   message and a QR code from a club name. Nothing is stored or sent anywhere. */
(() => {
  'use strict';

  const link = window.WT_ClubLink;
  if (!link) return;

  const params = new URLSearchParams(window.location.search);
  const uiLang =
    params.get('lang') === 'en' ||
    (params.get('lang') !== 'fr' && !/^fr/i.test(navigator.language || ''))
      ? 'en'
      : 'fr';

  const COPY = {
    fr: {
      back: 'Retour au quiz',
      title: 'Clubs et coachs',
      lead: 'Entrez le nom de votre club ou de votre activité : vous obtenez un lien, un poster et un QR code à vous. Les parties jouées grâce à eux sont comptées à part, pour que vous puissiez voir ce que votre promotion apporte.',
      nameLabel: 'Nom du club ou du coach',
      namePlaceholder: 'Ex. : Lyon Pickle',
      kindLabel: 'Vous êtes',
      kinds: { club: 'Un club', coach: 'Un coach' },
      langLabel: 'Langue de vos joueurs',
      langs: { fr: 'Français', en: 'Anglais' },
      empty: 'Entrez un nom pour voir vos liens.',
      shareTitle: 'Votre lien à partager',
      shareHelp: 'À mettre dans un message, une newsletter, un site ou un groupe.',
      posterTitle: 'Votre poster à imprimer',
      posterHelp: 'Affiche A4 avec le nom de votre club et votre QR code.',
      posterOpen: 'Ouvrir le poster',
      messageTitle: 'Message prêt à coller (WhatsApp, newsletter)',
      message: (url) =>
        `🏓 Défi des règles du pickle : saurez-vous répondre juste à 5 questions pièges ? Testez vos connaissances, 2 parties gratuites, sans inscription : ${url}`,
      qrTitle: 'Votre QR code',
      qrDownload: 'Télécharger le QR code (SVG)',
      themesTitle: 'Liens par thème, pour illustrer une séance',
      themesHelp: 'Chaque lien ouvre directement un quiz sur ce thème.',
      trackTitle: 'Comment suivre les résultats',
      track: (tag) =>
        `Votre étiquette est ${tag}. Dans GoatCounter, filtrez les chemins sur src-${tag} : vous voyez les arrivées (landing-view), les parties lancées (run-start) et terminées (run-complete). Ce sont des parties, pas des personnes, et seules les arrivées par votre lien ou votre QR code sont comptées.`,
      copy: 'Copier',
      copied: 'Copié'
    },
    en: {
      back: 'Back to quiz',
      title: 'Clubs and coaches',
      lead: 'Enter your club or coaching name to get your own link, poster and QR code. Games played through them are counted separately, so you can see what your promotion brings.',
      nameLabel: 'Club or coach name',
      namePlaceholder: 'E.g. Lyon Pickle',
      kindLabel: 'You are',
      kinds: { club: 'A club', coach: 'A coach' },
      langLabel: 'Your players speak',
      langs: { fr: 'French', en: 'English' },
      empty: 'Enter a name to see your links.',
      shareTitle: 'Your link to share',
      shareHelp: 'For a message, a newsletter, a website or a group.',
      posterTitle: 'Your poster to print',
      posterHelp: 'A4 poster with your club name and your QR code.',
      posterOpen: 'Open the poster',
      messageTitle: 'Ready-to-paste message (WhatsApp, newsletter)',
      message: (url) =>
        `🏓 Pickleball challenge: can you get 5 tricky calls right? Test your rules knowledge, 2 free games, no signup: ${url}`,
      qrTitle: 'Your QR code',
      qrDownload: 'Download the QR code (SVG)',
      themesTitle: 'Links by topic, to illustrate a session',
      themesHelp: 'Each link opens a quiz on that topic directly.',
      trackTitle: 'How to follow the results',
      track: (tag) =>
        `Your tag is ${tag}. In GoatCounter, filter paths on src-${tag}: you see visits (landing-view), games started (run-start) and finished (run-complete). These are games, not people, and only visits through your link or QR code are counted.`,
      copy: 'Copy',
      copied: 'Copied'
    }
  };

  const t = COPY[uiLang];
  document.documentElement.lang = uiLang;

  const $ = (selector) => document.querySelector(selector);
  const nameInput = $('#club-name');
  const kindSelect = $('#club-kind');
  const langSelect = $('#club-lang');
  const results = $('#clubs-results');
  const emptyNote = $('#clubs-empty');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function fillStatic() {
    document.title = `${t.title} - Pickleball Rules Quiz`;
    document.querySelectorAll('[data-c]').forEach((node) => {
      const key = node.getAttribute('data-c');
      if (key === 'namePlaceholder') node.setAttribute('placeholder', t.namePlaceholder);
      else if (t[key] != null) node.textContent = t[key];
    });
    kindSelect.replaceChildren(
      ...Object.keys(t.kinds).map((value) => {
        const option = el('option', '', t.kinds[value]);
        option.value = value;
        return option;
      })
    );
    langSelect.replaceChildren(
      ...Object.keys(t.langs).map((value) => {
        const option = el('option', '', t.langs[value]);
        option.value = value;
        return option;
      })
    );
    langSelect.value = uiLang;
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const area = el('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch (__) {
        /* the text stays selectable in its field */
      }
      area.remove();
    }
    const label = button.textContent;
    button.textContent = t.copied;
    setTimeout(() => {
      button.textContent = label;
    }, 1400);
  }

  function copyLine(value) {
    const row = el('div', 'clubs-line');
    const input = el('input', 'wt-input');
    input.type = 'text';
    input.readOnly = true;
    input.value = value;
    input.addEventListener('focus', () => input.select());
    const button = el('button', 'wt-btn wt-btn--secondary', t.copy);
    button.type = 'button';
    button.addEventListener('click', () => copyText(value, button));
    row.append(input, button);
    return row;
  }

  function block(title, help) {
    const section = el('section', 'clubs-block');
    section.appendChild(el('h2', 'wt-h2', title));
    if (help) section.appendChild(el('p', 'wt-muted', help));
    return section;
  }

  function qrSvg(url) {
    if (typeof qrcode !== 'function') return '';
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    return qr.createSvgTag(4, 0);
  }

  function downloadSvg(svg, filename) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    const a = el('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  function render() {
    const name = nameInput.value.trim();
    const kind = kindSelect.value === 'coach' ? 'coach' : 'club';
    const lang = langSelect.value === 'en' ? 'en' : 'fr';
    const tag = link.tag(kind, name);

    emptyNote.hidden = Boolean(tag);
    results.hidden = !tag;
    results.replaceChildren();
    if (!tag) return;

    const shareUrl = link.siteUrl({ lang, tag });

    const share = block(t.shareTitle, t.shareHelp);
    share.appendChild(copyLine(shareUrl));
    results.appendChild(share);

    const posterHref = link.posterUrl({ lang, kind, name });
    const poster = block(t.posterTitle, t.posterHelp);
    poster.appendChild(copyLine(posterHref));
    const open = el('a', 'wt-btn wt-btn--primary', t.posterOpen);
    open.href = posterHref;
    open.target = '_blank';
    open.rel = 'noopener';
    poster.appendChild(open);
    results.appendChild(poster);

    const message = block(t.messageTitle);
    const area = el('textarea', 'wt-input clubs-textarea');
    area.readOnly = true;
    area.value = t.message(shareUrl);
    area.addEventListener('focus', () => area.select());
    message.appendChild(area);
    const copyMessage = el('button', 'wt-btn wt-btn--secondary', t.copy);
    copyMessage.type = 'button';
    copyMessage.addEventListener('click', () => copyText(area.value, copyMessage));
    message.appendChild(copyMessage);
    results.appendChild(message);

    const svg = qrSvg(shareUrl);
    if (svg) {
      const qr = block(t.qrTitle);
      const box = el('div', 'clubs-qr');
      box.id = 'clubs-qr';
      box.setAttribute('data-url', shareUrl);
      box.innerHTML = svg; // generated by the local QR library from our own URL
      qr.appendChild(box);
      const download = el('button', 'wt-btn wt-btn--secondary', t.qrDownload);
      download.type = 'button';
      download.addEventListener('click', () => downloadSvg(svg, `qr-${tag}.svg`));
      qr.appendChild(el('p'));
      qr.appendChild(download);
      results.appendChild(qr);
    }

    const themes = block(t.themesTitle, t.themesHelp);
    link.THEMES.forEach((theme) => {
      themes.appendChild(el('p', 'clubs-theme-label', theme.label));
      themes.appendChild(copyLine(link.siteUrl({ lang, tag, theme: theme.slug })));
    });
    results.appendChild(themes);

    const track = block(t.trackTitle);
    const trackText = el('p', 'wt-muted');
    trackText.textContent = t.track(tag);
    track.appendChild(trackText);
    results.appendChild(track);
  }

  fillStatic();
  document.getElementById('clubs-form').addEventListener('submit', (event) => event.preventDefault());
  [nameInput, kindSelect, langSelect].forEach((node) => {
    node.addEventListener('input', render);
    node.addEventListener('change', render);
  });
  render();
})();
