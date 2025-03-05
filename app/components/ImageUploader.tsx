import { useRef, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment, Float } from '@react-three/drei';
import { FiUpload, FiImage, FiX, FiAlertCircle, FiPlus } from 'react-icons/fi';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const showNextImage = () => {
    if (uploadedImages.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % uploadedImages.length);
    }
  };

  const showPrevImage = () => {
    if (uploadedImages.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + uploadedImages.length) % uploadedImages.length);
    }
  };

  // Get the current active image URL
  const activeImageUrl = uploadedImages.length > 0 ? uploadedImages[activeImageIndex].url : null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative w-full h-[400px] rounded-xl overflow-hidden transition-all duration-300 ${
          isDragActive ? 'ring-4 ring-blue-500 scale-[1.02]' : ''
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
        
        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <PresentationControls
              global
              zoom={0.8}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <Float rotationIntensity={0.2}>
                {/* Replace with your 3D model or use a simple mesh */}
                <mesh scale={[2, 2, 0.2]} rotation={[0, 0, 0]}>
                  <boxGeometry args={[1, 1, 0.1]} />
                  <meshStandardMaterial 
                    color={isDragging ? "#3b82f6" : "#1e293b"} 
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              </Float>
            </PresentationControls>
            <Environment preset="city" />
          </Canvas>
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
          {uploadedImages.length === 0 && !isUploading ? (
            <motion.div
              className="flex flex-col items-center justify-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-20 h-20 mb-4 rounded-full bg-white/10 flex items-center justify-center"
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <FiUpload className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">
                {isDragActive ? "Drop your images here" : "Drag & Drop your images"}
              </h3>
              <p className="text-white/70 text-center max-w-md mb-4">
                Upload high-quality images to generate Instagram captions
              </p>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation(); // Stop event propagation
                  handleSelectImage();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Images
              </motion.button>
            </motion.div>
          ) : isUploading ? (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="w-64 h-64 mb-4">
                <Lottie 
                  animationData={uploadAnimation} 
                  loop={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="w-full max-w-xs bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white/90 font-medium">Uploading... {Math.round(uploadProgress)}%</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {activeImageUrl && (
                <img 
                  src={activeImageUrl} 
                  alt={`Uploaded ${activeImageIndex + 1} of ${uploadedImages.length}`} 
                  className="w-full h-full object-contain"
                />
              )}
              
              {/* Image navigation controls */}
              {uploadedImages.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-2">
                  {uploadedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full ${
                        index === activeImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Image count indicator */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
                {activeImageIndex + 1} / {uploadedImages.length}
              </div>
              
              {/* Add more images button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectImage();
                }}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                aria-label="Add more images"
              >
                <FiPlus className="w-5 h-5" />
              </button>
              
              {/* Remove current image button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Remove images"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Image thumbnails */}
      {uploadedImages.length > 1 && (
        <div className="mt-4 flex overflow-x-auto space-x-2 pb-2">
          {uploadedImages.map((image, index) => (
            <div 
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer ${
                index === activeImageIndex ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img 
                src={image.url} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 