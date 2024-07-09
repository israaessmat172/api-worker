export async function handleGetComments(request, env) {
  const { DATABASE } = env;
  const stmt = DATABASE.prepare("SELECT * FROM comments");
  const { results } = await stmt.all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleGetCommentById(request, env) {
  const { DATABASE } = env;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Comment ID is required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  const stmt = DATABASE.prepare("SELECT * FROM comments WHERE id = ?");
  const { results } = await stmt.bind(id).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: 'Comment not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }

  return new Response(JSON.stringify(results[0]), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleAddModifyComment(request, env) {
  try {
    const { author, body, post_slug, id } = await request.json();
    const { DATABASE } = env;

    if (!author || !body || !post_slug) {
      throw new Error("Missing required fields");
    }

    const selectStmt = DATABASE.prepare("SELECT * FROM comments WHERE id = ?");
    const { results } = await selectStmt.bind(id).all();

    if (results && results.length > 0) {
      await DATABASE.prepare("UPDATE comments SET author = ?, body = ?, post_slug = ? WHERE id = ?")
        .bind(author, body, post_slug, id)
        .run();
    } else {
      await DATABASE.prepare("INSERT INTO comments (author, body, post_slug) VALUES (?, ?, ?)")
        .bind(author, body, post_slug)
        .run();
    }

    return new Response(JSON.stringify({ author, body, post_slug }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (err) {
    console.error(err);
    return new Response('Invalid JSON: ' + err.message, { status: 400 });
  }
}



// import { PrismaClient } from '@prisma/client'
// import { PrismaD1 } from '@prisma/adapter-d1';

// export default {
//   async fetch(request, env) {
//     const adapter = new PrismaD1(env.DB);
//     const prisma = new PrismaClient({ adapter });

//     return await handleRequest(request, env, prisma);
//   }
// };

// export async function handleGetComments(request, env, prisma) {
//   try {
//     const comments = await prisma.comments.findMany();
//     return new Response(JSON.stringify(comments), {
//       headers: { 'Content-Type': 'application/json' }
//     });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
//       headers: { 'Content-Type': 'application/json' },
//       status: 500
//     });
//   }
// }

// export async function handleGetCommentById(request, env, prisma) {
//   try {
//     const url = new URL(request.url);
//     const id = url.searchParams.get('id');

//     if (!id) {
//       return new Response(JSON.stringify({ error: 'Comment ID is required' }), {
//         headers: { 'Content-Type': 'application/json' },
//         status: 400
//       });
//     }

//     const comment = await prisma.comments.findUnique({
//       where: { id: parseInt(id) }
//     });

//     if (!comment) {
//       return new Response(JSON.stringify({ error: 'Comment not found' }), {
//         headers: { 'Content-Type': 'application/json' },
//         status: 404
//       });
//     }

//     return new Response(JSON.stringify(comment), {
//       headers: { 'Content-Type': 'application/json' }
//     });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
//       headers: { 'Content-Type': 'application/json' },
//       status: 500
//     });
//   }
// }

// export async function handleAddModifyComment(request, env) {
//   try {
//     const { author, body, post_slug, id } = await request.json();

//     if (!author || !body || !post_slug) {
//       throw new Error("Missing required fields");
//     }

//     let comment;
//     const existingComment = await prisma.comment.findUnique({
//       where: { id },
//     });

//     if (existingComment) {
//       comment = await prisma.comment.update({
//         where: { id },
//         data: { author, body, post_slug },
//       });
//     } else {
//       comment = await prisma.comment.create({
//         data: { author, body, post_slug },
//       });
//     }

//     return new Response(JSON.stringify(comment), {
//       headers: { 'Content-Type': 'application/json' },
//       status: existingComment ? 200 : 201,
//     });
//   } catch (err) {
//     console.error(err);
//     return new Response('Invalid JSON: ' + err.message, { status: 400 });
//   }
// }