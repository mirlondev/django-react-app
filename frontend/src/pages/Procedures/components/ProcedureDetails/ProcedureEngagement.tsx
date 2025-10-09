import React from "react";
import {
  Heart,
  Bookmark,
  Share2,
  Printer
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import { Procedure } from "../../../../types";

interface ProcedureEngagementProps {
  procedure: Procedure;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onPrint: () => void;
}

const ProcedureEngagement = ({
  procedure,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onShare,
  onPrint
}:ProcedureEngagementProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Engagement Footer */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Did you find this helpful?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your feedback helps us create better content for everyone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onLike}
                className={`bg-white dark:bg-gray-800 border-2 transition-all duration-200 ${
                  isLiked 
                    ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20" 
                    : "border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart className="h-4 w-4 mr-2" fill={isLiked ? "currentColor" : "none"} />
                {isLiked ? "Loved it!" : "Love it"}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 px-2 rounded-full text-xs">
                  {procedure.likes || 0}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={onBookmark}
                className={`bg-white dark:bg-gray-800 border-2 transition-all duration-200 ${
                  isBookmarked 
                    ? "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                <Bookmark className="h-4 w-4 mr-2" fill={isBookmarked ? "currentColor" : "none"} />
                {isBookmarked ? "Saved" : "Save"}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                  {procedure.bookmarks || 0}
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onShare}
                className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 hover:text-green-500 transition-all duration-200"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={onPrint}
                className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 hover:text-purple-500 transition-all duration-200"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedureEngagement;