'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

const CONFIG = {
  rulesLinks: {
    guide: 'https://www.bonjourpickleball.fr/regles/',
    questions: 'https://www.bonjourpickleball.fr/regles/questions/'
  }
};

function load(lang, config) {
  const document = { documentElement: { lang } };
  return loadBrowserScript('rules-link.js', {
    window: { WT_CONFIG: config === undefined ? CONFIG : config },
    document
  }).window.WT_RulesLink;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

describe('rules-link', () => {
  it('builds the guide and questions URLs with utm parameters', () => {
    const rl = load('fr');
    expect(rl.href('guide', 'end')).toBe(
      'https://www.bonjourpickleball.fr/regles/?utm_source=pickleballrulesquiz&utm_medium=quiz&utm_campaign=end'
    );
    expect(rl.href('questions', 'explanation')).toContain(
      '/regles/questions/?utm_source=pickleballrulesquiz'
    );
  });

  it('gives an anchor on the French version only', () => {
    const html = load('fr').anchor('guide', 'footer', 'Guide', 'x', esc);
    expect(html).toContain('rel="noopener"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('>Guide</a>');
    expect(load('en').anchor('guide', 'footer', 'Guide', 'x', esc)).toBe('');
  });

  it('gives nothing without a label or a configured URL', () => {
    expect(load('fr').anchor('guide', 'end', '', 'x', esc)).toBe('');
    expect(load('fr', {}).anchor('guide', 'end', 'Guide', 'x', esc)).toBe('');
  });
});
