import { useState, useEffect, useCallback } from 'react';
import { useModalTeachers, useModalTeacherSearch } from '../../hooks/useTeachers';
import type { Teacher } from '../../types';

// Teacher photo component with error handling
const TeacherPhoto = ({ teacher, size = 'md' }: { teacher: Teacher; size?: 'sm' | 'md' }) => {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';

  useEffect(() => {
    setImageError(false);
  }, [teacher.id]);

  // Use direct photo field from teacher object
  const photoUrl = teacher.photo;
  
  if (!photoUrl || imageError) {
    return (
      <div className={`${sizeClasses} rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center border border-gray-200`}>
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-lg overflow-hidden bg-gray-100 border border-gray-200`}>
      <img 
        src={photoUrl} 
        alt={teacher.name || 'Teacher'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

interface TeacherSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (teacher: Teacher) => void;
  selectedTeacherId?: number;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const TeacherSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedTeacherId 
}: TeacherSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [tempSelectedId, setTempSelectedId] = useState<number | undefined>(selectedTeacherId);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Hooks for data fetching
  const { 
    data: regularTeachers, 
    isLoading: isLoadingRegular,
    error: regularError
  } = useModalTeachers(currentPage, 10, isOpen);
  
  const { 
    data: searchResults, 
    isLoading: isLoadingSearch,
    error: searchError
  } = useModalTeacherSearch(debouncedSearch, currentPage, 10);

  // Determine what data to show
  const isSearching = debouncedSearch.length > 0;
  const currentData = isSearching ? searchResults : regularTeachers;
  const isLoading = isSearching ? isLoadingSearch : isLoadingRegular;
  const error = isSearching ? searchError : regularError;

  // Update teachers list when data changes
  useEffect(() => {
    if (currentData?.data && currentData.data.length > 0) {
      if (currentPage === 1) {
        // Reset list for first page (both search and regular)
        setAllTeachers(currentData.data);
        console.log('Set teachers from first page:', currentData.data.length, isSearching ? '(search)' : '(regular)');
      } else {
        // Append for pagination (Load More) - both search and regular
        setAllTeachers(prev => {
          const newTeachers = [...prev, ...currentData.data];
          console.log('Appended teachers, total:', newTeachers.length, isSearching ? '(search)' : '(regular)');
          return newTeachers;
        });
      }
    }
  }, [currentData?.data, isSearching, currentPage]);

  // Reset when search changes (but not for initial empty search)
  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setCurrentPage(1);
      setAllTeachers([]);
    }
  }, [debouncedSearch]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTempSelectedId(selectedTeacherId);
      setSearchQuery('');
      setCurrentPage(1);
      setAllTeachers([]); // Clear teachers to prevent stale data
      console.log('Teacher Modal opened, reset state');
    }
  }, [isOpen, selectedTeacherId]);

  // Debug logging
  useEffect(() => {
    console.log('TeacherModal State:', {
      isOpen,
      allTeachers: allTeachers.length,
      currentData: currentData?.data?.length,
      isLoading,
      error: !!error,
      isSearching,
      currentPage
    });
  }, [isOpen, allTeachers.length, currentData, isLoading, error, isSearching, currentPage]);

  const handleLoadMore = useCallback(() => {
    const current = currentData?.meta?.current_page;
    const last = currentData?.meta?.last_page;
    if (current !== undefined && last !== undefined && current < last) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentData]);

  const handleTeacherSelect = useCallback((teacher: Teacher) => {
    setTempSelectedId(teacher.id);
  }, []);

  const handleConfirmSelection = useCallback(() => {
    const selectedTeacher = allTeachers.find(teacher => teacher.id === tempSelectedId);
    if (selectedTeacher) {
      onSelect(selectedTeacher);
    }
    onClose();
  }, [tempSelectedId, allTeachers, onSelect, onClose]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Teacher</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search teachers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Teachers List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && allTeachers.length === 0 ? (
            // Initial loading state
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3 p-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-red-600">Failed to load teachers</p>
              <p className="text-sm text-gray-500">Please try again</p>
            </div>
          ) : allTeachers.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="mt-2 text-gray-600">
                {isSearching ? `No teachers found for "${searchQuery}"` : 'No teachers available'}
              </p>
              <p className="text-sm text-gray-500">
                {isSearching ? 'Try adjusting your search terms' : 'Teachers will appear here when available'}
              </p>
            </div>
          ) : (
            // Teachers list
            <div className="space-y-2">
              {allTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    tempSelectedId === teacher.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTeacherSelect(teacher)}
                >
                  {/* Teacher Photo */}
                  <div className="flex-shrink-0">
                    <TeacherPhoto teacher={teacher} size="md" />
                  </div>
                  
                  {/* Teacher Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {teacher.name || `Teacher ${teacher.id}`}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {teacher.email || 'No email provided'}
                    </p>
                  </div>
                  
                  {/* Radio Button */}
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      tempSelectedId === teacher.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {tempSelectedId === teacher.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && 
           currentData?.meta?.current_page !== undefined &&
           currentData?.meta?.last_page !== undefined &&
           currentData.meta.current_page < currentData.meta.last_page && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Load More Teachers
              </button>
            </div>
          )}

          {/* Loading More */}
          {isLoading && allTeachers.length > 0 && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 text-gray-600">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading more...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!tempSelectedId}
            className={`px-4 py-2 rounded-md transition-colors ${
              tempSelectedId
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Select Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSelectionModal;