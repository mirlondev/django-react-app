import React from "react";
import {
  ArrowLeft,
  Eye,
  Clock,
  User,
  Calendar,
  Edit,
  Trash2,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
  Star,
  ThumbsUp,
  BookOpen,
  Image as ImageIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { formatDate } from "../../../../utils/utils";
import { Procedure } from "../../../../types";

interface ProcedureHeroProps {
  procedure: Procedure;
  canEdit: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onDeleteClick: () => void;
}

const ProcedureHero: React.FC<ProcedureHeroProps> = ({
  procedure,
  canEdit,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onShare,
  onDeleteClick
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "intermediate":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "advanced":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "intermediate":
        return <Star className="h-4 w-4 mr-1" />;
      case "advanced":
        return <ThumbsUp className="h-4 w-4 mr-1" />;
      default:
        return <BookOpen className="h-4 w-4 mr-1" />;
    }
  };

  const heroImage = procedure.images && procedure.images.length > 0 ? procedure.images[0] : null;

  return (
    <>
      {/* Hero Section */}
      <div className="relative">
        {heroImage ? (
          <div className="relative h-[60vh] min-h-96 overflow-hidden">
            <img
              src={heroImage.image_url}
              alt={heroImage.alt_text || procedure.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-24 w-24 text-white opacity-50" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                  to="/procedures"
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors mb-6 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Articles
                </Link>

                {/* Tags and Difficulty */}
                <div className="flex flex-wrap items-center gap-3 mb-4 ">
                  {procedure.category && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                      {procedure.category}
                    </span>
                  )}
                  {procedure.difficulty && (
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${getDifficultyColor(
                        procedure.difficulty
                      )}`}
                    >
                      {getDifficultyIcon(procedure.difficulty)}
                      {procedure.difficulty}
                    </span>
                  )}
                  {procedure.reading_time && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                      <Clock className="h-4 w-4 mr-2" />
                      {procedure.reading_time} min read
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {procedure.title}
                </h1>

                {/* Description */}
                {procedure.description && (
                  <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed max-w-3xl">
                    {procedure.description}
                  </p>
                )}

                {/* Author & Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  <div className="flex items-center gap-3">
                    {procedure.author_avatar ? (
                      <img
                        src={procedure.author.profile_image}
                        alt={procedure.username}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{procedure.author.username}</div>
                      {procedure.author.bio&& (
                        <div className="text-sm text-white/70">{procedure.author.bio}</div>
                      )}
                    </div>
                  </div>
                  {procedure.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(procedure.created_at)}</span>
                    </div>
                  )}
                  {procedure.views !== undefined && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{procedure.views.toLocaleString()} views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No Hero Image - Gradient Background
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-16 md:py-24">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-4xl mx-auto p-6 md:p-8">
              {/* Back Button */}
              <Link
                to="/procedures"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors mb-6 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </Link>

              {/* Tags and Difficulty */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
       
                {procedure.category && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                    {procedure.category}
                  </span>
                )}
                {procedure.difficulty && (
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${getDifficultyColor(
                      procedure.difficulty
                    )}`}
                  >
                    {getDifficultyIcon(procedure.difficulty)}
                    {procedure.difficulty}
                  </span>
                )}
                {procedure.reading_time && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                    <Clock className="h-4 w-4 mr-2" />
                    {procedure.reading_time} min read
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {procedure.title}
              </h1>

              {/* Description */}
              {procedure.description && (
                <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl">
                  {procedure.description}
                </p>
              )}

              {/* Author & Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <div className="flex items-center gap-3">
                  {procedure.author_avatar ? (
                    <img
                      src={procedure.author_avatar}
                      alt={procedure.author_name}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">{procedure.author_name}</div>
                    {procedure.author_title && (
                      <div className="text-sm text-white/70">{procedure.author_title}</div>
                    )}
                  </div>
                </div>
                {procedure.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(procedure.created_at)}</span>
                  </div>
                )}
                {procedure.views !== undefined && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{procedure.views.toLocaleString()} views</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky top-4 z-40 mx-auto max-w-4xl p-4">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`rounded-full transition-all duration-200 ${
                isLiked 
                  ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={isLiked ? "currentColor" : "none"}
              />
              <span className="ml-1">{procedure.likes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmark}
              className={`rounded-full transition-all duration-200 ${
                isBookmarked 
                  ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isBookmarked ? "currentColor" : "none"}
              />
              <span className="ml-1">{procedure.bookmarks || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1">
              <Link to={`/procedures/${procedure.id}/edit`}>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteClick}
                className="rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProcedureHero;