import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const { tag, secret } = await req.json();
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!tag) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  revalidateTag(String(tag));
  return NextResponse.json({ ok: true });
}


