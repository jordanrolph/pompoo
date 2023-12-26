import { bathingSiteRouter } from "~/server/api/routers/bathingSite";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bathingSite: bathingSiteRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
