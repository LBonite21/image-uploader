import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Backdrop, IconButton, Box, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import Image from "next/image";

interface ImageModalProps {
  open: boolean;
  image: {
    id: string;
    url: string;
    name: string;
    uploadedAt: string;
  } | null;
  isMobile: boolean;
  modalVariants: any;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  open,
  image,
  isMobile,
  modalVariants,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && image && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          slots={{ backdrop: Backdrop }}
          slotProps={{
            paper: { sx: { bgcolor: "transparent", boxShadow: "none" } },
            backdrop: {
              sx: { bgcolor: "rgba(0, 0, 0, 0.8)" },
              onClick: onClose
            }
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex items-center justify-center min-h-screen p-4"
          >
            <IconButton
              onClick={onClose}
              className="!absolute top-4 right-4 z-10"
              size="large"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
            >
              <Close />
            </IconButton>

            <Box className="relative max-w-full max-h-full">
              <Image
                src={image.url}
                alt={image.name}
                width={isMobile ? 350 : 800}
                height={isMobile ? 350 : 600}
                className="object-contain max-w-full max-h-[90vh] rounded-lg"
                style={{ width: "auto", height: "auto" }}
              />

              <Box className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 rounded-b-lg">
                <Typography variant="h6" className="truncate">
                  {image.name}
                </Typography>
                <Typography variant="caption">
                  Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
