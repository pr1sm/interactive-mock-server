async function _graphqlFetch(body, uri) {
  const res = await fetch(uri || '/__api/endpoints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    const error = new Error('ResponseError');
    error.json = json;
    throw error;
  }
  if (json.errors) {
    const error = new Error('GraphQLError');
    error.json = json;
    throw error;
  }
  return json;
}

export default _graphqlFetch;
