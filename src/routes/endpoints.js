function setupEndpointRoutes(app, store) {
  // MARK: API Methods
  app.get('/__api', (req, res) => {
    res
      .status(200)
      .send('active')
      .end();
  });

  app.get('/__api/endpoints', (req, res) => {
    res.status(200).json({
      message: 'Success',
      // transform to deprecated structure
      endpoints: store.endpoints.map(e => store.transformV0(e)),
    });
  });

  app.get('/__api/endpoints/:id', (req, res) => {
    const { params } = req;
    // TODO: Does this check need to be here?
    if (!params.id) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Endpoint Id must be passed!',
      });
      return;
    }

    const { id } = params;

    try {
      const endpoint = store.getEndpoint(id);
      res.status(200).json({
        message: 'Success',
        // transform to deprecated structure
        endpoint: store.transformV0(endpoint),
      });
      return;
    } catch (err) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Endpoint Not Found!',
      });
    }
  });

  app.post('/__api/endpoints', (req, res) => {
    const { route, redirect, status, body, method, headers } = req.body;
    // transform data to valid structure
    const endpointData = {
      method,
      route,
      response: {
        statusCode: status,
        body,
        redirect,
        headers,
      },
    };
    try {
      const newEndpoint = store.addEndpoint(endpointData);
      res.set({
        Location: `/__api/endpoints/${newEndpoint.id}`,
      });
      res.status(201).json({
        message: 'Success',
        // transform to deprecated structure
        endpoint: store.transformV0(newEndpoint),
      });
    } catch (err) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Malformed Endpoint object was sent',
      });
    }
  });

  app.put('/__api/endpoints/:id', (req, res) => {
    const { params } = req;
    const { route, redirect, status, body, method, headers } = req.body;

    // TODO: Does this check need to be here?
    if (!params.id) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Endpoint Id must be passed!',
      });
      return;
    }

    // transform data to valid structure
    const endpointData = {
      method,
      route,
      response: {
        statusCode: status,
        body,
        redirect,
        headers,
      },
    };
    try {
      const updatedEndpoint = store.replaceEndpoint(params.id, endpointData);
      res.set({
        Location: `/__api/endpoints/${updatedEndpoint.id}`,
      });
      res.status(200).json({
        message: 'Success',
        // transform to deprecated structure
        endpoint: store.transformV0(updatedEndpoint),
      });
    } catch (err) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: err.message,
      });
    }
  });

  app.delete('/__api/endpoints', (req, res) => {
    try {
      store.deleteAllEndpoints();
      res.status(200).json({
        message: 'Success',
      });
    } catch (err) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: err.message,
      });
    }
  });

  app.delete('/__api/endpoints/:id', (req, res) => {
    const { params } = req;

    // TODO: Does this check need to be here?
    if (!params.id) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Endpoint Id must be passed!',
      });
      return;
    }

    try {
      store.deleteEndpoint(params.id);
      res.status(200).json({
        message: 'Success',
      });
    } catch (err) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: err.message,
      });
    }
  });

  // MARK: Endpoint Mock Middleware
  app.use((req, res, next) => {
    /* eslint-disable no-console */
    console.log('================================================');
    console.log('Inside Endpoint Mock Middleware!');
    console.log(req.path);
    /* eslint-enable no-console */

    let endpoint = store.endpoints.find(e => new RegExp(`^${e.route}$`).test(req.path));
    if (!endpoint) {
      // eslint-disable-next-line
      console.log('No custom endpoint detected, proceeding...');
      next();
      return;
    }

    // transform to deprecated structure
    endpoint = store.transformV0(endpoint);
    /* eslint-disable no-console */
    console.log(`Custom Endpoint Detected! ${endpoint.route}`);
    console.log(`Mock Endpoint: ${JSON.stringify(endpoint)}`);
    /* eslint-enable no-console */

    // Attach Headers (if they are present)
    if (endpoint.headers && endpoint.headers.length > 0) {
      const headers = {};
      endpoint.headers.forEach(([name, value]) => {
        headers[name] = value;
      });
      res.set(headers);
    }

    // handle redirects
    if (endpoint.status >= 300 && endpoint.status < 400) {
      res.redirect(endpoint.status, endpoint.redirect);
      res.end();
      return;
    }

    // Setup message sending type
    let newRes = res.status(endpoint.status);
    try {
      const json = JSON.parse(endpoint.body);
      newRes = res.json(json);
    } catch (e) {
      newRes = res.send(endpoint.body);
    }
    newRes.end();
  });
}

module.exports = setupEndpointRoutes;
