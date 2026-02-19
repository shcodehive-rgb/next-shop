import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const path = formData.get("path") as string || "uploads";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${path}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

        const bucket = adminStorage.bucket();
        const fileRef = bucket.file(filename);

        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // Make the file public
        await fileRef.makePublic();

        // Get public URL
        // Format: https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
