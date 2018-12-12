const _endpointCreateMutation = `mutation CreateEndpoint($data: EndpointData!) {
  createEndpoint(data: $data) {
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

const _endpointReplaceMutation = `mutation ReplaceEndpoint($id: String!, $data: EndpointData!) {
  replaceEndpoint(id: $id, data:$data) {
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

const _endpointDeleteMutation = `mutation DeleteEndpoint($id: String!) {
  deleteEndpoint(id: $id) {
    id
  }
}`;

export default {
  endpoints: {
    create: _endpointCreateMutation,
    replace: _endpointReplaceMutation,
    delete: _endpointDeleteMutation,
  },
};
