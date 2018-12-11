const setupEndpointRoutes = require('./endpoints');

function setupApiRoutes(app, store) {
  setupEndpointRoutes(app, store.data.endpoints);
}

module.exports = setupApiRoutes;
