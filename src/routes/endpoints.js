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

    const endpoint = store.endpoints.find(e => {
      const routeTest = new RegExp(`^${e.route}$`).test(req.path);
      const methodTest = new RegExp(`^${e.method}$`, 'i').test(req.method);
      return routeTest && methodTest;
    });
    if (!endpoint) {
      // eslint-disable-next-line
      console.log('No custom endpoint detected, proceeding...');
      next();
      return;
    }

    /* eslint-disable no-console */
    console.log(`Custom Endpoint Detected! ${endpoint.route}`);
    console.log(`Mock Endpoint: ${JSON.stringify(endpoint)}`);
    /* eslint-enable no-console */

    const {
      response: { statusCode, redirect, headers, body, mimeType },
    } = endpoint;

    // Attach Headers (if they are present)
    const headerMap = {};
    if (headers && headers.length > 0) {
      headers.forEach(([name, value]) => {
        headerMap[name] = value;
      });
      res.set(headerMap);
    }

    // handle redirects
    if (statusCode >= 300 && statusCode < 400) {
      res.redirect(statusCode, redirect);
      res.end();
      return;
    }

    // Setup message sending type
    let newRes = res.status(statusCode);
    try {
      // If we can parse json, use the json mime type (if it hasn't been set already)
      const json = JSON.parse(body);
      if (!headerMap['Content-Type']) {
        res.type('json');
      }
      newRes = res.json(json);
    } catch (e) {
      // use the mime type given to us (if Content-Type hasn't been set already)
      if (!headerMap['Content-Type']) {
        res.type(mimeType);
      }
      newRes = res.send(body);
    }
    newRes.end();
  });
}

module.exports = setupEndpointRoutes;
