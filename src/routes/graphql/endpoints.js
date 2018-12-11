const graphql = require('graphql');
const graphqlHTTP = require('express-graphql');

const {
  GraphQLEnumType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = graphql;

// MIME Type Enum Definition
const mimeTypeEnum = new GraphQLEnumType({
  name: 'MimeType',
  type: GraphQLString,
  description: 'The type of a mock endpoint response',
  values: {
    PLAIN: {
      value: 'text/plain',
      description: 'Plain Text',
    },
    HTML: {
      value: 'text/html',
      description: 'HTML Markup',
    },
    CSS: {
      value: 'text/css',
      description: 'Cascading Style Sheet',
    },
    JAVASCRIPT: {
      value: 'application/javascript',
      description: 'Javascript',
    },
    JSON: {
      value: 'application/json',
      description: 'JSON Object',
    },
  },
});

// HTTP Method Enum Definition
const httpMethodEnum = new GraphQLEnumType({
  name: 'HttpMethod',
  type: GraphQLString,
  description: 'An HTTP method',
  values: {
    GET: {
      description: 'GET method',
    },
    HEAD: {
      description: 'HEAD method',
    },
    POST: {
      description: 'POST method',
    },
    PUT: {
      description: 'PUT method',
    },
    DELETE: {
      description: 'DELETE method',
    },
    CONNECT: {
      description: 'CONNECT method',
    },
    OPTIONS: {
      description: 'OPTIONS method',
    },
    TRACE: {
      description: 'TRACE method',
    },
    PATCH: {
      description: 'PATCH method',
    },
  },
});

// Container of Endpoint Response Data
const endpointResponseType = new GraphQLObjectType({
  name: 'EndpointResponse',
  description: 'Mock Endpoint Response Data to Serve',
  fields: () => ({
    mimeType: {
      type: mimeTypeEnum,
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
      type: GraphQLNonNull(httpMethodEnum),
      description: 'The HTTP method that the endpoint will handle',
    },
    response: {
      type: GraphQLNonNull(endpointResponseType),
      description: 'The response data to serve',
    },
  }),
});

const newEndpointResponseDataType = new graphql.GraphQLInputObjectType({
  name: 'EndpointResponseData',
  description: 'Mock Endpoint Response Data to Serve',
  fields: () => ({
    mimeType: {
      type: mimeTypeEnum,
      defaultValue: mimeTypeEnum.getValue('PLAIN').value,
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

const newEndpointDataType = new graphql.GraphQLInputObjectType({
  name: 'EndpointData',
  description: 'Data to create a mock endpoint',
  fields: () => ({
    route: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The route that the endpoint will handle',
    },
    method: {
      type: GraphQLNonNull(httpMethodEnum),
      description: 'The HTTP method that the endpoint will handle',
    },
    response: {
      type: GraphQLNonNull(newEndpointResponseDataType),
      description: 'The response data to serve',
    },
  }),
});

const endpointsMutationType = new graphql.GraphQLObjectType({
  name: 'EndpointMutation',
  description: 'Mutation methods associated with an Endpoint Object',
  fields: () => ({
    createEndpoint: {
      type: GraphQLNonNull(endpointType),
      args: {
        data: {
          description: 'data of the endpoint',
          type: GraphQLNonNull(newEndpointDataType),
        },
      },
      resolve: (root, { data }) => root.addEndpoint(data),
    },
    replaceEndpoint: {
      type: GraphQLNonNull(endpointType),
      args: {
        id: {
          description: 'id of the endpoint to change',
          type: GraphQLNonNull(GraphQLString),
        },
        data: {
          description: 'data with which to update the endpoint',
          type: GraphQLNonNull(newEndpointDataType),
        },
      },
      resolve: (root, { id, data }) => root.replaceEndpoint(id, data),
    },
    deleteEndpoint: {
      type: GraphQLNonNull(endpointType),
      args: {
        id: {
          description: 'id of the endpoint to delete',
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (root, { id }) => root.deleteEndpoint(id),
    },
  }),
});

const endpointsQueryType = new GraphQLObjectType({
  name: 'EndpointQuery',
  description: 'Query methods associated with an Endpoint Object',
  fields: () => ({
    endpoints: {
      type: GraphQLList(endpointType),
      resolve: root => root.endpoints,
    },
    endpoint: {
      type: endpointType,
      args: {
        id: {
          description: 'id of the endpoint',
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (root, { id }) => root.getEndpoint(id),
    },
  }),
});

function setupGraphQLEndpointRoutes(app, route, store) {
  const schema = new GraphQLSchema({
    query: endpointsQueryType,
    mutation: endpointsMutationType,
    types: [endpointResponseType, endpointType, newEndpointDataType],
  });

  app.use(
    route,
    graphqlHTTP({
      schema,
      rootValue: store,
      graphiql: true, // TODO: Use NODE_ENV to conditionally enable this
    }),
  );
}

module.exports = setupGraphQLEndpointRoutes;
