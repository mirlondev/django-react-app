import React, { useState, useEffect } from "react";
import {

  ChevronRight,
  Eye,
  Star,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ClientLayout from "../Layout/ClientLayout";
import { ratingsAPI, ticketsAPI } from "../../services/api";
import { Ticket as TicketType } from "../../types";
import { Link } from "react-router-dom";
import LoadingSpinner from "../Layout/LoadingSpinner";
import toast from "react-hot-toast";
import RatingCard from "../Rating/RatingCard";
import RatingForm from "../Rating/RatingForm";

const ClientDashboard = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // gestion des notes
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [userRatings, setUserRatings] = useState([]);
  const [canRateTechnicians, setCanRateTechnicians] = useState({});

  useEffect(() => {
    fetchTickets();
    fetchUserRatings();
  }, []);

  const fetchUserRatings = async () => {
    try {
      const response = await ratingsAPI.getUserRatings();
      setUserRatings(response.data.client_ratings || []);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getAll();
      const clientTickets = response.data.filter(
        (ticket: TicketType) => ticket.client.user.id === user?.id
      );
      setTickets(clientTickets);
      checkRateEligibility(clientTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const checkRateEligibility = async (tickets) => {
    const eligibility = {};
    for (const ticket of tickets) {
      if (ticket.technician && ticket.status === "closed") {
        try {
          const response = await ratingsAPI.canRateTechnician(
            ticket.technician.id
          );
          eligibility[ticket.technician.id] = response.data.can_rate;
        } catch {
          eligibility[ticket.technician.id] = false;
        }
      }
    }
    setCanRateTechnicians(eligibility);
  };

  const handleRateTechnician = (technician) => {
    setSelectedTechnician(technician);
    setShowRatingForm(true);
  };

  const submitTechnicianRating = async (ratingData) => {
    try {
      await ratingsAPI.rateTechnician(selectedTechnician.id, ratingData);
      setShowRatingForm(false);
      setSelectedTechnician(null);

      setCanRateTechnicians((prev) => ({
        ...prev,
        [selectedTechnician.id]: false,
      }));

      toast.success("Rating submitted successfully");
      fetchUserRatings();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  const canRateTechnician = (ticket) => {
    return (
      ticket.status === "closed" &&
      ticket.technician &&
      canRateTechnicians[ticket.technician.id] !== false
    );
  };

  const getRatingButton = (ticket) => {
    if (canRateTechnician(ticket)) {
      return (
        <button
          onClick={() => handleRateTechnician(ticket.technician)}
          className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center"
        >
          <Star className="w-4 h-4 mr-1" />
          Rate Technician
        </button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <ClientLayout>
        <LoadingSpinner />
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 md:p-6">
        {/* Tickets List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Tickets
            </h2>
            <Link
              to="/tickets"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No tickets found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        #{ticket.id} {ticket.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                        {ticket.description}
                      </p>
                      {getRatingButton(ticket)}
                    </div>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-4 flex items-center"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ratings section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Ratings
            </h2>
          </div>
          <div className="p-6">
            {userRatings.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                You haven’t rated any technicians yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRatings.slice(0, 4).map((rating) => (
                  <RatingCard
                    key={rating.id}
                    rating={rating}
                    showTechnician={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating Form Modal */}
        {showRatingForm  && (
          <RatingForm
            title="Rate your technician"
            submitText="Submit Rating"
            onSubmit={submitTechnicianRating}
            onCancel={() => setShowRatingForm(false)} technicianId={ticket.technician.id}          />
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
