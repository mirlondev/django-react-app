import { BarChart3 } from "lucide-react";
import React from "react";

interface systemMetricsProps {
  resolutionRate:number;
  averageRating:string;

}
const SystemMetrics = ({resolutionRate,averageRating}:systemMetricsProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        System Performance
      </h2>
      <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
    </div>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Average Response Time
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            2.4 hours
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: "78%" }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Resolution Rate
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {resolutionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${resolutionRate}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Customer Satisfaction
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {averageRating}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-purple-500 h-2 rounded-full"
            style={{ width: `${(parseFloat(averageRating) / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SystemMetrics;