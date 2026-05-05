import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!login|register|api/auth|api/sub-emotions|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|service-worker\\.js|web-app-manifest.*\\.png).*)",
  ],
};
