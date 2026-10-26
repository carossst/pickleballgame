module.exports = {
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'logic/**/*.js',
        'analytics.js',
        'game.js',
        'storage.js',
        'ui-checkout.js',
        'ui-screen-end.js',
        'ui-screen-landing.js',
        'ui-screen-paywall.js'
      ],
      exclude: ['app.bundle.js', 'poster-qr-vendor.js'],
      thresholds: {
        lines: 60,
        functions: 50,
        statements: 55,
        branches: 45
      }
    }
  }
};
