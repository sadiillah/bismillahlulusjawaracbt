import { useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading: boolean;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  isLoading,
}: DeleteConfirmationModalProps) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
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
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-lg mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#DCDEDD]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-brand-dark text-xl font-bold">{title}</h3>
                <p className="text-brand-dark text-sm font-normal">This action cannot be undone</p>
              </div>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#EF3F09] transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          <p className="text-gray-600 text-base mb-6 text-center">
            {message}
            {itemName && (
              <span className="font-semibold text-brand-dark block mt-2">"{itemName}"</span>
            )}
          </p>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-6 py-3"
            >
              <span className="text-brand-dark text-base font-medium">Cancel</span>
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`btn-secondary bg-red-600 hover:bg-red-700 rounded-[12px] transition-all duration-300 px-6 py-3 flex items-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span className="text-white text-base font-semibold">
                {isLoading ? 'Deleting...' : 'Delete'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;