const setupGraphQLEndpointRoutes = require('./graphql/endpoints');

function setupApiRoutes(app, store) {
  setupGraphQLEndpointRoutes(app, '/__api/endpoints', store.data.endpoints);
}

module.exports = setupApiRoutes;
