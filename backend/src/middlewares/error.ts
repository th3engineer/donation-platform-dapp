import { Context, Next } from "koa";

export const onError = () => {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err: any) {
      // some errors will have .status
      // however this is not a guarantee
      ctx.status = err.status || 500;
      ctx.type = "json";
      ctx.body = { message: err.message };

      // since we handled this manually we'll
      // want to delegate to the regular app
      // level error handling as well so that
      // centralized still functions correctly.
      ctx.app.emit("error", err, ctx);
    }
  };
};
