import { useRef, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment, Float } from '@react-three/drei';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { useImageUpload } from '../hooks/useImageUpload';
import { useCaptionStore } from '../store/captionStore';

// 3D Model component
function Model(props: any) {
  const { scene } = useGLTF('/models/photo_frame.glb');
  return <primitive object={scene} {...props} />;
}

export default function ImageUploader() {
  const { uploadImage, clearImage, error } = useImageUpload();
  const { selectedImage, imageUrl, isUploading, uploadProgress } = useCaptionStore();
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type.startsWith('image/')) {
          await uploadImage(file);
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
    maxFiles: 1,
    multiple: false,
  });

  // Update dragging state for animation
  const handleDragEnter = useCallback(() => setIsDragging(true), []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative w-full h-[400px] rounded-xl overflow-hidden transition-all duration-300 ${
          isDragActive ? 'ring-4 ring-blue-500 scale-[1.02]' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input {...getInputProps()} />
        
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
          {!selectedImage && !imageUrl ? (
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
                {isDragActive ? "Drop your image here" : "Drag & Drop your image"}
              </h3>
              <p className="text-white/70 text-center max-w-md mb-4">
                Upload a high-quality image to generate Instagram captions
              </p>
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Image
              </motion.button>
            </motion.div>
          ) : isUploading ? (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="w-full max-w-xs bg-white/10 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>Uploading... {Math.round(uploadProgress)}%</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="Uploaded" 
                  className="w-full h-full object-contain"
                />
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 