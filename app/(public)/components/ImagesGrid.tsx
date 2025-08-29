import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { ZoomIn, Delete } from '@mui/icons-material';
import Image from 'next/image';

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
            <CircularProgress size={60} />
          </motion.div>
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box className="mb-4">
            <Typography variant="h6" className="text-gray-700">
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
                      <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <Box
                          className="relative cursor-pointer group"
                          onClick={() => onImageClick(image)}
                        >
                          <Image
                            src={image.url}
                            alt={image.name}
                            width={300}
                            height={200}
                            className="object-cover w-full h-48"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                          >
                            <ZoomIn className="text-white text-3xl" />
                          </motion.div>
                        </Box>

                        <Box className="p-3 flex-grow">
                          <Typography
                            variant="subtitle1"
                            className="font-medium truncate"
                          >
                            {image.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            {new Date(image.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <CardActions className="p-3 pt-0">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="small"
                              color="error"
                              onClick={() => onDeleteClick(image.id)}
                              startIcon={<Delete />}
                              className="normal-case"
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
            </motion.div>
          )}
        </motion.div>
      )}
    </>
  );
};

export default ImagesGrid;