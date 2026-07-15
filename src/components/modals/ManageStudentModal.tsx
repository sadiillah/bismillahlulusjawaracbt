import React, { useState } from "react";
import {
  UserCog,
  X,
  CheckCircle,
  Clock,
  FileText,
  Upload,
} from "lucide-react";
import type { 
  ManageStudentModalData, 
  StudentStatus,
  ManageStudentRequest 
} from "../../types";

interface ManageStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ManageStudentModalData | null;
  onSave: (request: ManageStudentRequest) => void;
  isLoading?: boolean;
}

const ManageStudentModal = ({
  isOpen,
  onClose,
  data,
  onSave,
  isLoading = false,
}: ManageStudentModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus>(
    data?.classStudent.has_passed ? 'passed' : 'in_progress'
  );
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);


  React.useEffect(() => {
    if (data?.classStudent) {
      setSelectedStatus(data.classStudent.has_passed ? 'passed' : 'in_progress');
      setNewPdfFile(null);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const { student, classStudent } = data;
  const hasExistingRapport = !!classStudent.rapport;
  
  // Check if student is already "complete" (passed status + has rapport)
  const isStudentComplete = selectedStatus === 'passed' && hasExistingRapport;
  
  // Check if student has already passed (cannot go back to in progress)
  const studentHasPassed = classStudent.has_passed;
  
  // Check if there are any changes to save
  const hasChanges = selectedStatus !== (classStudent.has_passed ? 'passed' : 'in_progress') || newPdfFile !== null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setNewPdfFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setNewPdfFile(file);
    }
  };

  const removeNewPdf = () => {
    setNewPdfFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    const request: ManageStudentRequest = {
      studentId: student.id,
      classRoomId: classStudent.class_room_id,
      status: selectedStatus,
    };

    if (newPdfFile) {
      request.rapport = newPdfFile;
    }

    onSave(request);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-2xl mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#DCDEDD]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-[12px] flex items-center justify-center">
                <UserCog className="w-6 h-6 text-[#0C1C3C]" />
              </div>
              <div>
                <h3 className="text-brand-dark text-xl font-bold">
                  Manage Student
                </h3>
                <p className="text-brand-dark text-sm font-normal">
                  Update status and upload report for{" "}
                  <span className="font-semibold">{student.name}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#EF3F09] transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <form className="space-y-6">
            {/* Student Status Selection */}
            <div>
              <label className="block text-brand-dark text-sm font-semibold mb-2">
                Student Status <span className="text-[#EF3F09]">*</span>
              </label>
              <div className="flex gap-4">
                {/* Passed Option */}
                <label className="group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 has-[:checked]:ring-2 has-[:checked]:ring-[#EF3F09] has-[:checked]:ring-offset-2 transition-all duration-300 cursor-pointer">
                  <div className="flex flex-col items-start gap-3 flex-1">
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className="w-full h-full absolute bg-green-100 rounded-[22px]"></div>
                      <CheckCircle className="w-6 h-6 text-green-600 relative z-10" />
                    </div>
                    <div className="text-left">
                      <p className="text-brand-dark text-base font-semibold">
                        Passed
                      </p>
                      <p className="text-gray-500 text-sm">
                        Student has completed successfully
                      </p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="passed"
                      checked={selectedStatus === 'passed'}
                      onChange={(e) => setSelectedStatus(e.target.value as StudentStatus)}
                      className="hidden"
                    />
                    <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                      selectedStatus === 'passed' 
                        ? 'border-[5px] border-[#EF3F09]' 
                        : 'border border-[#DCDEDD]'
                    }`}></div>
                    <p className="text-xs font-semibold">
                      {selectedStatus === 'passed' ? 'Selected' : 'Select'}
                    </p>
                  </div>
                </label>

                {/* In Progress Option - Only show if student hasn't passed yet */}
                {!studentHasPassed && (
                  <label className="group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 has-[:checked]:ring-2 has-[:checked]:ring-[#EF3F09] has-[:checked]:ring-offset-2 transition-all duration-300 cursor-pointer">
                  <div className="flex flex-col items-start gap-3 flex-1">
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className="w-full h-full absolute bg-blue-100 rounded-[22px]"></div>
                      <Clock className="w-6 h-6 text-blue-600 relative z-10" />
                    </div>
                    <div className="text-left">
                      <p className="text-brand-dark text-base font-semibold">
                        In Progress
                      </p>
                      <p className="text-gray-500 text-sm">
                        Student is still working
                      </p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="in_progress"
                      checked={selectedStatus === 'in_progress'}
                      onChange={(e) => setSelectedStatus(e.target.value as StudentStatus)}
                      className="hidden"
                    />
                    <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                      selectedStatus === 'in_progress' 
                        ? 'border-[5px] border-[#EF3F09]' 
                        : 'border border-[#DCDEDD]'
                    }`}></div>
                    <p className="text-xs font-semibold">
                      {selectedStatus === 'in_progress' ? 'Selected' : 'Select'}
                    </p>
                  </div>
                </label>
                )}
              </div>
            </div>

            {/* Existing Rapport Display */}
            {hasExistingRapport && (
              <div>
                <label className="block text-brand-dark text-sm font-semibold mb-2">
                  Student Report
                </label>
                <div className="w-full p-4 border-2 border-[#DCDEDD] rounded-[16px] bg-gray-50">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-center">
                      <h4 className="text-brand-dark text-sm font-semibold break-words">
                        {`${student.name}_rapport.pdf`}
                      </h4>
                      <p className="text-gray-500 text-xs">
                        PDF file
                      </p>
                      <p className="text-green-600 text-xs font-medium mt-1">
                        Report uploaded
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload PDF Report - Only show if no existing rapport */}
            {!hasExistingRapport && (
              <div>
                <label className="block text-brand-dark text-sm font-semibold mb-2">
                  Upload Report (PDF)
                </label>
              <div className="relative">
                {!newPdfFile ? (
                  <div
                    className="border-2 border-dashed border-[#DCDEDD] rounded-[16px] p-6 hover:border-[#EF3F09] transition-all duration-300 cursor-pointer"
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF files up to 5MB
                      </p>
                      <button
                        type="button"
                        className="mt-3 px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300"
                      >
                        Choose PDF File
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PDF Preview in Report Card Style */
                  <div className="relative">
                    <button
                      type="button"
                      onClick={removeNewPdf}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="w-full p-4 border-2 border-[#DCDEDD] rounded-[16px] bg-gray-50">
                      <div className="flex flex-col gap-3">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-center">
                          <h4 className="text-brand-dark text-sm font-semibold break-words">
                            {newPdfFile.name}
                          </h4>
                          <p className="text-gray-500 text-xs">
                            {formatFileSize(newPdfFile.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  name="report"
                  accept=".pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={handleFileChange}
                />
              </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end items-center gap-4 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3 disabled:opacity-50"
              >
                <span className="text-brand-dark text-base font-medium">
                  {isStudentComplete ? 'Close' : 'Cancel'}
                </span>
              </button>

              {/* Only show Save button if student is not complete or has changes */}
              {(!isStudentComplete || hasChanges) && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || !hasChanges}
                  className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span className="text-brand-white text-base font-semibold">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageStudentModal;