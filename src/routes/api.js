const setupEndpointRoutes = require('./endpoints');

function setupApiRoutes(app) {
  setupEndpointRoutes(app);
}

module.exports = setupApiRoutes;
