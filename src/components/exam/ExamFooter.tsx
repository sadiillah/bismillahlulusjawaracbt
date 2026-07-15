
import { ClipboardList } from "lucide-react";
import type { SubjectExam, AuthUser } from "../../types";

interface ExamFooterProps {
  exam: SubjectExam;
  user: AuthUser;
}

export const ExamFooter = ({ exam, user }: ExamFooterProps) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Exam Info with Icon */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative flex items-center justify-center rounded-full bg-[#EF3F09]">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-brand-dark text-base font-bold">
                {exam.name}
              </h3>
              <p className="text-gray-500 text-sm">
                {exam.subject?.name || "Unknown Subject"}
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="text-right">
            <p className="text-brand-dark text-base font-bold">
              {user.name}
            </p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};