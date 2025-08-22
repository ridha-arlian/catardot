// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "../auth"

// export default async function middleware(request: NextRequest) {
//   const session = await auth();
  
//   const { pathname, origin } = request.nextUrl;

//   // Protect /story and subroutes
//   if (pathname.startsWith("/story") && !session?.user) {
//     return NextResponse.redirect(new URL("/not-authorized", origin));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/story/:path*"],
// };