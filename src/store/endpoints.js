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
    const { statusCode, redirect, mimeType, headers } = response;

    let newId = shortId.generate();
    while (this.getEndpoint(newId)) {
      newId = shortId.generate();
    }
    const fixedRoute = route.startsWith('/') ? route : `/${route}`;
    let fixedRedirect = `/${redirect}`;
    if (statusCode < 300 || statusCode >= 400) {
      fixedRedirect = null;
    } else if (redirect.startsWith('/')) {
      fixedRedirect = redirect;
    }

    newEndpoint.id = newId;
    newEndpoint.route = fixedRoute;
    newEndpoint.response.redirect = fixedRedirect;
    newEndpoint.response.mimeType = mimeType || 'text/plain';
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

  // Transform the structure into the deprecated V0 structure
  // DEPRECATED
  // eslint-disable-next-line
  transformV0(endpoint) {
    // ASSERT: endpoint is the correct stucture

    return {
      id: endpoint.id,
      method: endpoint.method,
      route: endpoint.route,
      mimeType: endpoint.response.mimeType,
      status: endpoint.response.statusCode,
      body: endpoint.response.body,
      headers: endpoint.response.headers,
      redirect: endpoint.response.redirect,
    };
  }
}

module.exports = EndpointStore;
