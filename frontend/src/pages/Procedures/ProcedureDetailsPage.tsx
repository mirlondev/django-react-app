import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import toast from "react-hot-toast";
import { proceduresAPI } from "../../services/api";
import { Procedure, ProcedureImage } from "../../types";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import ProcedureHero from "./components/ProcedureDetails/ProcedureHero";
import ProcedureContent from "./components/ProcedureDetails/ProcedureContent";
import ProcedureEngagement from "./components/ProcedureDetails/ProcedureEngagement";

const ProcedureDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProcedureImage | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProcedure();
    }

    // Track reading progress
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  const fetchProcedure = async () => {
    try {
      setLoading(true);
      const response = await proceduresAPI.getById(id);
      const procedureData = response.data;
      
      // Calculate reading time based on content length
      const wordCount = procedureData.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.round(wordCount / 200)); // 200 words per minute
      
      setProcedure({
        ...procedureData,
        reading_time: readingTime
      });

      // Check if user has liked or bookmarked this procedure
      setIsLiked(procedureData.user_has_liked || false);
      setIsBookmarked(procedureData.user_has_bookmarked || false);
    } catch (err) {
      setError("Failed to load procedure");
      console.error("Error fetching procedure:", err);
      toast.error("Failed to load procedure");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await proceduresAPI.delete(id);
      toast.success("Procedure deleted successfully");
      navigate("/procedures");
    } catch (error) {
      toast.error("Failed to delete procedure");
    }
  };

  const handleLike = async () => {
    try {
      const response = await proceduresAPI.interaction(id, { type: "like" });
      setIsLiked(response.data.user_has_liked);
      setProcedure((prev) => ({
        ...prev,
        likes: response.data.likes,
      }));
      toast.success(isLiked ? "Removed like" : "Liked procedure");
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await proceduresAPI.interaction(id, {
        type: "bookmark",
      });
      setIsBookmarked(response.data.user_has_bookmarked);
      setProcedure((prev) => ({
        ...prev,
        bookmarks: response.data.bookmarks,
      }));
      toast.success(isBookmarked ? "Removed bookmark" : "Bookmarked procedure");
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: procedure.title,
          text: procedure.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !procedure) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <div className="relative">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Article Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            The article you're looking for doesn't exist or has been moved to a different location.
          </p>
          <Link to="/procedures">
            <Button variant="primary" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-full">
              ← Back to Articles
            </Button>
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const canEdit = user?.id === procedure.author.id || user?.userType === 'admin';

  return (
    <AuthenticatedLayout>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <ProcedureHero 
        procedure={procedure}
        canEdit={canEdit}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onDeleteClick={() => setShowDeleteModal(true)}
      />

      <ProcedureContent 
        procedure={procedure}
        selectedImage={selectedImage}
        onImageSelect={setSelectedImage}
      />

      <ProcedureEngagement 
        procedure={procedure}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onPrint={handlePrint}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        dataName={`article "${procedure.title}"`}
      />

      {/* Print Styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            
            body {
              color: #000;
              background: #fff;
            }
            
            .prose img {
              max-width: 100% !important;
              height: auto !important;
              break-inside: avoid;
            }
            
            .prose h1, .prose h2, .prose h3 {
              break-after: avoid;
            }
            
            .prose p {
              orphans: 3;
              widows: 3;
            }
            
            article {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
    </AuthenticatedLayout>
  );
};

export default ProcedureDetailsPage;