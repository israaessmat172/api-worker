import * as handlers from './commentHandler.js';

export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  const routes = {
    'GET': {
      '/comments': handlers.handleGetComments,
      '/comment': handlers.handleGetCommentById
    },
    'POST': {
      '/comments': handlers.handleAddModifyComment
    },
    'PUT': {
      '/comment': handlers.handleUpdateCommentById
    },
  };

  const methodRoutes = routes[request.method];
  if (methodRoutes && methodRoutes[pathname]) {
    return await methodRoutes[pathname](request, env);
  } else {
    return new Response('Not Found', { status: 404 });
  }
}

  
  
