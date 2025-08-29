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
              sx: {
                background:
                  "linear-gradient(135deg, rgba(0, 15, 21, 0.9), rgba(3, 62, 93, 0.9), rgba(9, 76, 112, 0.9))",
                backdropFilter: "blur(20px)",
              },
              onClick: onClose,
            },
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
              sx={{
                backgroundColor: "var(--color-blue-4)",
                color: "white",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "var(--color-blue-3)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s ease",
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
                style={{
                  width: "auto",
                  height: "auto",
                  border: `3px solid var(--color-blue-4)`,
                  borderRadius: "16px",
                  boxShadow: "0 12px 48px rgba(47, 140, 190, 0.3)",
                }}
              />

              <Box
                className="absolute bottom-0 left-0 right-0 text-white p-4 rounded-b-2xl"
                sx={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0, 15, 21, 0.9) 100%)",
                }}
              >
                <Typography
                  variant="h6"
                  className="truncate"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {image.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
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
