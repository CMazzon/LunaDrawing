// Extends app.json. The web build can live under a sub-path
// (e.g. GitHub Pages serves it at /LunaDrawing): set EXPO_BASE_URL for that.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || '',
  },
});
