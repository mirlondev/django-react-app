import React from "react";
import {
  Tag,
  Download,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Clock,
  Eye,
  BookOpen,
  Calendar,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { formatDate } from "../../../../utils/utils";
import {
  Procedure,
  ProcedureImage,
  ProcedureAttachment,
} from "../../../../types";
import toast from "react-hot-toast";

interface ProcedureContentProps {
  procedure: Procedure;
  selectedImage: ProcedureImage | null;
  onImageSelect: (image: ProcedureImage | null) => void;
}

const ProcedureContent: React.FC<ProcedureContentProps> = ({
  procedure,
  selectedImage,
  onImageSelect,
}) => {
  const downloadAttachment = async (attachment: ProcedureAttachment) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = attachment.file_url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${attachment.name}`);
    } catch (error) {
      toast.error("Failed to download attachment");
    }
  };

  return (
    <>
      {/* Main Content */}
      <article className="max-w-4xl mx-auto p-6 md:p-8 mt-2 relative z-10">
        {/* Tags */}
        {procedure.tags && procedure.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {procedure.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/procedures?tag=${tag.slug || tag.name}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Tag className="h-3 w-3" />#{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Main Content */}
        {procedure.content && (
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-8 md:p-12">
                <div
                  className="prose prose-lg prose-gray dark:prose-invert max-w-none
                    prose-img:rounded-xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-8
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
                    prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-h1:mb-6 prose-h2:mb-5 prose-h3:mb-4 prose-h1:mt-8 prose-h2:mt-8 prose-h3:mt-6
                    prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ul:text-lg
                    prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-ol:text-lg
                    prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-2
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_img]:mx-auto
                    [&_img]:rounded-xl [&_img]:shadow-xl [&_img]:border
                    [&_img]:border-gray-200 dark:[&_img]:border-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: procedure.content,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {procedure.images && procedure.images.length > 1 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Visual Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {procedure.images.slice(1).map((image, index) => (
                <div
                  key={image.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => onImageSelect(image)}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 aspect-video">
                    <img
                      src={image.image_url}
                      alt={
                        image.alt_text ||
                        `${procedure.title} - Image ${index + 2}`
                      }
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        {image.caption && (
                          <p className="text-white font-medium text-sm">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources & Downloads */}
        {procedure.attachments && procedure.attachments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Resources & Downloads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {procedure.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {attachment.name}
                        </h3>
                        {attachment.file_size && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {attachment.file_size}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAttachment(attachment)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {procedure.related_procedures &&
          procedure.related_procedures.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {procedure.related_procedures.map((related) => (
                  <Link
                    key={related.id}
                    to={`/procedures/${related.id}`}
                    className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                      {related.images ? (
                         <img
                         src={related.images[0].image_url}
                         alt={related.images[0].alt_text || related.title}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       />
                     ) : (
                       <img
                         src="https://images.unsplash.com/photo-1581092334475-1d4b8a1a0f6c"
                         alt="default-image"
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       />
                         
                         
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ChevronRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {related.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-xs font-medium text-blue-800 dark:text-blue-200">
                            {related.category}
                          </span>
                        )}
                        {related.reading_time && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                            <Clock className="h-3 w-3 mr-1" />
                            {related.reading_time} min
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                        {related.title}
                      </h3>
                      {related.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {related.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          {related.views !== undefined && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{related.views.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          Read More →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        {/* Author Bio Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {procedure.author.avatar_url ? (
                <img
                  src={procedure.author.avatar_url}
                  alt={procedure.author.first_name}
                  className="w-24 h-24 rounded-full border-4 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                About {procedure.author.first_name}
              </h3>
              {procedure.author_title && (
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {procedure.author_title}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {procedure.author.bio ||
                  `${procedure.author.username} is a dedicated professional sharing knowledge and expertise through detailed guides and procedures.`}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since{" "}
                    {formatDate(
                      procedure.author_joined_date || procedure.created_at
                    )}
                  </span>
                </div>
                {procedure.author.procedures && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {procedure.author.procedures.length} articles published
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => onImageSelect(null)}
        >
          <div className="max-w-6xl max-h-full relative">
            <button
              className="absolute -top-12 right-0 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                onImageSelect(null);
              }}
            >
              <ExternalLink className="h-6 w-6" />
            </button>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt_text || procedure.title}
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <div className="hidden bg-gray-100 dark:bg-gray-800 w-full h-64 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <span className="text-gray-500">Image not available</span>
                </div>
              </div>
              {selectedImage.caption && (
                <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                    {selectedImage.caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcedureContent;and 


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
};import React from "react";
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

export default ProcedureEngagement;






