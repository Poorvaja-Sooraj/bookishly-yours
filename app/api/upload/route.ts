import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No file uploaded.",
                },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const mimeType = file.type || "";
        const fileName = file.name || "upload";

        const isAudio = mimeType.startsWith("audio/") || fileName.endsWith(".webm") || fileName.endsWith(".mp3") || fileName.endsWith(".wav") || fileName.endsWith(".m4a");
        const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(fileName);

        let folder = "bookishly-yours/books";
        let uploadOptions: UploadApiOptions = {
            resource_type: "auto",
        };

        if (isAudio) {
            folder = "bookishly-yours/voice";
            uploadOptions = {
                folder,
                resource_type: "raw",
                public_id: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webm`,
            };
        } else if (isImage) {
            folder = "bookishly-yours/images";
            uploadOptions = {
                folder,
                resource_type: "image",
            };
        } else {
            uploadOptions = {
                folder,
                resource_type: "auto",
            };
        }

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error || !result) {
                            reject(error ?? new Error("Cloudinary upload failed"));
                        } else {
                            resolve(result);
                        }
                    }
                )
                .end(buffer);
        });

        return NextResponse.json({
            success: true,
            imageUrl: result.secure_url,
            fileUrl: result.secure_url,
        });
    } catch (error) {
        console.error("Upload API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "File upload failed.",
            },
            { status: 500 }
        );
    }
}