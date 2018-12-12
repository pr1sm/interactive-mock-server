const setupGraphQLEndpointRoutes = require('./graphql/endpoints');
const setupMockEndpointHandler = require('./mock');

function setupApiRoutes(app, store) {
  setupGraphQLEndpointRoutes(app, '/__api/endpoints', store.data.endpoints);
  setupMockEndpointHandler(app, store.data.endpoints);
}

module.exports = setupApiRoutes;
