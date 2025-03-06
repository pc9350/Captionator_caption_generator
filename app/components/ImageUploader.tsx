import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiImage, FiGrid, FiAlertCircle, FiPlus, FiChevronRight, FiMaximize2, FiLayers, FiTrash2, FiCamera, FiChevronLeft } from 'react-icons/fi';
import { useImageUpload } from '../hooks/useImageUpload';
import uploadAnimation from "../animations/upload-animation.json";
import Lottie from "lottie-react";
import { useCaptionStore } from "../store/captionStore";
import Image from 'next/image';

export default function ImageUploader() {
  const { uploadImage, resetUpload, error, validateBlobUrls } =
    useImageUpload();
  const {
    isUploading,
    uploadProgress,
    uploadedImages,
    clearUploadedImages,
    addUploadedImage,
    setImageUrl,
  } = useCaptionStore();
  const [activeImageIndex, setLocalActiveImageIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageValidityMap, setImageValidityMap] = useState<
    Record<number, boolean>
  >({});
  const [isValidatingUrls, setIsValidatingUrls] = useState(false);
  const [isConvertingToDataUrl, setIsConvertingToDataUrl] = useState(false);

  // Update active image index when uploaded images change
  useEffect(() => {
    if (
      uploadedImages.length > 0 &&
      activeImageIndex >= uploadedImages.length
    ) {
      setLocalActiveImageIndex(uploadedImages.length - 1);
    }
  }, [uploadedImages, activeImageIndex]);

  // Function to handle validation and fixing of blob URLs
  const handleValidateBlobUrls = useCallback(() => {
    if (isValidatingUrls) return;

    setIsValidatingUrls(true);
    try {
      validateBlobUrls();
      console.log("Blob URL validation complete");
      // Force recheck of image validity
      setTimeout(() => {
        const newValidityMap: Record<number, boolean> = {};
        uploadedImages.forEach((_, index) => {
          newValidityMap[index] = true; // Optimistically set to true
        });
        setImageValidityMap(newValidityMap);
      }, 500);
    } catch (err) {
      console.error("Error validating blob URLs:", err);
    } finally {
      setIsValidatingUrls(false);
    }
  }, [isValidatingUrls, uploadedImages, validateBlobUrls]);

  // Update the image validity check
  const checkImageValidity = useCallback(async () => {
    // Remove or comment out console logs
    // console.log("Checking validity of", uploadedImages.length, "images");

    const validityMap: Record<number, boolean> = {};

    for (let i = 0; i < uploadedImages.length; i++) {
      const img = uploadedImages[i];
      try {
        const testImg = document.createElement('img');
        const isValid = await new Promise<boolean>((resolve) => {
          testImg.onload = () => {
            // Remove or comment out console logs
            // console.log(`Image ${i} is valid:`, img.url.substring(0, 30) + "...");
            resolve(true);
          };
          testImg.onerror = () => {
            console.error(`Image ${i} is invalid:`, img.url.substring(0, 30) + "...");
            resolve(false);
          };
          testImg.src = img.url;
        });

        validityMap[i] = isValid;
      } catch (err) {
        console.error(`Error validating image ${i}:`, err);
        validityMap[i] = false;
      }
    }

    setImageValidityMap(validityMap);
    // Remove or comment out console logs
    // console.log("Image validity map:", validityMap);

    // If we find any invalid images, try to validate/fix blob URLs
    const hasInvalidImages = Object.values(validityMap).some((valid) => !valid);
    if (hasInvalidImages && !isValidatingUrls) {
      // Remove or comment out console logs
      // console.log("Found invalid images, attempting to fix blob URLs");
      handleValidateBlobUrls();
    }
  }, [uploadedImages, isValidatingUrls, handleValidateBlobUrls]);

  // Validate image URLs whenever uploadedImages change
  useEffect(() => {
    // Add a check to prevent unnecessary validations
    if (uploadedImages.length > 0 && !isValidatingUrls) {
      // Use a ref to track if this is the initial validation
      const timeoutId = setTimeout(() => {
        checkImageValidity();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [uploadedImages.length, checkImageValidity, isValidatingUrls]);

  // Utility function to convert a blob URL to a data URL
  const blobToDataUrl = async (blobUrl: string): Promise<string> => {
    try {
      // Fetch the blob
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting blob to data URL:", error);
      return "";
    }
  };

  // Function to repair images by converting blob URLs to data URLs
  const handleRepairImages = async () => {
    if (isConvertingToDataUrl) return;
    setIsConvertingToDataUrl(true);

    try {
      console.log("Repairing images by converting blob URLs to data URLs...");
      let needsUpdate = false;
      const updatedImages = [...uploadedImages];

      for (let i = 0; i < updatedImages.length; i++) {
        // Only convert if the image is invalid
        if (
          imageValidityMap[i] === false &&
          updatedImages[i].url.startsWith("blob:")
        ) {
          console.log(`Converting image ${i} from blob URL to data URL...`);
          const dataUrl = await blobToDataUrl(updatedImages[i].url);

          if (dataUrl) {
            console.log(`Successfully converted image ${i} to data URL`);
            // Update the image URL to the data URL
            updatedImages[i] = {
              ...updatedImages[i],
              url: dataUrl,
            };
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        console.log("Updating store with repaired images...");
        // Update the store with the new images
        clearUploadedImages();
        updatedImages.forEach((img) => addUploadedImage(img));

        // Update the current image URL if it was one of the repaired ones
        if (activeImageIndex < updatedImages.length) {
          setImageUrl(updatedImages[activeImageIndex].url);
        }

        // Reset the validity map to trigger rechecking
        setImageValidityMap({});
      }
    } catch (error) {
      console.error("Error repairing images:", error);
    } finally {
      setIsConvertingToDataUrl(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        console.log(
          "Dropzone onDrop called with",
          acceptedFiles.length,
          "files"
        );
        // Process all uploaded files
        for (const file of acceptedFiles) {
          if (file.type.startsWith("image/")) {
          await uploadImage(file);
          }
        }
      }
    },
    [uploadImage]
  );

  // Using noClick to prevent automatic opening of file dialog
  // We'll handle it manually with our Select Images button
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true, // Allow multiple file selection
    noClick: true, // Prevent opening file dialog on click
  });

  // Handle manual file selection with debounce to prevent double opening
  const [isSelectingFile, setIsSelectingFile] = useState(false);

  const handleSelectImage = () => {
    // Prevent double click issues
    if (isSelectingFile) return;

    setIsSelectingFile(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    // Reset after a short delay
    setTimeout(() => setIsSelectingFile(false), 1000);
  };

  // Handle file input change separately to prevent reopening
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("File input change event triggered");
    e.preventDefault(); // Prevent default
    e.stopPropagation(); // Stop event propagation

    if (e.target.files && e.target.files.length > 0) {
      console.log("Processing", e.target.files.length, "files from file input");

      // Upload all selected files
      for (let i = 0; i < e.target.files.length; i++) {
        await uploadImage(e.target.files[i]);
      }

      // Reset the input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  // Navigate through uploaded images
  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedImages.length > 1) {
      setLocalActiveImageIndex(
        (prev: number) => (prev + 1) % uploadedImages.length
      );
    }
  };

  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedImages.length > 1) {
      setLocalActiveImageIndex(
        (prev: number) =>
          (prev - 1 + uploadedImages.length) % uploadedImages.length
      );
    }
  };

  // Delete an image
  const deleteImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (uploadedImages.length > 0) {
      // Create a new array without the deleted image
      const newImages = [...uploadedImages];

      // Don't revoke the URL here to prevent issues with other images
      // that might be using the same URL reference
      // URL.revokeObjectURL(newImages[index].url);

      newImages.splice(index, 1);

      // Update the store with the new array
      clearUploadedImages();
      newImages.forEach((img) => addUploadedImage(img));

      // If we deleted the last image, clear everything
      if (newImages.length === 0) {
        setImageUrl(null);
        setLocalActiveImageIndex(0);
      }
      // If we deleted the active image, set active to the last image
      else if (index === activeImageIndex) {
        const newActiveIndex = Math.min(index, newImages.length - 1);
        setLocalActiveImageIndex(newActiveIndex);
        setImageUrl(newImages[newActiveIndex].url);
      }
      // If we deleted an image before the active one, adjust the index
      else if (index < activeImageIndex) {
        setLocalActiveImageIndex(activeImageIndex - 1);
      }
    }
  };

  // Toggle fullscreen preview
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullscreen(!showFullscreen);
  };

  // Toggle grid view
  const toggleGridView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGridView(!isGridView);
  };

  // Get the current active image URL
  const activeImageUrl =
    uploadedImages.length > 0 ? uploadedImages[activeImageIndex]?.url : null;

  // Debug log for images
  useEffect(() => {
    if (uploadedImages.length > 0) {
      console.log("Uploaded images:", uploadedImages);
      console.log("First image URL:", uploadedImages[0]?.url);
      console.log(
        "NOTE: Blob URLs cannot be accessed by clicking them directly. They only work in the img tags within the app."
      );

      // Verify the first image actually has content (better debug)
      if (uploadedImages[0]?.file) {
        console.log(
          "First image file size:",
          Math.round(uploadedImages[0].file.size / 1024),
          "KB"
        );
        console.log("First image type:", uploadedImages[0].file.type);
      }
    }
  }, [uploadedImages]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
          <FiCamera className="mr-2 text-blue-500" /> Upload Your Images
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          High-quality images will generate better captions. You can upload
          multiple images.
        </p>
      </motion.div>

      <div
        {...getRootProps()}
        className={`relative w-full h-[400px] rounded-xl overflow-hidden transition-all duration-300 ${
          isDragActive
            ? "ring-4 ring-blue-500 scale-[1.02]"
            : "ring-1 ring-gray-200 dark:ring-gray-700"
        } ${
          isUploading || uploadedImages.length > 0
            ? "bg-gray-900"
            : "bg-gradient-to-br from-gray-800 to-gray-900"
        }`}
      >
        <input {...getInputProps()} />
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple // Allow multiple file selection
          onChange={handleFileInputChange}
          aria-label="Upload images"
          title="Upload images"
        />

        {/* Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-black">
          {uploadedImages.length === 0 && !isUploading && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1),_transparent_70%)]"></div>
          )}
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {uploadedImages.length === 0 && !isUploading ? (
            <motion.div
                key="upload-prompt"
              className="flex flex-col items-center justify-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                  className="w-24 h-24 mb-6 rounded-full bg-white/10 flex items-center justify-center"
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                    backgroundColor: isDragActive
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(255, 255, 255, 0.1)",
                }}
                  whileHover={{ scale: 1.05 }}
              >
                  <FiUpload className="w-10 h-10 text-white" />
              </motion.div>
                <h3 className="text-2xl font-bold mb-3">
                  {isDragActive
                    ? "Drop your images here"
                    : "Drag & Drop your images"}
              </h3>
                <p className="text-white/70 text-center max-w-md mb-6">
                  Upload high-quality images to generate Instagram captions that
                  match your content perfectly
              </p>
              <motion.button
                onClick={(e) => {
                    e.stopPropagation(); // Stop event propagation
                  handleSelectImage();
                }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full font-medium text-white shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)",
                  }}
                whileTap={{ scale: 0.95 }}
              >
                  Select Images
              </motion.button>
                <div className="mt-6 flex items-center text-white/60 text-sm">
                  <FiImage className="mr-2" /> Supports JPG, PNG, GIF, WEBP
                </div>
            </motion.div>
          ) : isUploading ? (
              <motion.div
                key="uploading"
                className="flex flex-col items-center justify-center text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
              <div className="w-64 h-64 mb-4">
                <Lottie 
                  animationData={uploadAnimation} 
                  loop={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <div className="w-full max-w-xs bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                />
              </div>
                <p className="text-white/90 font-medium text-lg">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="image-preview"
                className="relative w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* View mode selector */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 backdrop-blur-sm rounded-full p-1 flex space-x-1">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGridView(false);
                    }}
                    className={`p-2 rounded-full ${
                      !isGridView
                        ? "bg-blue-500 text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Carousel View"
                  >
                    <FiLayers size={16} />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGridView(true);
                    }}
                    className={`p-2 rounded-full ${
                      isGridView
                        ? "bg-blue-500 text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Grid View"
                  >
                    <FiGrid size={16} />
                  </motion.button>
                </div>

                {/* Grid View */}
                {isGridView ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 w-full h-full overflow-y-auto z-10 bg-gray-900/50">
                    {uploadedImages.map((image, index) => {
                      return (
                        <div
                          key={`grid-item-${index}`}
                          className={`relative rounded-lg overflow-hidden cursor-pointer h-32 ${
                            index === activeImageIndex
                              ? "ring-2 ring-blue-500"
                              : "border border-gray-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalActiveImageIndex(index);
                            setIsGridView(false);
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/30">
                            <Image
                              src={image.url}
                              alt={`Uploaded ${index + 1}`}
                              width={500}
                              height={500}
                              className="max-w-full max-h-full object-contain"
                              style={{
                                backgroundColor: "#2d3748",
                                filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                                padding: "2px",
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', e);
                                e.currentTarget.src = '/fallback.svg';
                              }}
                />
              </div>
                        </div>
                      );
                    })}
            </div>
          ) : (
                  // Carousel View
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Navigation buttons */}
                    {uploadedImages.length > 1 && (
                      <>
                        <motion.button
                          onClick={showPrevImage}
                          className="absolute left-4 z-20 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiChevronLeft size={20} />
                        </motion.button>
                        <motion.button
                          onClick={showNextImage}
                          className="absolute right-4 z-20 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiChevronRight size={20} />
                        </motion.button>
                      </>
                    )}

                    {/* Active image */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      {uploadedImages[activeImageIndex] && (
                        <Image
                          src={uploadedImages[activeImageIndex].url}
                          alt={`Uploaded ${activeImageIndex + 1}`}
                          width={500}
                          height={500}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.error('Image failed to load:', e);
                            e.currentTarget.src = '/fallback.svg';
                          }}
                        />
                      )}

                      {/* Image controls - positioned at the top right */}
                      <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(activeImageIndex, e);
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                        <motion.button
                          onClick={toggleFullscreen}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiMaximize2 size={16} />
                        </motion.button>
                      </div>

                      {/* Pagination dots */}
                      {uploadedImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
                          {uploadedImages.map((_, index) => (
                            <motion.button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocalActiveImageIndex(index);
                              }}
                              className={`w-2 h-2 rounded-full ${
                                index === activeImageIndex
                                  ? "bg-white"
                                  : "bg-white/40 hover:bg-white/60"
                              }`}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Image count indicator */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {activeImageIndex + 1} / {uploadedImages.length}
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {/* Add more images button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectImage();
                    }}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg"
                    whileHover={{
                      scale: 1.1,
                      boxShadow:
                        "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Add more images"
                  >
                    <FiPlus className="w-5 h-5" />
                  </motion.button>

                  {/* Remove all images button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetUpload();
                    }}
                    className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center text-white shadow-lg"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Remove all images"
                  >
                    <FiX className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen preview modal */}
      {showFullscreen && activeImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <Image
            src={activeImageUrl}
            alt="Fullscreen preview"
            width={1000}
            height={1000}
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
            onClick={() => setShowFullscreen(false)}
            aria-label="Close fullscreen preview"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Fullscreen navigation controls */}
          {uploadedImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevImage(e);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage(e);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-start"
          >
            <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Upload Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
