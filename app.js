const express = require('express');
const path = require('path');
const content = require("./config/conectet");
const securityMiddleware = require('./middlewares/securityMiddleware');
const { errorNotFound, errorHandler } = require('./middlewares/error');
require("dotenv").config();
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const forgetpassRouter = require('./routes/forgetpass');

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql/schema');
const { extractUserFromToken } = require('./middlewares/verifytoken');

const { startServer } = require('./grpc/server');

async function startApp() {
  const app = express();

  securityMiddleware(app);
  content();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'auth-token'],
    exposedHeaders: ['auth-token']
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // مهم عشان Postman يفهم schema
  playground: true,    // لو بتفتح في المتصفح
  context: async ({ req }) => {
    const user = await extractUserFromToken(req);
    return { user };
  }
});


  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // REST routes
  app.use('/api/', usersRouter);
  app.use('/api/tasks', indexRouter);
  app.use('/api/forgetpass', forgetpassRouter);

  // gRPC
  const grpcServer = startServer();

  process.on('SIGTERM', () => {
    grpcServer.tryShutdown(() => {
      console.log('gRPC server shutdown');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    grpcServer.tryShutdown(() => {
      console.log('gRPC server shutdown');
      process.exit(0);
    });
  });

  // Error handling
  app.use(errorNotFound);
  app.use(errorHandler);

  // تشغيل السيرفر
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

// شغّل التطبيق مباشرة
startApp();
