import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_BYTES = 4.5 * 1024 * 1024;

function apiOrigin() {
  return (
    process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "") ??
    "https://dahbi-art-api.vercel.app"
  );
}

async function requireUploader(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new Error("Non authentifié");
  }
  const res = await fetch(`${apiOrigin()}/auth/me`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) {
    throw new Error("Session expirée — reconnectez-vous");
  }
  const user = (await res.json()) as { role?: string };
  if (user.role !== "admin" && user.role !== "artiste") {
    throw new Error("Droits insuffisants pour l’upload");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await requireUploader(request);
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
          ],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false,
          tokenPayload: null,
        };
      },
      onUploadCompleted: async () => {
        /* optionnel */
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload impossible";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
