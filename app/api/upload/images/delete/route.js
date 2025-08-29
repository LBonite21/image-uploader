import { NextResponse } from "next/server";
import { unlink, stat } from "fs/promises";
import { join } from "path";

let imagesDatabase = {};

// Need to populate imagesDatabase from the existing files in the upload directory
async function getImageDatabase() {
  try {
    // Make a request to our own API to get current images
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/upload/images`
    );
    const data = await response.json();
    if (data.success && data.images) {
      imagesDatabase = data.images;
    }
  } catch (error) {
    console.error("Could populate the database.", error);
  }
  return imagesDatabase;
}

// Delete image
export async function DELETE(request) {
  try {
    // Get the image ID
    const { id } = await request.json();

    // Check if the ID is provided
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Image ID is required" },
        { status: 400 }
      );
    }

    // get the database
    await getImageDatabase();

    // Finds the image in the database and check if it exists
    const imageIndex = imagesDatabase.findIndex((img) => img.id === id);

    if (imageIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    const imageRecord = imagesDatabase[imageIndex];

    // Time to delete the file from the filesystem
    try {
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filename = imageRecord.filename || imageRecord.url.split("/").pop();
      const filepath = join(uploadDir, filename);

      // Check if file exists before trying to delete
      try {
        await stat(filepath);
        await unlink(filepath);
      } catch (fileError) {
        console.error("File not found on filesystem.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    // Remove the image from the database
    imagesDatabase.splice(imageIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      deletedImage: imageRecord,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
