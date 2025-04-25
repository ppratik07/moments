// frontend/middleware.ts
import { HTTP_BACKEND } from "@/utils/config";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);

  if (userId && sessionClaims) {
    try {
      const response = await fetch(`${HTTP_BACKEND}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: userId,
          email: sessionClaims.email,
          name: `${sessionClaims.first_name} ${sessionClaims.last_name}`,
        }),
      });
      console.log(response);
      if (!response.ok) {
        console.error('Failed to sync user:', await response.text());
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  }

  return NextResponse.next();
}

// Matcher ensures that middleware runs for all routes except Next.js internals like _next and favicon.ico
export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
