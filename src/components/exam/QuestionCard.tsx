import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import type { ExamQuestion, QuestionOption } from "../../types";

interface QuestionCardProps {
  question: ExamQuestion;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer?: string | number;
  onAnswerChange: (answer: string | number) => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
  isAlreadyAnswered?: boolean;
  onPrevious?: () => void;
  isFirstQuestion?: boolean;
}

export const QuestionCard = ({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
  onSubmit,
  isLastQuestion,
  isAlreadyAnswered = false,
  onPrevious,
  isFirstQuestion = false,
}: QuestionCardProps) => {
  const [essayAnswer, setEssayAnswer] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);

  useEffect(() => {
    if (question.type === "essay") {
      const answerValue = typeof selectedAnswer === "string" ? selectedAnswer : "";
      setEssayAnswer(answerValue);
      setCharCount(answerValue.length);
    }
  }, [selectedAnswer, question.type, question.id]);

  const handleEssayChange = (value: string) => {
    setEssayAnswer(value);
    setCharCount(value.length);
    onAnswerChange(value);
  };

  const handleOptionSelect = (option: QuestionOption) => {
    // Send the option text to match backend expectations
    onAnswerChange(option.name);
  };

  const renderMultipleChoice = () => {
    if (!question.question_options || question.question_options.length === 0) {
      return <div className="text-gray-500">No options available</div>;
    }

    return (
      <div className="space-y-3">
        {question.question_options.map((option: QuestionOption, index: number) => {
          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
          // Compare with option name since we now store option text
          const isSelected = selectedAnswer === option.name;

          return (
            <label key={option.id} className={`group block ${isAlreadyAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => !isAlreadyAnswered && handleOptionSelect(option)}
                disabled={isAlreadyAnswered}
                className="hidden"
              />
              <div
                className={`flex items-center p-5 border rounded-[16px] cursor-pointer transition-all duration-300 ${
                  isAlreadyAnswered && isSelected ? 'bg-[#276874] border-[#276874] border-2 text-white' :
                  isAlreadyAnswered
                      ? "border-gray-200 bg-gray-50 opacity-75"
                    : isSelected
                      ? "border-[#EF3F09] bg-red-50"
                      : "border-[#DCDEDD] hover:border-[#EF3F09] hover:bg-red-50"
                }`}
              >
                <div
                  className={`flex size-[20px] rounded-full shadow-sm border-2 transition-all duration-300 mr-4 ${
                    isAlreadyAnswered && isSelected ? 'bg-white border-[#276874] border-[5px]' :
                    isAlreadyAnswered
                      ? isSelected
                        ? "border-[5px]"
                        : "border-gray-300"
                      : isSelected
                        ? "border-[5px] border-[#EF3F09]"
                        : "border-[#DCDEDD]"
                  }`}
                ></div>
                <span className={`font-semibold text-lg mr-4 ${isAlreadyAnswered && isSelected ? 'text-white' : isAlreadyAnswered ? 'text-gray-500' : 'text-brand-dark'}`}>
                  {optionLabel}.
                </span>
                <span className={`text-base ${isAlreadyAnswered && isSelected ? 'text-white' : isAlreadyAnswered ? 'text-gray-500' : 'text-brand-dark'}`}>{option.name}</span>
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  const renderEssayQuestion = () => {
    if (isAlreadyAnswered) {
      // Show read-only view for answered questions
      return (
        <div className="space-y-4">
          <div className="w-full p-4 border-2 border-gray-300 bg-gray-50 rounded-[12px] min-h-[240px]">
            <div className="text-gray-600">
              {essayAnswer ? (
                <div className="whitespace-pre-wrap">{essayAnswer}</div>
              ) : (
                <div className="italic text-gray-400">Question was skipped - no answer provided</div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            ✓ Answer submitted
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <textarea
          value={essayAnswer}
          onChange={(e) => handleEssayChange(e.target.value)}
          rows={10}
          className={`w-full p-4 border rounded-[12px] transition-all duration-300 resize-none ${
            charCount > 2000 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100 focus:ring-2' 
              : charCount < 10 
                ? 'border-yellow-400 focus:border-[#EF3F09] focus:ring-red-100 focus:ring-2'
                : 'border-gray-200 focus:border-[#EF3F09] focus:ring-red-100 focus:ring-2'
          }`}
          placeholder="Type your answer here..."
        />
        <div className="flex items-center justify-between text-sm">
          <span className={
            charCount < 10 
              ? "text-red-500" 
              : charCount < 50 
                ? "text-yellow-600" 
                : "text-gray-600"
          }>
            {charCount < 10 
              ? "Minimum required: 10 characters" 
              : charCount < 50 
                ? "Recommended: at least 50 characters" 
                : "✓ Good length"
            }
          </span>
          <span className={charCount > 2000 ? "text-red-500" : "text-gray-500"}>
            Character count: {charCount}/2000
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[20px]">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            Question {currentQuestion} of {totalQuestions}
          </span>
          {isAlreadyAnswered && (
            <span className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-[#276874]">
              ✓ Question Answered
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Award className="w-4 h-4 text-orange-500" />
          <span className="text-orange-600 font-medium">
            {question.points} Points
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-brand-dark text-xl font-semibold mb-4">
          {question.name}
        </h2> 
      </div>

      {/* Answer Area */}
      <div className="mb-8">
        {question.type === "multiple_choice"
          ? renderMultipleChoice()
          : renderEssayQuestion()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`px-6 py-3 rounded-[12px] font-medium transition-all duration-300 ${
            isFirstQuestion
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={onSubmit}
          className={`px-8 py-3 rounded-[12px] font-medium transition-all duration-300 ${
            isAlreadyAnswered
              ? "bg-[#EF3F09] text-white hover:bg-[#d63507]"
              : isLastQuestion
                ? "bg-[#EF3F09] text-white hover:bg-[#d63507]"
                : "bg-[#EF3F09] text-white hover:bg-[#d63507]"
          }`}
        >
          {isAlreadyAnswered 
            ? "Continue to Next Question" 
            : isLastQuestion 
              ? "Submit & Finish" 
              : "Submit & Next"
          }
        </button>
      </div>
    </div>
  );
};