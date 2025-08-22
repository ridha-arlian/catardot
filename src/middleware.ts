import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname, origin } = request.nextUrl;

  // Protect /story and subroutes
  if (pathname.startsWith("/story") && !token) {
    return NextResponse.redirect(new URL("/not-authorized", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/story/:path*"],
};
