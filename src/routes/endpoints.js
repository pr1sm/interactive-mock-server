const shortId = require('shortid');

const _endpoints = [];

function setupEndpointRoutes(app) {
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
      endpoints: _endpoints,
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
    const endpoint = _endpoints.find(e => e.id === id);
    if (!endpoint) {
      res
        .status(400)
        .json({
          error: 'InvalidRequest',
          message: 'Endpoint Not Found!',
        })
        .end();
      return;
    }

    res.status(200).json({
      message: 'Success',
      endpoint,
    });
  });

  app.post('/__api/endpoints', (req, res) => {
    const { route, redirect, status, body, method, headers } = req.body;

    // TODO: Make this validation check better!
    // Quick validation check
    // NOTE: headers are optional
    if (
      !route ||
      !status ||
      !method ||
      (!body && body !== '') ||
      (status >= 300 && status < 400 && !redirect)
    ) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Malformed Endpoint object was sent',
      });
    } else {
      const newId = shortId.generate();
      const fixedRoute = route.startsWith('/') ? route : `/${route}`;
      let fixedRedirect = `/${redirect}`;
      if (status < 300 || status >= 400) {
        fixedRedirect = '';
      } else if (redirect.startsWith('/')) {
        fixedRedirect = redirect;
      }
      const fixedHeaders = headers.map(([name, value]) => ([name, value]));
      const newEndpoint = {
        method,
        status,
        body,
        id: newId,
        route: fixedRoute,
        redirect: fixedRedirect,
        headers: fixedHeaders,
      };
      _endpoints.push(newEndpoint);

      res.set({
        Location: `/__api/endpoints/${newId}`,
      });
      res.status(201).json({
        message: 'Success',
        endpoint: newEndpoint,
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

    // TODO: Make this validation check better!
    // Quick validation check
    // NOTE: headers are optional
    if (
      !route ||
      !status ||
      !method ||
      (!body && body !== '') ||
      (status >= 300 && status < 400 && !redirect)
    ) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Malformed Endpoint object was sent',
      });
      return;
    }

    const { id } = params;
    const idx = _endpoints.findIndex(e => e.id === id);
    if (idx === -1) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Endpoint Not Found!',
      });
      return;
    }

    const newId = shortId.generate();
    const fixedRoute = route.startsWith('/') ? route : `/${route}`;
    let fixedRedirect = `/${redirect}`;
    if (status < 300 || status >= 400) {
      fixedRedirect = '';
    } else if (redirect.startsWith('/')) {
      fixedRedirect = redirect;
    }
    const fixedHeaders = headers.map(([name, value]) => ([name, value]));

    const newEndpoint = {
      method,
      status,
      body,
      id: newId,
      route: fixedRoute,
      redirect: fixedRedirect,
      headers: fixedHeaders,
    };

    _endpoints[idx] = newEndpoint;

    res.set({
      Location: `/__api/endpoints/${newId}`,
    });
    res.status(200).json({
      message: 'Success',
      endpoint: newEndpoint,
    });
  });

  app.delete('/__api/endpoints', (req, res) => {
    _endpoints.splice(0, _endpoints.length);

    res.status(200).json({
      message: 'Success',
    });
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

    const { id } = params;
    const idx = _endpoints.findIndex(e => e.id === id);
    if (idx === -1) {
      res.status(400).json({
        error: 'InvalidRequest',
        message: 'Endpoint Not Found!',
      });
      return;
    }

    _endpoints.splice(idx, 1);

    res.status(200).json({
      message: 'Success',
    });
  });

  // MARK: Endpoint Mock Middleware
  app.use((req, res, next) => {
    /* eslint-disable no-console */
    console.log('================================================');
    console.log('Inside Endpoint Mock Middleware!');
    console.log(req.path);
    /* eslint-enable no-console */

    const endpoint = _endpoints.find(e => new RegExp(`^${e.route}$`).test(req.path));
    if (endpoint) {
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
      return;
    }
    // eslint-disable-next-line
    console.log('No custom endpoint detected, proceeding...');
    next();
  });
}

module.exports = setupEndpointRoutes;
