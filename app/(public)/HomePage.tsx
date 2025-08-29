"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import ImageUploadSection from "./components/ImageUploadSection";
import ImagesGrid from "./components/ImagesGrid";
import ImageModal from "./components/ImageModal";

//#region Interfaces

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

//#endregion

//#region Animation Variants

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

//#endregion

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
  const [fullImageModal, setFullImageModal] = useState<{
    open: boolean;
    image: ImageItem | null;
  }>({
    open: false,
    image: null,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  // Handle full image view
  const handleImageClick = (image: ImageItem) => {
    setFullImageModal({ open: true, image });
  };

  return (
    <div
      className="min-h-screen p-10"
      style={{
        background: `linear-gradient(135deg, var(--color-blue-1) 0%, var(--color-blue-2) 50%, var(--color-blue-3) 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box className="text-center mb-8">
            <Typography
              variant="h3"
              component="h1"
              className="font-bold mb-2"
              sx={{ color: "white" }}
            >
              Image Gallery
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Upload, search, and manage your images
            </Typography>
          </Box>
        </motion.div>

        {/* Upload Section */}
        <ImageUploadSection
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          uploadLoading={uploadLoading}
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          onClearPreview={clearPreview}
        />

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
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
                      <Search sx={{ color: "var(--color-blue-3)" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: "12px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: "var(--color-blue-4)",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--color-blue-3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--color-blue-4)",
                  },
                },
              }}
            />
          </Box>
        </motion.div>

        {/* Images Grid */}
        <ImagesGrid
          loading={loading}
          filteredImages={filteredImages}
          searchTerm={searchTerm}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
          onImageClick={handleImageClick}
          onDeleteClick={handleDelete}
        />

        {/* Full Image Modal */}
        <ImageModal
          open={fullImageModal.open}
          image={fullImageModal.image}
          isMobile={isMobile}
          modalVariants={modalVariants}
          onClose={() => setFullImageModal({ open: false, image: null })}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, image: null })}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "16px",
              border: `2px solid var(--color-blue-4)`,
            },
          }}
        >
          <DialogTitle sx={{ color: "var(--color-blue-1)", fontWeight: 600 }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "var(--color-blue-2)" }}>
              Are you sure you want to delete "{deleteDialog.image?.name}"? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, image: null })}
              sx={{
                color: "var(--color-blue-3)",
                borderColor: "var(--color-blue-3)",
                "&:hover": {
                  backgroundColor: "rgba(47, 140, 190, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                deleteDialog.image && handleDelete(deleteDialog.image.id)
              }
              variant="contained"
              sx={{
                backgroundColor: "#dc3545",
                "&:hover": {
                  backgroundColor: "#c82333",
                },
              }}
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
