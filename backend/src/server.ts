import http from "http";
import { init } from "./app";

const port = 3001;

const main = async () => {
  const app = await init();
  const server: http.Server = app.listen(port);

  server.on("listening", () => {
    if (!server.listening) return;

    console.log(
      "----------------------------------------------------------------------"
    );
    console.log(`Application running on port ${port}`);
    console.log("To shut it down, press CTRL + C at any time.");
    console.log(
      "----------------------------------------------------------------------"
    );
    console.log(`Application is running in ${process.env.ENVIRONMENT} mode.`);
    console.log(
      "----------------------------------------------------------------------"
    );
  });

  server.on("error", (error: Error | any) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind: string =
      typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
      // break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
      // break;
      default:
        throw error;
    }
  });

  return server;
};

main();
