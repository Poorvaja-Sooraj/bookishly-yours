import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file") as File;

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

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "bookishly-yours/books",
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
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
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Image upload failed.",
            },
            { status: 500 }
        );
    }
}