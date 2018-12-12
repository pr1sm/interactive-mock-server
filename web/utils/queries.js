const _endpointListQuery = `{
  endpoints {
    id,
    route,
    method,
    response {
      mimeType,
      headers,
      redirect,
      statusCode
    }
  }
}`;

const _endpointQuery = `query getEndpoint($id: String!) {
  endpoint(id: $id) {
    id,
    route,
    method,
    response {
      mimeType,
      headers,
      redirect,
      body,
      statusCode
    }
  }
}`;

export default {
  endpoints: {
    list: _endpointListQuery,
    single: _endpointQuery,
  },
};
