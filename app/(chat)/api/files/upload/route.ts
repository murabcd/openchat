import { NextResponse } from "next/server";

import { z } from "zod";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const FileSchema = z.object({
  file: z.instanceof(Blob).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "File size should be less than 5MB",
  }),
});

export async function POST(request: Request) {
  const token = await convexAuthNextjsToken().catch(() => null);
  const user = token
    ? await fetchQuery(api.users.getUser, {}, { token }).catch(() => null)
    : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });
    if (!validatedFile.success) {
      return NextResponse.json({ error: validatedFile.error.message }, { status: 400 });
    }

    // Use Convex storage
    const postUrl = await convex.mutation(api.files.generateAttachmentUrl, {
      contentType: file.type,
    });

    // Upload to Convex storage
    const uploadResponse = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await uploadResponse.json();

    // Get the file URL
    const fileData = await convex.mutation(api.files.getAttachmentUrl, {
      storageId,
      name: (file as File).name,
      contentType: file.type,
    });

    return NextResponse.json(fileData);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
