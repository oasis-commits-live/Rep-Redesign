import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Camera, X, Check, Loader2, Trash2, ImageIcon } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '../data/api';

// ── Canvas helper: crop image to circle and return base64 ──
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 512
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  // Draw the cropped region into a circle
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

interface ProfilePictureCropperProps {
  currentAvatarUrl: string | null;
  displayName: string;
  onAvatarChange: (url: string | null) => void;
}

export function ProfilePictureCropper({
  currentAvatarUrl,
  displayName,
  onAvatarChange,
}: ProfilePictureCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const openFilePicker = () => {
    setShowActions(false);
    // Trigger the native file picker — on mobile this prompts for gallery permission
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Read as data URL for the cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so selecting the same file again works
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      const result = await uploadAvatar(croppedBase64);
      onAvatarChange(result.url);
      setCropModalOpen(false);
      setImageSrc(null);
    } catch (err) {
      console.log('[Avatar] Upload failed:', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setImageSrc(null);
  };

  const handleDelete = async () => {
    setShowActions(false);
    setDeleting(true);
    try {
      await deleteAvatar();
      onAvatarChange(null);
    } catch (err) {
      console.log('[Avatar] Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Hidden file input — accepts images from gallery/camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar circle with camera overlay */}
      <div className="relative group">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (currentAvatarUrl) {
              setShowActions(true);
            } else {
              openFilePicker();
            }
          }}
          className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 focus:outline-none"
        >
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#34C759] flex items-center justify-center">
              <span className="text-[28px] text-white" style={{ fontWeight: 600 }}>
                {initial}
              </span>
            </div>
          )}

          {/* Camera overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <Camera className="w-4.5 h-4.5 text-white" />
            </div>
          </div>

          {/* Loading overlay */}
          {deleting && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Actions sheet (Change Photo / Remove) */}
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActions(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 z-[201] px-4 pb-8"
            >
              <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_-4px_30px_rgba(0,0,0,0.15)]">
                <div className="px-5 pt-5 pb-2">
                  <p className="text-[15px] text-[#8e8e93] text-center" style={{ fontWeight: 500 }}>
                    Profile Photo
                  </p>
                </div>
                <button
                  onClick={openFilePicker}
                  className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-[#e5e5ea] text-left active:bg-[rgba(0,0,0,0.03)]"
                >
                  <ImageIcon className="w-5 h-5 text-[#34C759]" />
                  <span className="text-[17px] text-[#1c1c1e]" style={{ fontWeight: 400 }}>
                    Choose from Library
                  </span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-[#e5e5ea] text-left active:bg-[rgba(0,0,0,0.03)]"
                >
                  <Trash2 className="w-5 h-5 text-[#ff3b30]" />
                  <span className="text-[17px] text-[#ff3b30]" style={{ fontWeight: 400 }}>
                    Remove Photo
                  </span>
                </button>
              </div>
              <button
                onClick={() => setShowActions(false)}
                className="w-full mt-2 bg-white rounded-[14px] py-3.5 text-center shadow-[0_-2px_12px_rgba(0,0,0,0.08)] active:bg-[rgba(0,0,0,0.03)]"
              >
                <span className="text-[17px] text-[#007AFF]" style={{ fontWeight: 600 }}>
                  Cancel
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Crop Modal ── */}
      <AnimatePresence>
        {cropModalOpen && imageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3 bg-black/80 backdrop-blur-sm z-10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCropCancel}
                disabled={uploading}
                className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.15)] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
              <span className="text-[17px] text-white" style={{ fontWeight: 600 }}>
                Adjust Photo
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCropConfirm}
                disabled={uploading}
                className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Check className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </div>

            {/* Cropper area */}
            <div className="flex-1 relative">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    background: '#000',
                  },
                  mediaStyle: {},
                  cropAreaStyle: {
                    border: '3px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                  },
                }}
              />
            </div>

            {/* Zoom slider */}
            <div className="px-8 py-6 bg-black/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-[rgba(255,255,255,0.5)]">-</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none rounded-full bg-[rgba(255,255,255,0.2)] accent-[#34C759]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.3)]"
                />
                <span className="text-[12px] text-[rgba(255,255,255,0.5)]">+</span>
              </div>
              <p className="text-[12px] text-[rgba(255,255,255,0.35)] text-center mt-3">
                Pinch or slide to adjust
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}