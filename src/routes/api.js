const setupEndpointRoutes = require('./endpoints');
const setupGraphQLEndpointRoutes = require('./graphql/endpoints');

function setupApiRoutes(app, store) {
  setupGraphQLEndpointRoutes(app, '/__api/endpoints/graphql', store.data.endpoints);
  setupEndpointRoutes(app, store.data.endpoints);
}

module.exports = setupApiRoutes;
