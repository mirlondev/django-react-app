import React, { useState, useEffect, useRef, JSX } from "react";
import {
  MessageSquare,
  User,
  Clock,
  Tag,
  ArrowLeft,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  MessageCircle,
  Settings,
  Phone,
  Mail,
  Building,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  Ticket
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { useAuth } from "../../context/AuthContext";
import { ticketsAPI, ratingsAPI } from "../../services/api";
import toast from "react-hot-toast";
import { RatingStats, ChatRequest, Ticket } from "../../types";


const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<Ticket >(null);
  const [loading, setLoading] = useState(true);
  const [chatRequested, setChatRequested] = useState(false);
  const [chatRequestStatus, setChatRequestStatus] = useState<"pending" | "accepted" | "rejected" | "">("");
  const [showVoteSection, setShowVoteSection] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [canRate, setCanRate] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch ticket data
  const fetchTicketData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await ticketsAPI.getById(id);
      const ticketData = response.data;
      
      setTicket(ticketData);
      
      // Check if user can rate and fetch rating stats for closed tickets
      if (ticketData.status === 'closed') {
        checkIfCanRate();
        fetchRatingStats();
      }
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      toast.error("Failed to load ticket details");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  // Check if user can rate the other party
  const checkIfCanRate = async () => {
    if (!ticket || !user) return;
    
    try {
      let response;
      if (user.userType === 'client' && ticket.technician) {
        response = await ratingAPI.canRateTechnician(ticket.technician.id);
        setCanRate(response.data.can_rate);
        setRatingError(response.data.reason || null);
      } else if (user.userType === 'technician' && ticket.client) {
        response = await ratingAPI.canRateClient(ticket.client.id);
        setCanRate(response.data.can_rate);
        setRatingError(response.data.reason || null);
      }
    } catch (error) {
      console.error("Error checking rating eligibility:", error);
      setRatingError("Unable to check rating eligibility");
    }
  };

  // Fetch rating statistics
  const fetchRatingStats = async () => {
    if (!ticket) return;
    
    try {
      let response;
      if (user?.userType === 'client' && ticket.technician) {
        response = await ratingAPI.getTechnicianRatings(ticket.technician.id);
      } else if (user?.userType === 'technician' && ticket.client) {
        response = await ratingAPI.getClientRatings(ticket.client.id);
      }
      
      if (response) {
        setRatingStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error);
    }
  };

  // Submit a rating
  const submitRating = async () => {
    if (!ticket || rating === 0) return;
    
    setSubmittingRating(true);
    try {
      const ratingData = {
        rating: rating,
        comment: ratingComment
      };
      
      let response;
      if (user?.userType === 'client' && ticket.technician) {
        response = await ratingAPI.rateTechnician(ticket.technician.id, ratingData);
      } else if (user?.userType === 'technician' && ticket.client) {
        response = await ratingAPI.rateClient(ticket.client.id, ratingData);
      }
      
      if (response) {
        toast.success("Rating submitted successfully!");
        setCanRate(false);
        setShowRatingForm(false);
        fetchRatingStats();
        setRatingError(null);
      }
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      const errorMessage = error.response?.data?.error || "Failed to submit rating";
      toast.error(errorMessage);
      setRatingError(errorMessage);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle voting (like/dislike system for ticket resolution)
  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!ticket || userVote === voteType) return;
    
    try {
      // In a real app, this would be an API call to your backend
      const newVoteValue = voteType;
      const previousVote = userVote;
      
      setUserVote(newVoteValue);
      
      // Update local ticket data (simulating API response)
      setTicket(prev => {
        if (!prev) return prev;
        
        const newLikes = prev.votes?.like || 0;
        const newDislikes = prev.votes?.dislike || 0;
        
        let updatedLikes = newLikes;
        let updatedDislikes = newDislikes;
        
        // If user had previously voted, remove that vote first
        if (previousVote === 'like') {
          updatedLikes = Math.max(0, newLikes - 1);
        } else if (previousVote === 'dislike') {
          updatedDislikes = Math.max(0, newDislikes - 1);
        }
        
        // Add the new vote
        if (voteType === 'like') {
          updatedLikes += 1;
        } else {
          updatedDislikes += 1;
        }
        
        return {
          ...prev,
          votes: {
            like: updatedLikes,
            dislike: updatedDislikes,
            user_vote: newVoteValue
          }
        };
      });
      
      toast.success(`Your ${voteType === 'like' ? 'positive' : 'negative'} vote has been recorded`);
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote");
    }
  };

  // Handle chat request
  const handleChatRequest = async () => {
    if (!ticket) return;
    
    try {
      setChatRequested(true);
      setChatRequestStatus("pending");
      
      // In a real app, this would be an API call to create a chat request
      const newChatRequest: ChatRequest = {
        id: `cr_${Date.now()}`,
        status: "pending",
        created_at: new Date().toISOString(),
        technician_id: ticket.technician?.id || ""
      };
      
      // Store in localStorage for demo purposes
      localStorage.setItem(`chatRequest_${ticket.id}`, JSON.stringify(newChatRequest));
      
      toast.success("Chat request sent to technician");
      
      // Simulate technician response after 5 seconds (for demo)
      setTimeout(() => {
        // 80% chance of acceptance for demo
        const simulatedStatus = Math.random() > 0.2 ? "accepted" : "rejected";
        setChatRequestStatus(simulatedStatus);
        
        const updatedRequest = {...newChatRequest, status: simulatedStatus};
        localStorage.setItem(`chatRequest_${ticket.id}`, JSON.stringify(updatedRequest));
        
        if (simulatedStatus === "accepted") {
          toast.success("The technician has accepted your chat request!");
        } else {
          toast.error("The technician is not available at the moment");
        }
      }, 5000);
    } catch (error) {
      console.error("Error requesting chat:", error);
      toast.error("Failed to request chat");
    }
  };

  // Navigate to chat page
  const navigateToChat = () => {
    if (ticket) {
      navigate(`/tickets/${ticket.id}/chat`);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    const icons: Record<string, { icon: JSX.Element; color: string }> = {
      open: { icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-500" },
      in_progress: { icon: <Clock className="w-4 h-4" />, color: "text-blue-500" },
      closed: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500" },
    };
    const statusInfo = icons[status] || icons.open;
    return <span className={statusInfo.color}>{statusInfo.icon}</span>;
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const classes: Record<string, string> = {
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Unknown"}
      </span>
    );
  };

  // Render star rating input
  const renderStarRating = () => {
    return (
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="text-2xl focus:outline-none"
          >
            {star <= rating ? (
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
            ) : (
              <Star className="w-8 h-8 text-gray-300" />
            )}
          </button>
        ))}
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          {rating}/5
        </span>
      </div>
    );
  };

  // Render rating statistics
  const renderRatingStats = () => {
    if (!ratingStats) return null;
    
    return (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Rating Summary</h4>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(ratingStats.average_rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {ratingStats.average_rating.toFixed(1)} out of 5
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on {ratingStats.total_ratings} ratings
        </p>
        
        {ratingStats.ratings && ratingStats.ratings.length > 0 && (
          <div className="mt-4 space-y-3">
            <h5 className="font-medium">Recent Reviews</h5>
            {ratingStats.ratings.slice(0, 3).map((review) => (
              <div key={review.id} className="border rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    by {review.rater.user.first_name} {review.rater.user.last_name}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  // Blinking effect for chat button
  useEffect(() => {
    if (chatRequested && chatRequestStatus === "pending" && chatButtonRef.current) {
      const interval = setInterval(() => {
        if (chatButtonRef.current) {
          chatButtonRef.current.classList.toggle("opacity-100");
          chatButtonRef.current.classList.toggle("opacity-70");
        }
      }, 700);
      
      return () => clearInterval(interval);
    }
  }, [chatRequested, chatRequestStatus]);

  // Render loading state
  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Loading Ticket</h2>
            <p className="text-gray-500 dark:text-gray-400">Please wait...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Render ticket not found
  if (!ticket) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The ticket you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button 
              onClick={() => navigate("/tickets")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const isClient = user?.userType === 'client';
  const isClosed = ticket.status === 'closed';
  const canVote = isClient && isClosed && !userVote;
  const hasVoted = isClient && isClosed && userVote;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate("/tickets")}
                className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Back to tickets"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Ticket #{ticket.id.substring(0, 8)}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Customer ticket details
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Sidebar - Ticket Information */}
            <div className="xl:col-span-1 space-y-6">
              {/* Ticket Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <Tag className="w-5 h-5 mr-2" /> Status
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-medium capitalize text-gray-900 dark:text-white">
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created: {formatDate(ticket.created_at)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated: {formatDate(ticket.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <User className="w-5 h-5 mr-2" /> Client
                </h2>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {ticket.client.user.first_name.charAt(0)}{ticket.client.user.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {ticket.client.user.first_name} {ticket.client.user.last_name}
                    </h3>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3 mr-2" />
                        <span className="truncate">{ticket.client.user.email}</span>
                      </div>
                      {ticket.client.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3 mr-2" />
                          <span>{ticket.client.phone}</span>
                        </div>
                      )}
                      {ticket.client.company && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Building className="w-3 h-3 mr-2" />
                          <span>{ticket.client.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technician Information */}
              {ticket.technician && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <Settings className="w-5 h-5 mr-2" /> Assigned Technician
                  </h2>
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {ticket.technician.user.first_name.charAt(0)}{ticket.technician.user.last_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {ticket.technician.user.first_name} {ticket.technician.user.last_name}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3 mr-2" />
                          <span className="truncate">{ticket.technician.user.email}</span>
                        </div>
                        {ticket.technician.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3 mr-2" />
                            <span>{ticket.technician.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Tag className="w-3 h-3 mr-2" />
                          <span className="capitalize">{ticket.technician.specialty}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Ticket Details and Chat Request */}
            <div className="xl:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Ticket Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
                      {ticket.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Last updated: {formatDate(ticket.updated_at)}</span>
                    </div>
                  </div>

                  {/* Ticket Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Description</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {ticket.images && ticket.images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attachments ({ticket.images.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ticket.images.map((image) => (
                          <div key={image.id} className="group relative">
                            <div 
                              className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => window.open(image.image, '_blank')}
                            >
                              <img 
                                src={image.image} 
                                alt={`Attachment ${image.id}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Voting Section - Only for clients on closed tickets */}
                {isClient && isClosed && (
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setShowVoteSection(!showVoteSection)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Resolution Evaluation
                      </h3>
                      {showVoteSection ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    {showVoteSection && (
                      <div className="mt-4">
                        {canVote && (
                          <>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Was this resolution helpful? Give us your feedback.
                            </p>
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleVote('like')}
                                className="flex items-center justify-center px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                              >
                                <ThumbsUp className="w-5 h-5 mr-2" />
                                Helpful
                              </button>
                              <button
                                onClick={() => handleVote('dislike')}
                                className="flex items-center justify-center px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                              >
                                <ThumbsDown className="w-5 h-5 mr-2" />
                                Not Helpful
                              </button>
                            </div>
                          </>
                        )}

                        {hasVoted && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                              <p className="text-blue-700 dark:text-blue-300">
                                Thank you for your feedback! You voted "{userVote === 'like' ? 'Helpful' : 'Not Helpful'}"
                              </p>
                            </div>
                            
                            {ticket.votes && (
                              <div className="mt-3 flex space-x-6 text-sm">
                                <div className="flex items-center">
                                  <ThumbsUp className="w-4 h-4 text-green-500 mr-1" />
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {ticket.votes.like} helpful vote(s)
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <ThumbsDown className="w-4 h-4 text-red-500 mr-1" />
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {ticket.votes.dislike} not helpful vote(s)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat Request Section - Only for clients on closed tickets */}
                {isClient && isClosed && (
                  <div className="p-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg text-center">
                      <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Need additional help?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        If you need more assistance with this ticket, you can request to chat with our technician.
                      </p>

                      {!chatRequested ? (
                        <button
                          ref={chatButtonRef}
                          onClick={handleChatRequest}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center mx-auto animate-pulse"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Request Chat with Technician
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {chatRequestStatus === "pending" && (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                              <span className="text-blue-600 dark:text-blue-400">
                                Waiting for technician response...
                              </span>
                            </div>
                          )}

                          {chatRequestStatus === "accepted" && (
                            <div>
                              <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span>The technician has accepted your chat request!</span>
                              </div>
                              <button
                                onClick={navigateToChat}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center mx-auto"
                              >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Start Discussion
                              </button>
                            </div>
                          )}

                          {chatRequestStatus === "rejected" && (
                            <div className="text-center">
                              <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                                <XCircle className="w-5 h-5 mr-2" />
                                <span>The technician is not available at the moment.</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Please try again later or create a new ticket.
                              </p>
                              <button
                                onClick={() => setChatRequested(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Section - Only for closed tickets */}
              {isClosed && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    {user?.userType === 'client' ? 'Rate the Technician' : 'Rate the Client'}
                  </h3>
                  
                  {ratingError && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
                      {ratingError}
                    </div>
                  )}
                  
                  {canRate ? (
                    <div>
                      {!showRatingForm ? (
                        <button
                          onClick={() => setShowRatingForm(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Your Rating
                        </button>
                      ) : (
                        <div>
                          {renderStarRating()}
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                              Comment (optional)
                            </label>
                            <textarea
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              rows={3}
                              placeholder="Share your experience..."
                            />
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={submitRating}
                              disabled={submittingRating || rating === 0}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {submittingRating ? 'Submitting...' : 'Submit Rating'}
                            </button>
                            <button
                              onClick={() => setShowRatingForm(false)}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.userType === 'client' 
                        ? 'You have already rated this technician or cannot rate at this time.'
                        : 'You have already rated this client or cannot rate at this time.'}
                    </p>
                  )}
                  
                  {renderRatingStats()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketDetail;