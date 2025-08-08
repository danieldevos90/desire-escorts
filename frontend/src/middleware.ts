import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const response = NextResponse.next();
  response.headers.set("x-site-host", host);
  return response;
}


