import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { CloudUpload, Close } from "@mui/icons-material";
import Image from "next/image";

interface ImageUploadSectionProps {
  selectedFile: File | null;
  previewUrl: string | null;
  uploadLoading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onClearPreview: () => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  selectedFile,
  previewUrl,
  uploadLoading,
  onFileSelect,
  onUpload,
  onClearPreview,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card
        className="mb-8 p-6 flex flex-col items-center text-center"
        sx={{
          backgroundColor: "white",
          borderRadius: "16px",
          border: `2px solid var(--color-blue-4)`,
          boxShadow: "0 8px 32px rgba(47, 140, 190, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h5"
          className="pb-5 font-semibold"
          sx={{ color: "var(--color-blue-1)" }}
        >
          Upload New Image
        </Typography>

        <div className="space-y-4 w-full">
          <Box className="flex items-center justify-center gap-4">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                className="normal-case"
                sx={{
                  borderColor: "var(--color-blue-4)",
                  color: "var(--color-blue-3)",
                  borderWidth: "2px",
                  borderRadius: "12px",
                  padding: "10px 24px",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "var(--color-blue-3)",
                    backgroundColor: "rgba(47, 140, 190, 0.05)",
                    borderWidth: "2px",
                  },
                }}
              >
                Choose Image
              </Button>
            </label>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-blue-2)" }}
                >
                  {selectedFile.name}
                </Typography>
              </motion.div>
            )}
          </Box>

          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-[15rem] mx-auto"
              >
                <Box className="relative max-w-[15rem]">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                    style={{
                      border: `3px solid var(--color-blue-4)`,
                      borderRadius: "12px",
                    }}
                  />
                  <IconButton
                    onClick={onClearPreview}
                    className="!absolute -top-2 -right-2"
                    size="small"
                    sx={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#c82333",
                      },
                      width: "28px",
                      height: "28px",
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <Box className="flex justify-center">
            <motion.div whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onUpload}
                disabled={!selectedFile || uploadLoading}
                variant="contained"
                className="normal-case"
                startIcon={
                  uploadLoading ? (
                    <CircularProgress size={20} sx={{ color: "white" }} />
                  ) : (
                    <CloudUpload />
                  )
                }
                sx={{
                  backgroundColor: "var(--color-blue-4)",
                  color: "white",
                  borderRadius: "12px",
                  padding: "12px 32px",
                  fontWeight: 600,
                  fontSize: "16px",
                  textTransform: "none",
                  boxShadow: "0 4px 16px rgba(47, 140, 190, 0.3)",
                  "&:hover": {
                    backgroundColor: "var(--color-blue-3)",
                    boxShadow: "0 6px 20px rgba(47, 140, 190, 0.4)",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(47, 140, 190, 0.5)",
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              >
                {uploadLoading ? "Uploading..." : "Upload Image"}
              </Button>
            </motion.div>
          </Box>
        </div>
      </Card>
    </motion.div>
  );
};

export default ImageUploadSection;
