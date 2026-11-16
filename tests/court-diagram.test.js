'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function load() {
  return loadBrowserScript('court-diagram.js', { window: {} }).window.WT_Court;
}

test('topic follows the question tags, with the kitchen first', () => {
  const { topicFor } = load();
  expect(topicFor(['Hard', 'Serving Rules'])).toBe('serving');
  expect(topicFor(['Serving Rules', 'Non-Volley Zone'])).toBe('kitchen');
  expect(topicFor(['2026 Changes', 'Hard', 'Singles'])).toBe('changes');
  expect(topicFor(['The Net'])).toBe('rally');
  expect(topicFor(['Hard'])).toBe('');
  expect(topicFor(null)).toBe('');
});

test('every topic has a drawing with an accessible label in English and French', () => {
  const { svgFor, TOPIC_BY_TAG } = load();
  const tags = [...new Set(TOPIC_BY_TAG.map(([tag]) => tag))];
  for (const tag of tags) {
    const en = svgFor([tag], 'en');
    const fr = svgFor([tag], 'fr');
    expect(en).toContain('<svg');
    expect(en).toContain('role="img"');
    expect(fr).toContain('role="img"');
    expect(en).not.toBe(fr);
  }
  expect(svgFor(['Hard'], 'en')).toBe('');
});
