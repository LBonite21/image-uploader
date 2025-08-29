"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardMedia,
  CardActions,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import { CloudUpload, Delete, Search, Close } from "@mui/icons-material";

// Interfaces for image data and API responses
interface ImageItem {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  images?: ImageItem[];
  image?: ImageItem;
}

export default function HomePage() {
  // State management
  const [images, setImages] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    image: ImageItem | null;
  }>({
    open: false,
    image: null,
  });

  // Fetch images from the server
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/upload/images", {
        method: "GET",
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.images) {
        setImages(data.images);
        setFilteredImages(data.images);
      } else {
        setError(data.message || "Failed to fetch images");
      }
    } catch (err) {
      setError("Error occurred while fetching images");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the images in a useEffect
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Filter images based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredImages(images);
    } else {
      const filtered = images.filter((image) =>
        image.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

  // Handle the file section; this targets files
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return;
      }

      // Validate file size 25MB limit
      if (file.size > 25 * 1024 * 1024) {
        setError("File size should be less than 25MB");
        return;
      }

      setSelectedFile(file);

      // Be able to preview the URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  // Handle uploading the image
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      // Get image data from form data and send to the server
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      const data: ApiResponse = await response.json();

      // Toast notification of success
      if (data.success && data.image) {
        setSuccess("Image uploaded successfully!");
        setImages((prev) => [data.image!, ...prev]);

        // Reset the form
        setSelectedFile(null);
        setPreviewUrl(null);

        // Reset the file input
        const fileInput = document.getElementById(
          "file-input"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error occurred during upload");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle deleting an image
  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch("/api/upload/images/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: imageId }),
      });

      const data: ApiResponse = await response.json();

      // Toast notification of success file deleted
      if (data.success) {
        setSuccess("Image deleted successfully!");
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        setError(data.message || "Failed to delete image");
      }
    } catch (err) {
      setError("Network error occurred during deletion");
    } finally {
      setDeleteDialog({ open: false, image: null });
    }
  };

  // Clear the preview URL
  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Close snackbar notifications
  const handleCloseError = () => setError(null);
  const handleCloseSuccess = () => setSuccess(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Box className="text-center mb-8">
          <Typography
            variant="h3"
            component="h1"
            className="font-bold text-gray-800 mb-2"
          >
            Image Gallery
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Upload, search, and manage your images
          </Typography>
        </Box>

        {/* Upload Section */}
        <Card className="mb-8 p-6">
          <Typography variant="h5" className="mb-4 font-semibold">
            Upload New Image
          </Typography>

          <div className="space-y-4">
            <Box className="flex items-center gap-4">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  className="normal-case"
                >
                  Choose Image
                </Button>
              </label>

              {selectedFile && (
                <Typography variant="body2" className="text-gray-600">
                  {selectedFile.name}
                </Typography>
              )}
            </Box>

            {previewUrl && (
              <Box className="relative max-w-[15rem]">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
                <IconButton
                  onClick={clearPreview}
                  className="!absolute top-0 right-0"
                  size="small"
                >
                  <Close fontSize="small" className="bg-red-500 text-white hover:bg-red-600 rounded" />
                </IconButton>
              </Box>
            )}

            <Box>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadLoading}
                variant="contained"
                className="normal-case"
                startIcon={
                  uploadLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CloudUpload />
                  )
                }
              >
                {uploadLoading ? "Uploading..." : "Upload Image"}
              </Button>
            </Box>
          </div>
        </Card>

        {/* Search Section */}
        <Box className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search images by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-400" />
                  </InputAdornment>
                ),
              },
            }}
            className="bg-white"
          />
        </Box>

        {/* Images Grid */}
        {loading ? (
          <Box className="flex justify-center items-center py-12">
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            <Box className="mb-4">
              <Typography variant="h6" className="text-gray-700">
                {filteredImages.length} image
                {filteredImages.length !== 1 ? "s" : ""} found
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {filteredImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card className="h-full flex flex-col">
                    <CardMedia className="relative">
                      <Image
                        src={image.url}
                        alt={image.name}
                        width={300}
                        height={200}
                        className="object-cover w-full h-48"
                      />
                    </CardMedia>

                    <Box className="p-3 flex-grow">
                      <Typography
                        variant="subtitle1"
                        className="font-medium truncate"
                      >
                        {image.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <CardActions className="p-3 pt-0">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, image })}
                        startIcon={<Delete />}
                        className="normal-case"
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {filteredImages.length === 0 && !loading && (
              <Box className="text-center py-12">
                <Typography variant="h6" className="text-gray-500 mb-2">
                  {searchTerm ? "No images found" : "No images uploaded yet"}
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first image to get started"}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, image: null })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{deleteDialog.image?.name}"? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, image: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                deleteDialog.image && handleDelete(deleteDialog.image.id)
              }
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseError} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity="success"
            variant="filled"
          >
            {success}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
