import { FastifyInstance } from "fastify";
import createServer from "./utils/createServer";
import { connectToDb, disconnectFromDB } from "./utils/db";
import logger from "./utils/logger";

function gracefulShutdown(signal: string, app: FastifyInstance) {
  process.on(signal, async () => {
    logger.info(`Goodbye, got signal ${signal}`);


    // this will close the fastify instance
    app.close();

    await disconnectFromDB();

    logger.info("My work here is done");

    process.exit(0);
  });
}

async function main() {
  const app = createServer();

  try {
    const url = await app.listen({port:4000});

    logger.info(`Server is ready at ${url}`);

    await connectToDb();
  } 
  // when we start the server we need to catch the error

  catch (e) {
    logger.error(e);
    process.exit(1);
  }

  const signals = ["SIGTERM", "SIGINT"];

  for (let i = 0; i < signals.length; i++) {
    gracefulShutdown(signals[i], app);
  }
}

main();
