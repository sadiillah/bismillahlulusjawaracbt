import  { useEffect, useState } from 'react';
import { X, Calendar, User, BookOpen, Download, ExternalLink } from 'lucide-react';
import type { Subject } from '../../types';

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

const SubjectDetailsModal = ({
  isOpen,
  onClose,
  subject,
}: SubjectDetailsModalProps) => {
  const [photoError, setPhotoError] = useState(false);
  const [topicPhotoError, setTopicPhotoError] = useState(false);
  const [teacherPhotoError, setTeacherPhotoError] = useState(false);

  // Reset photo error states when subject changes
  useEffect(() => {
    if (subject) {
      setPhotoError(false);
      setTopicPhotoError(false);
      setTeacherPhotoError(false);
    }
  }, [subject]);

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

  if (!isOpen || !subject) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPdfFileName = (contentPath: string) => {
    if (!contentPath) return 'Subject Content';
    const parts = contentPath.split('/');
    return parts[parts.length - 1] || 'Subject Content';
  };

  return (
    <>
      {/* Backdrop - covers left 60% of screen */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 right-[40%] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal - fixed right side, 40% width */}
      <div 
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out w-full sm:w-[90%] md:w-[50%] lg:w-[40%] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 truncate pr-4">
            Subject Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Subject Photo */}
          <div className="p-6 border-b border-gray-100">
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {subject.photo && !photoError ? (
                <img
                  src={subject.photo}
                  alt={subject.name}
                  className="w-full h-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                  <div className="text-center text-blue-600">
                    <BookOpen className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-sm font-medium">Subject Image</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="p-6 space-y-4 border-b border-gray-100">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{subject.name}</h3>
              {subject.tagline && (
                <p className="text-lg text-blue-600 font-medium mb-3">{subject.tagline}</p>
              )}
              <p className="text-gray-700 leading-relaxed">{subject.about}</p>
            </div>
          </div>

          {/* Topic Information */}
          {subject.topic && (
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                Topic
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-blue-200 flex-shrink-0">
                    {subject.topic.photo && !topicPhotoError ? (
                      <img
                        src={subject.topic.photo}
                        alt={subject.topic.name}
                        className="w-full h-full object-cover"
                        onError={() => setTopicPhotoError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-semibold text-blue-900 truncate mb-1">
                      {subject.topic.name}
                    </h5>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {subject.topic.about || 'No description available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Information */}
          {subject.teacher && (
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-500" />
                Teacher
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-green-200 flex-shrink-0">
                    {subject.teacher.photo && !teacherPhotoError ? (
                      <img
                        src={subject.teacher.photo}
                        alt={subject.teacher.name || 'Teacher'}
                        className="w-full h-full object-cover"
                        onError={() => setTeacherPhotoError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                        <User className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-semibold text-green-900 truncate mb-1">
                      {subject.teacher.name || `Teacher ${subject.teacher_id}`}
                    </h5>
                    {subject.teacher.email && (
                      <p className="text-sm text-green-700 truncate">
                        {subject.teacher.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content/PDF Section */}
          {subject.content && (
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2 text-purple-500" />
                Subject Content
              </h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">
                        {getPdfFileName(subject.content)}
                      </p>
                      <p className="text-xs text-purple-600">PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={subject.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Subject ID</span>
                <span className="text-sm text-gray-900">#{subject.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Created</span>
                <span className="text-sm text-gray-900">{subject.created_at ? formatDate(subject.created_at) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">{subject.updated_at ? formatDate(subject.updated_at) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectDetailsModal;