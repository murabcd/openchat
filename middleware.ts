import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

export default convexAuthNextjsMiddleware();

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/", "/:id", "/api/:path*", "/login", "/register"],
};
