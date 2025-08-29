import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { ZoomIn, Delete } from "@mui/icons-material";
import Image from "next/image";

interface ImageGridProps {
  loading: boolean;
  filteredImages: Array<{
    id: string;
    url: string;
    name: string;
    uploadedAt: string;
  }>;
  searchTerm: string;
  containerVariants: any;
  itemVariants: any;
  onImageClick: (image: any) => void;
  onDeleteClick: (image: any) => void;
}

const ImagesGrid: React.FC<ImageGridProps> = ({
  loading,
  filteredImages,
  searchTerm,
  containerVariants,
  itemVariants,
  onImageClick,
  onDeleteClick,
}) => {
  return (
    <>
      {loading ? (
        <Box className="flex justify-center items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <CircularProgress size={60} sx={{ color: "var(--color-blue-4)" }} />
          </motion.div>
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box className="mb-4">
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              {filteredImages.length} image
              {filteredImages.length !== 1 ? "s" : ""} found
            </Typography>
          </Box>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <AnimatePresence>
                {filteredImages.map((image) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                    <motion.div
                      variants={itemVariants}
                      layout
                      whileHover={{
                        y: -8,
                        transition: { type: "spring", stiffness: 300 },
                      }}
                    >
                      <Card
                        className="h-full flex flex-col transition-all duration-300"
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "16px",
                          border: `2px solid var(--color-blue-4)`,
                          boxShadow: "0 4px 20px rgba(47, 140, 190, 0.15)",
                          "&:hover": {
                            boxShadow: "0 8px 32px rgba(47, 140, 190, 0.25)",
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        <Box
                          className="relative cursor-pointer group overflow-hidden"
                          onClick={() => onImageClick(image)}
                          sx={{ borderRadius: "14px 14px 0 0" }}
                        >
                          <Image
                            src={image.url}
                            alt={image.name}
                            width={300}
                            height={200}
                            className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(0, 15, 21, 0.7), rgba(47, 140, 190, 0.7))",
                            }}
                          >
                            <ZoomIn
                              className="text-white text-3xl"
                              sx={{
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                              }}
                            />
                          </motion.div>
                        </Box>

                        <Box className="p-4 flex-grow">
                          <Typography
                            variant="subtitle1"
                            className="font-medium truncate"
                            sx={{
                              color: "var(--color-blue-1)",
                              fontWeight: 600,
                              fontSize: "16px",
                            }}
                          >
                            {image.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "var(--color-blue-3)",
                              fontSize: "12px",
                            }}
                          >
                            {new Date(image.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <CardActions className="p-4 pt-0">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="small"
                              onClick={() => onDeleteClick(image.id)}
                              startIcon={<Delete />}
                              className="normal-case"
                              sx={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                borderRadius: "8px",
                                fontWeight: 600,
                                padding: "8px 16px",
                                "&:hover": {
                                  backgroundColor: "#c82333",
                                  transform: "translateY(-1px)",
                                  boxShadow:
                                    "0 4px 12px rgba(220, 53, 69, 0.3)",
                                },
                              }}
                            >
                              Delete
                            </Button>
                          </motion.div>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </motion.div>

          {filteredImages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box
                className="text-center py-12 rounded-2xl"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: `2px dashed rgba(255, 255, 255, 0.3)`,
                }}
              >
                <Typography
                  variant="h6"
                  className="mb-2"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  {searchTerm ? "No images found" : "No images uploaded yet"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first image to get started"}
                </Typography>
              </Box>
            </motion.div>
          )}
        </motion.div>
      )}
    </>
  );
};

export default ImagesGrid;
