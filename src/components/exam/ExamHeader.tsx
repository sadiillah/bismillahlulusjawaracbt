import  { useState, useEffect } from "react";
import { LogOut, Building2, CheckCircle } from "lucide-react";

interface ExamHeaderProps {
  onQuit: () => void;
  timeRemainingMinutes: number;
  isActive: boolean;
  onTimerExpired?: () => void;
  isQuestionAnswered?: boolean;
  examId?: number;
  questionId?: number;
  totalQuestionTimeSeconds?: number;
}

export const ExamHeader = ({
  onQuit,
  timeRemainingMinutes,
  isActive,
  onTimerExpired,
  isQuestionAnswered = false,
  examId,
  questionId,
  totalQuestionTimeSeconds,
}: ExamHeaderProps) => {
  const [timeLeft, setTimeLeft] = useState(timeRemainingMinutes * 60); // Convert to seconds
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Always check for stored remaining time first, regardless of prop changes
    if (examId && questionId && totalQuestionTimeSeconds) {
      const timerKey = `exam_${examId}_question_${questionId}_remaining`;
      const storedRemainingTime = localStorage.getItem(timerKey);
      
      if (storedRemainingTime && parseInt(storedRemainingTime) > 0) {
        const remainingSeconds = parseInt(storedRemainingTime);
        setTimeLeft(remainingSeconds);
        
        // Calculate progress based on stored time using actual total question time
        const progressPercent = (totalQuestionTimeSeconds - remainingSeconds) / totalQuestionTimeSeconds;
        setProgress(Math.max(0, progressPercent * 188.4));
        return;
      }
    }
    
    // Only use prop value if no valid localStorage data exists
    setTimeLeft(timeRemainingMinutes * 60);
    setProgress(0);
  }, [timeRemainingMinutes, examId, questionId, totalQuestionTimeSeconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0 || isQuestionAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Update localStorage with remaining time
        if (examId && questionId) {
          const timerKey = `exam_${examId}_question_${questionId}_remaining`;
          localStorage.setItem(timerKey, newTime.toString());
        }
        
        // Calculate progress (0 to 188.4 for SVG circle)
        const totalTime = totalQuestionTimeSeconds || timeRemainingMinutes * 60;
        const progressPercent = (totalTime - newTime) / totalTime;
        setProgress(progressPercent * 188.4);
        
        if (newTime <= 0) {
          // Clear timer immediately before calling onTimerExpired
          clearInterval(timer);
          // Auto-advance when time runs out
          onTimerExpired?.();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, timeRemainingMinutes, onTimerExpired, isQuestionAnswered, examId, questionId, totalQuestionTimeSeconds]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return {
      minutes: minutes.toString(),
      seconds: remainingSeconds.toString().padStart(2, '0')
    };
  };

  const { minutes, seconds } = formatTime(timeLeft);
  const isTimeWarning = timeLeft <= 300; // Last 5 minutes

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between relative">
          {/* Far Left: Quit Button */}
          <div className="flex items-center">
            <button
              onClick={onQuit}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-[12px] hover:border-red-500 hover:text-red-600 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Quit</span>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            <div className="w-14 h-14 relative flex items-center justify-center">
              <div className="w-14 h-14 absolute bg-[#EF3F09] rounded-full"></div>
              <Building2 className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-brand-dark text-lg font-bold">JawaraCBT</h1>
              <p className="text-brand-dark text-xs font-normal">Examination</p>
            </div>
          </div>

          {/* Far Right: Timer Container - always present for layout balance */}
          <div className="flex items-center">
            <div className="relative w-20 h-20">
              {!isQuestionAnswered ? (
                <>
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                      className="opacity-30"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke={isTimeWarning ? "#EF4444" : "#EF3F09"}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="188.4"
                      strokeDashoffset={progress}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-lg font-bold ${
                        isTimeWarning ? "text-red-600" : "text-brand-dark"
                      }`}
                    >
                      {minutes}
                    </span>
                    <span
                      className={`text-xs ${
                        isTimeWarning ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {seconds}
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};