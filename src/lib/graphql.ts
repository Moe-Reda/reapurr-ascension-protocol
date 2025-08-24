import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Subgraph GraphQL endpoint
const SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cmdkv94ok75u401z0ezqtdw0s/subgraphs/reapurr-protocol/1.0.0/gn';

// Create HTTP link
const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

// Create Apollo Client
export const subgraphClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
}); 