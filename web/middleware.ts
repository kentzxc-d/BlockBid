import { NextResponse, NextRequest } from "next/server";
import { globalRateLimiter } from "./lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to /api/* routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // If Redis is not configured, skip rate limiting
    if (!globalRateLimiter) {
      return NextResponse.next();
    }

    try {
      // Use the IP address as the identifier, fallback to "anonymous"
      const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
      
      const { success, limit, reset, remaining } = await globalRateLimiter.limit(`global_${ip}`);
      
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", reset.toString());
      return response;

    } catch (err) {
      console.error("Rate limiting failed, allowing request:", err);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all API routes
    "/api/:path*",
  ],
};
