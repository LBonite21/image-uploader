'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import {} from '@mui/material';
import {} from '@mui/icons-material';

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
  return <div>Home Page</div>;
}
