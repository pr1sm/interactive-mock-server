const shortId = require('shortid');

class EndpointStore {
  constructor(initialEndpoints) {
    this._endpoints = initialEndpoints || [];
  }

  get endpoints() {
    return this._endpoints;
  }

  _validateEndpoint(endpointData) {
    // Check for valid endpoint structure
    if (!endpointData || !endpointData.route || !endpointData.method || !endpointData.response) {
      throw new Error('Invalid Structure');
    }

    // Check for valid endpoint response structure
    if (!endpointData.response.body || !endpointData.response.statusCode) {
      throw new Error('Invalid Structure');
    }

    // Check for make sure redirect is conditionally present
    if (
      endpointData.response.statusCode >= 300 &&
      endpointData.response.statusCode < 400 &&
      !endpointData.response.redirect
    ) {
      throw new Error('Invalid Structure');
    }

    // Create a separate copy of the data
    const newEndpoint = JSON.parse(JSON.stringify(endpointData));

    // Fill in optional data
    const { route, response } = newEndpoint;
    const { statusCode, redirect, mimeType, headers, body } = response;

    // Calculate ID
    let newId = shortId.generate();
    while (this.getEndpoint(newId)) {
      newId = shortId.generate();
    }

    // Transform data to the correct format
    const fixedRoute = route.startsWith('/') ? route : `/${route}`;
    let fixedRedirect = `/${redirect}`;
    if (statusCode < 300 || statusCode >= 400) {
      fixedRedirect = null;
    } else if (redirect.startsWith('/')) {
      fixedRedirect = redirect;
    }

    // Perform some initial mimeType checking on the body text
    // TODO: Add more tests (maybe move to a utility function?)
    let fixedMimeType = mimeType || 'text/plain';
    try {
      JSON.parse(body);
      fixedMimeType = 'application/json';
    } catch (_) {
      // SyntaxError, so it's definitely not JSON, default it to plaintext
      fixedMimeType = 'text/plain';
    }

    newEndpoint.id = newId;
    newEndpoint.route = fixedRoute;
    newEndpoint.response.redirect = fixedRedirect;
    newEndpoint.response.mimeType = fixedMimeType;
    if (headers) {
      newEndpoint.response.headers = headers.map(([name, value]) => [name, value]);
    }

    return newEndpoint;
  }

  addEndpoint(data) {
    const newEndpoint = this._validateEndpoint(data);
    this._endpoints.push(newEndpoint);

    return newEndpoint;
  }

  getEndpoint(id) {
    return this._endpoints.find(e => e.id === id);
  }

  replaceEndpoint(id, data) {
    // TODO: Should we handle replacing an invalid id like adding a new endpoint?
    const oldEndpointIndex = this._endpoints.findIndex(e => e.id === id);
    if (oldEndpointIndex === -1) {
      throw new Error('Endpoint Not Found');
    }

    const newEndpoint = this._validateEndpoint(data);
    this._endpoints[oldEndpointIndex] = newEndpoint;

    return newEndpoint;
  }

  deleteEndpoint(id) {
    const oldEndpointIndex = this._endpoints.findIndex(e => e.id === id);
    if (oldEndpointIndex === -1) {
      throw new Error('Endpoint Not Found');
    }

    const [deleted] = this._endpoints.splice(oldEndpointIndex, 1);

    return deleted;
  }

  deleteAllEndpoints() {
    this._endpoints.splice(0, this._endpoints.length);
  }
}

module.exports = EndpointStore;
