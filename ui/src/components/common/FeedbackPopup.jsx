import React, { useState } from "react";

const FeedbackModal = ({ isOpen = false, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const clearState = () => {
    setFeedback("");
    setRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => {
            clearState();
            onClose?.();
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 
                   dark:text-gray-500 dark:hover:text-gray-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-center dark:text-white pr-8">
            Help us improve with some quick feedback before your free PDF
            download
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center space-x-4">
            {[1, 2, 3].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${
                    rating >= star
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            ))}
          </div>

          {/* Feedback Input */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What would you like to see changed? (Optional)"
            className="w-full h-24 px-3 py-2 text-base bg-white dark:bg-gray-700 
                     border border-gray-300 dark:border-gray-600 
                     rounded-lg resize-none focus:ring-2 
                     focus:ring-blue-500 dark:focus:ring-blue-400 
                     focus:border-transparent dark:text-white"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700">
          <button
            onClick={() => {
              if (rating > 0) {
                onSubmit?.({ rating, feedback });
              }
              onClose?.()
              clearState()
            }}
            disabled={rating === 0}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     text-white font-medium rounded-lg 
                     transition-colors duration-200"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
