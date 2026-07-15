import { useEffect } from 'react';
import { X } from 'lucide-react';

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  alt?: string;
}

const PhotoPreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  alt = "Photo preview"
}: PhotoPreviewModalProps) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      {/* Backdrop - click to close */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal Content */}
      <div className="relative max-w-4xl max-h-full bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
          aria-label="Close preview"
        >
          <X size={20} />
        </button>

        {/* Image */}
        <div className="flex items-center justify-center min-h-[200px] max-h-[80vh]">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain max-h-[80vh]"
          />
        </div>

        {/* Optional: Image info footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Click outside or press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreviewModal;