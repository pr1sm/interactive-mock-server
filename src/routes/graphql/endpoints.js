const graphql = require('graphql');

const {
  GraphQLEnumType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLQueryType,
  GraphQLString,
} = graphql;

// MIME Type Enum Definition
const mimeTypeEnum = new GraphQLEnumType({
  name: 'MimeType',
  description: 'The type of a mock endpoint response',
  values: {
    TEXT: {
      value: 'text/plain',
      description: 'Default Text',
    },
    PLAIN: {
      value: 'text/plain',
      description: 'Plain Text',
    },
    HTML: {
      value: 'text/html',
      description: 'HTML Markup',
    },
    JAVASCRIPT: {
      value: 'text/javascript',
      description: 'Javascript',
    },
    CSS: {
      value: 'text/css',
      description: 'Cascading Style Sheet',
    },
  },
});

// Container of Endpoint Response Data
const endpointResponseType = new GraphQLObjectType({
  name: 'EndpointResponse',
  description: 'Mock Endpoint Response Data to Serve',
  fields: () => ({
    mimeType: {
      type: GraphQLNonNull(mimeTypeEnum),
      description: 'The MIME type of this response',
    },
    headers: {
      type: GraphQLList(GraphQLList(GraphQLString)),
      description: 'A list of header data to send',
    },
    redirect: {
      type: GraphQLString,
      description: 'The redirect route that should be taken if status is 3xx',
    },
    body: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The body data to send',
    },
    statusCode: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The response status code',
    },
  }),
});

// Container of Endpoint Data
const endpointType = new GraphQLObjectType({
  name: 'Endpoint',
  description: 'Mock Endpoint Container',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the endpoint',
    },
    route: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The route that the endpoint will handle',
    },
    method: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The HTTP method that the endpoint will handle',
    },
    response: {
      type: GraphQLNonNull(endpointResponseType),
      description: 'The response data to serve',
    },
  }),
});

const endpointsQueryType = new GraphQLQueryType({});
