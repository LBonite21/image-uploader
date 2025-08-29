import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir, stat, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

let imagesDatabase = {};

// Make sure the upload directory exists
async function UploadDirectoryExists() {
  const uploadDir = join(process.cwd(), "public", "uploads");
  try {
    await stat(uploadDir);
  } catch {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

//Get images
export async function GET() {
  try {
    //Check if upload directory exists
    const uploadDir = await UploadDirectoryExists();

    //Read files from upload directory and filter out files that are not
    try {
      const files = await readdir(uploadDir);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      //And make sure that the database is up to date with the files in the upload directory
      for (const file of imageFiles) {
        const existingImage = imagesDatabase.find((img) =>
          img.url.includes(file)
        );
        if (!existingImage) {
          // Add missing files to database
          imagesDatabase.push({
            id: uuidv4(),
            name: file,
            url: `/uploads/${file}`,
            uploadedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Upload directory not found or empty");
    }

    // Return images sorted by upload date
    return NextResponse.json({
      success: true,
      images: imagesDatabase.sort(
        (current, next) =>
          new Date(next.uploadedAt).getTime() -
          new Date(current.uploadedAt).getTime()
      ),
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// Post image
export async function POST(request) {
  try {
    // Get form data from request
    const formData = await request.formData();
    const file = formData.get("image");

    // Check if file is present
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate the file type if image file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only images are allowed.",
        },
        { status: 400 }
      );
    }

    // I want to see how fast next js can handle large images so set a limit of 25MB and check the file size
    const maxImageSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxImageSize) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 25MB limit" },
        { status: 400 }
      );
    }

    // Create file path with uuid; if faulty file extension default to jpg
    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Make sure upload directory exists and get the path
    const uploadDir = await UploadDirectoryExists();
    const filePath = join(uploadDir, uniqueFilename);

    // Write file to upload directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Add record of image to "database"
    const imageRecord = {
      id: uuidv4(),
      name: file.name,
      originalName: file.name,
      filename: uniqueFilename,
      url: `/uploads/${uniqueFilename}`,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    imagesDatabase.unshift(imageRecord);

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      image: imageRecord,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
