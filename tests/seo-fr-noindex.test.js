'use strict';

const fs = require('fs');
const path = require('path');

const read = (file) =>
  fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

describe('French game page: playable but not indexed', () => {
  it('fr.html carries noindex,follow and no hreflang', () => {
    const html = read('fr.html');
    expect(html).toMatch(/<meta name="robots" content="noindex,follow">/);
    expect(html).not.toMatch(/hreflang=/);
  });

  it('is not blocked in robots.txt (Google must read the noindex)', () => {
    expect(read('robots.txt')).not.toMatch(/fr\.html/);
  });

  it('is absent from the sitemap and from the English home hreflang', () => {
    expect(read('sitemap.xml')).not.toMatch(/fr\.html/);
    expect(read('index.html')).not.toMatch(/hreflang="fr"/);
  });

  it('llms.txt no longer advertises fr.html', () => {
    expect(read('llms.txt')).not.toMatch(/fr\.html/);
  });
});
