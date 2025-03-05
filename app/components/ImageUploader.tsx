import { useRef, useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment, Float, Text } from '@react-three/drei';
import { 
  FiUpload, FiImage, FiX, FiAlertCircle, FiPlus, FiCamera, 
  FiChevronLeft, FiChevronRight, FiMaximize2, FiGrid, FiLayers
} from 'react-icons/fi';
import Lottie from 'lottie-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { useCaptionStore } from '../store/captionStore';

// Import Lottie animation data
import uploadAnimation from '../animations/upload-animation.json';

// 3D Model component
function Model(props: any) {
  const { scene } = useGLTF('/models/photo_frame.glb');
  return <primitive object={scene} {...props} />;
}

export default function ImageUploader() {
  const { uploadImage, resetUpload, error } = useImageUpload();
  const { selectedImage, imageUrl, isUploading, uploadProgress, uploadedImages } = useCaptionStore();
  const [isDragging, setIsDragging] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update active image index when uploaded images change
  useEffect(() => {
    if (uploadedImages.length > 0 && activeImageIndex >= uploadedImages.length) {
      setActiveImageIndex(uploadedImages.length - 1);
    }
  }, [uploadedImages, activeImageIndex]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        // Process all uploaded files
        for (const file of acceptedFiles) {
          if (file.type.startsWith('image/')) {
            await uploadImage(file);
          }
        }
      }
    },
    [uploadImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true, // Allow multiple file selection
  });

  // Update dragging state for animation
  const handleDragEnter = useCallback(() => setIsDragging(true), []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  // Handle manual file selection
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change separately to prevent reopening
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation
    if (e.target.files && e.target.files.length > 0) {
      // Upload all selected files
      for (let i = 0; i < e.target.files.length; i++) {
        await uploadImage(e.target.files[i]);
      }
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Navigate through uploaded images
  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedImages.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % uploadedImages.length);
    }
  };

  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedImages.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + uploadedImages.length) % uploadedImages.length);
    }
  };

  // Delete specific image
  const deleteImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (uploadedImages.length > 0 && index >= 0 && index < uploadedImages.length) {
      // Create a new array without the image at the specified index
      const newImages = [...uploadedImages];
      
      // Revoke the object URL to prevent memory leaks
      if (newImages[index].url) {
        URL.revokeObjectURL(newImages[index].url);
      }
      
      // Remove the image from the array
      newImages.splice(index, 1);
      
      // Update the store with the new array
      useCaptionStore.setState({ uploadedImages: newImages });
      
      // If we deleted the active image, adjust the active index
      if (index === activeImageIndex) {
        // If it was the last image, go to the previous one
        if (index === uploadedImages.length - 1 && index > 0) {
          setActiveImageIndex(index - 1);
        } else if (uploadedImages.length === 1) {
          // If it was the only image, reset everything
          resetUpload();
        }
        // Otherwise, keep the same index (which will now point to the next image)
      } else if (index < activeImageIndex) {
        // If we deleted an image before the active one, adjust the index
        setActiveImageIndex(activeImageIndex - 1);
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
  const activeImageUrl = uploadedImages.length > 0 ? uploadedImages[activeImageIndex]?.url : null;

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
          High-quality images will generate better captions. You can upload multiple images.
        </p>
      </motion.div>
      
      <div
        {...getRootProps()}
        className={`relative w-full h-[400px] rounded-xl overflow-hidden transition-all duration-300 ${
          isDragActive ? 'ring-4 ring-blue-500 scale-[1.02]' : 'ring-1 ring-gray-200 dark:ring-gray-700'
        } ${isUploading || uploadedImages.length > 0 ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-800 to-gray-900'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
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
                    backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiUpload className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3">
                  {isDragActive ? "Drop your images here" : "Drag & Drop your images"}
                </h3>
                <p className="text-white/70 text-center max-w-md mb-6">
                  Upload high-quality images to generate Instagram captions that match your content perfectly
                </p>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation(); // Stop event propagation
                    handleSelectImage();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full font-medium text-white shadow-lg"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)'
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
                    style={{ width: '100%', height: '100%' }}
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
                <p className="text-white/90 font-medium text-lg">Uploading... {Math.round(uploadProgress)}%</p>
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
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm rounded-full p-1 flex space-x-1">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGridView(false);
                    }}
                    className={`p-2 rounded-full ${
                      !isGridView ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
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
                      isGridView ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Grid View"
                  >
                    <FiGrid size={16} />
                  </motion.button>
                  <motion.button
                    onClick={toggleFullscreen}
                    className={`p-2 rounded-full text-white/70 hover:text-white`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="View fullscreen"
                    title="Fullscreen View"
                  >
                    <FiMaximize2 size={16} />
                  </motion.button>
                </div>
                
                {/* Grid View */}
                {isGridView ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 w-full h-full overflow-y-auto">
                    {uploadedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        className={`relative rounded-lg overflow-hidden cursor-pointer h-32 bg-gray-800 ${
                          index === activeImageIndex ? 'ring-2 ring-blue-500' : ''
                        }`}
                        whileHover={{ scale: 1.05, zIndex: 10 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(index);
                        }}
                      >
                        <img
                          src={image.url}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-full object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <motion.button
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="p-1.5 bg-red-500 rounded-full text-white absolute top-1 right-1"
                            onClick={(e) => deleteImage(index, e)}
                          >
                            <FiX size={14} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Carousel View
                  <div className="w-full h-full relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeImageIndex}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full flex items-center justify-center p-4"
                        >
                          <img
                            src={activeImageUrl || ''}
                            alt={`Uploaded ${activeImageIndex + 1} of ${uploadedImages.length}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            style={{ 
                              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                            }}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Image navigation controls */}
                    {uploadedImages.length > 1 && (
                      <>
                        <motion.button
                          onClick={showPrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.button
                          onClick={showNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}
                    
                    {/* Pagination dots */}
                    {uploadedImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center space-x-2">
                        {uploadedImages.map((_, index) => (
                          <motion.button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex(index);
                            }}
                            className={`w-2.5 h-2.5 rounded-full ${
                              index === activeImageIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
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
                      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)'
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
                      backgroundColor: 'rgba(239, 68, 68, 0.9)'
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
          <img
            src={activeImageUrl}
            alt="Fullscreen preview"
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