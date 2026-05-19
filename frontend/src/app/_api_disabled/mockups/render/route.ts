import { NextRequest, NextResponse } from "next/server";
import { renderMockupServer } from "@/lib/mockups/render-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const paintingUrl = req.nextUrl.searchParams.get("paintingUrl");
  const mockupId = req.nextUrl.searchParams.get("mockupId");
  const width = Number(req.nextUrl.searchParams.get("width") ?? "1920");

  if (!paintingUrl || !mockupId) {
    return NextResponse.json({ error: "paintingUrl et mockupId requis" }, { status: 400 });
  }

  try {
    const buffer = await renderMockupServer({ paintingUrl, mockupId, outputWidth: width });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 },
    );
  }
}
