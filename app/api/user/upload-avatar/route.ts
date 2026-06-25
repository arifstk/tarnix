// app/api/user/upload-avatar/route.ts
// CHANGELOG: Uploads avatar to Cloudinary, deletes old one, updates User model

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/route";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB." },
        { status: 400 },
      );
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Delete old avatar from Cloudinary
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId).catch(() => {});
    }

    // Upload new avatar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "tarnix/avatars",
            transformation: [
              { width: 200, height: 200, crop: "fill", gravity: "face" },
              { quality: "auto:good", fetch_format: "auto" },
            ],
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // Save to DB
    user.image = result.secure_url;
    user.cloudinaryId = result.public_id;
    await user.save();

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
