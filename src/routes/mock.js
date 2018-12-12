function setupMockEndpointHandler(app, store) {
  app.use((req, res, next) => {
    /* eslint-disable no-console */
    console.log('================================================');
    console.log('Inside Endpoint Mock Middleware!');
    console.log(req.path);
    /* eslint-enable no-console */

    const endpoint = store.endpoints.find(e => {
      const routeTest = new RegExp(`^${e.route}$`).test(req.path);
      const methodTest = new RegExp(`^${e.method}$`).test(req.method);
      return routeTest && methodTest;
    });
    if (!endpoint) {
      // eslint-disable-next-line no-console
      console.log(`No custom endpoint detected for request: ${req.method} - ${req.path}`);
      next();
      return;
    }

    /* eslint-disable no-console */
    console.log(`Custom Endpoint Deteted! ${endpoint.method} - ${endpoint.route}`);
    console.log(`Mock Endpoint: ${JSON.stringify(endpoint, null, 2)}`);
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

    // Handle Redirects
    if (statusCode >= 300 && statusCode < 400) {
      res.redirect(statusCode, redirect);
      res.end();
      return;
    }

    res.status(statusCode);

    // Setup MIME Type (if Content-Type hasn't been set already)
    if (!headerMap['Content-Type']) {
      try {
        // If we can parse json, use the json mime type
        const json = JSON.parse(body);
        res.type('json');
        res.json(json);
        res.end();
        return;
      } catch (err) {
        // Use the mime type given to us
        res.type(mimeType);
      }
    }
    res.send(body);
    res.end();
  });
}

module.exports = setupMockEndpointHandler;
