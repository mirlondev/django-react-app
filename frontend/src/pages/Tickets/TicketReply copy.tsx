import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  User,
  Clock,
  Tag,
  ArrowLeft,
  Paperclip,
  Send,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  Download,
  Eye,
  Trash2,
  Edit3,
  Users,
  Wifi,
  WifiOff,
  Loader2,
  Image as ImageIcon,
  File,
  X,
  MessageCircle,
  Settings,
  Phone,
  Mail,
  Building,
  Calendar,
  Priority,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { useAuth } from "../../context/AuthContext";
import { interventionsAPI, ticketsAPI } from "../../services/api";
import toast from "react-hot-toast";

// Enhanced TypeScript interfaces
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    phone: string;
    company: string;
  };
  technician: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    specialty: string;
    phone: string;
  } | null;
  images: Array<{
    id: string;
    image: string;
    name?: string;
    size?: number;
  }>;
}

interface Intervention {
  id: string;
  report: string;
  created_at: string;
  updated_at?: string;
  technician?: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  attachments?: Array<{
    id: string;
    file: string;
    name: string;
    size: number;
  }>;
}

interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  user_type: "client" | "technician" | "admin";
  timestamp: string;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: number;
}

interface OnlineUser {
  user_id: string;
  user_name: string;
  user_type: string;
  last_seen: string;
}

const TicketReply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Core state
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // WebSocket state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Enhanced chat features
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [messageFilter, setMessageFilter] = useState<"all" | "interventions" | "chat">("all");
  
  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto",
      block: "nearest" 
    });
  }, []);

 // Add these constants at the top of your component
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

// Update your setupWebSocket function with better error handling
const setupWebSocket = useCallback(() => {
  if (!id || !user) return;

  // Clear any existing timeout
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
  }

  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (!token) {
    console.error("⚠️ No JWT token found for WebSocket connection");
    toast.error("Authentication token missing. Please login again.");
    return;
  }

  // Check if WebSocket is already connected
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("WebSocket already connected");
    return;
  }

  setConnectionStatus("connecting");
  
  try {
    const websocket = new WebSocket(
      `ws://localhost:9000/ws/ticket/${id}/chat/?token=${encodeURIComponent(token)}`
    );
    
    websocket.onopen = () => {
      console.log("✅ WebSocket connected successfully");
      setConnectionStatus("connected");
      setReconnectAttempts(0);
      
      // Send presence notification
      websocket.send(JSON.stringify({ 
        type: "user_online", 
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}`,
        user_type: user.userType 
      }));
      
      toast.success("Connected to live chat", { duration: 2000 });
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = (event) => {
      console.log("⚠️ WebSocket disconnected:", event.code, event.reason);
      setConnectionStatus("disconnected");
      
      // Don't reconnect if closed normally
      if (event.code === 1000) {
        console.log("WebSocket closed normally");
        return;
      }
      
      // Auto-reconnect logic with exponential backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
          MAX_RECONNECT_DELAY
        );
        
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          setupWebSocket();
        }, delay);
      } else {
        toast.error("Unable to connect to live chat. Please refresh the page.");
      }
    };

    websocket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setConnectionStatus("disconnected");
      
      // Try to get more error details
      if (websocket.readyState === WebSocket.CLOSED) {
        console.error("WebSocket closed unexpectedly");
      }
    };

    setWs(websocket);
  } catch (error) {
    console.error("❌ Error creating WebSocket:", error);
    setConnectionStatus("disconnected");
  }
}, [id, user, reconnectAttempts, ws]);
  // Handle different types of WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case "chat":
      case "message":
        const newChatMessage: ChatMessage = {
          id: data.id || Date.now().toString(),
          message: data.message,
          user_id: data.user_id,
          user_type: data.user_type,
          timestamp: data.timestamp || new Date().toISOString(),
          status: "sent",
          attachments: data.attachments || []
        };
        
        setChatMessages(prev => {
          // Avoid duplicate messages
          const exists = prev.find(msg => msg.id === newChatMessage.id);
          if (exists) return prev;
          return [...prev, newChatMessage];
        });
        break;

      case "typing":
        setTypingUsers(prev => ({
          ...prev,
          [data.user_id]: {
            user_id: data.user_id,
            user_name: data.user_name || "Someone",
            timestamp: Date.now()
          }
        }));
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[data.user_id];
            return updated;
          });
        }, 3000);
        break;

      case "user_online":
        setOnlineUsers(prev => ({
          ...prev,
          [data.user_id]: {
            user_id: data.user_id,
            user_name: data.user_name,
            user_type: data.user_type,
            last_seen: new Date().toISOString()
          }
        }));
        break;

      case "user_offline":
        setOnlineUsers(prev => {
          const updated = { ...prev };
          delete updated[data.user_id];
          return updated;
        });
        break;

      case "message_status":
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === data.message_id 
              ? { ...msg, status: data.status }
              : msg
          )
        );
        break;

      default:
        console.log("📨 Unhandled WebSocket message type:", data.type);
    }
  }, []);

  // Fetch ticket data
  const fetchTicketData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [ticketResponse, interventionsResponse] = await Promise.all([
        ticketsAPI.getById(id),
        interventionsAPI.getByTicketId(id)
      ]);
      
      setTicket(ticketResponse.data);
      setInterventions(interventionsResponse.data.results || interventionsResponse.data);
    } catch (error) {
      console.error("❌ Error fetching ticket data:", error);
      toast.error("Failed to load ticket details");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket || !ws || ws.readyState !== WebSocket.OPEN) {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        toast.error("Connection lost. Please wait for reconnection.");
      }
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const messagePayload = {
      id: tempId,
      type: "chat",
      message: newMessage.trim(),
      user_id: user?.id,
      user_type: user?.userType,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments.map(file => ({
        id: `temp_${Date.now()}_${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      })) : undefined
    };

    // Add message immediately to UI (optimistic update)
    const optimisticMessage: ChatMessage = {
      ...messagePayload,
      status: "sending"
    };
    setChatMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send via WebSocket
      ws.send(JSON.stringify(messagePayload));
      
      // If technician/admin, also save as intervention
      if (user?.userType === 'technician' || user?.userType === 'admin') {
        setSubmitting(true);
        await interventionsAPI.create({
          ticket: ticket.id,
          report: newMessage.trim(),
        });
        
        // Refresh interventions
        const interventionsResponse = await interventionsAPI.getByTicketId(ticket.id);
        setInterventions(interventionsResponse.data.results || interventionsResponse.data);
      }
      
      // Update message status
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: "sent" }
            : msg
        )
      );
      
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error("Failed to send message");
      
      // Update message status to failed
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: "failed" }
            : msg
        )
      );
    } finally {
      setNewMessage("");
      setAttachments([]);
      setSubmitting(false);
      messageInputRef.current?.focus();
    }
  };

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      ws.send(JSON.stringify({ 
        type: "typing", 
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}` 
      }));
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [ws, user, isTyping]);

  // Handle file attachments
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) attached`);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
  let heartbeatInterval: NodeJS.Timeout;
  
  if (ws && ws.readyState === WebSocket.OPEN && connectionStatus === "connected") {
    // Send periodic ping messages to keep connection alive
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
        } catch (error) {
          console.error("Error sending heartbeat:", error);
        }
      }
    }, 30000); // Every 30 seconds
  }
  
  return () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  };
}, [ws, connectionStatus]);
  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString("en-US", { 
        weekday: "short", 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, { icon: JSX.Element; color: string }> = {
      open: { icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-500" },
      resolved: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500" },
      in_progress: { icon: <ClockIcon className="w-4 h-4" />, color: "text-blue-500" },
      closed: { icon: <XCircle className="w-4 h-4" />, color: "text-gray-500" },
    };
    const statusInfo = icons[status] || icons.open;
    return <span className={statusInfo.color}>{statusInfo.icon}</span>;
  };

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

  const getConnectionStatusIndicator = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "connecting":
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  // Effects
  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [fetchTicketData]);

  useEffect(() => {
    const cleanup = setupWebSocket();
    return () => {
      cleanup?.();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [setupWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, interventions, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close(1000, "Component unmounting");
      }
      attachments.forEach(file => {
        if (file instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, []);

  // Filter messages based on current filter
  const getFilteredMessages = () => {
    const allMessages = [
      // Original description as first message
      {
        type: "original",
        id: "original",
        message: ticket?.description || "",
        user_id: ticket?.client.user.id || "",
        user_type: "client" as const,
        timestamp: ticket?.created_at || "",
        user_name: ticket ? `${ticket.client.user.first_name} ${ticket.client.user.last_name}` : ""
      },
      // Interventions
      ...interventions.map(intervention => ({
        type: "intervention",
        id: intervention.id,
        message: intervention.report,
        user_id: intervention.technician?.user.id || ticket?.client.user.id || "",
        user_type: intervention.technician ? "technician" as const : "client" as const,
        timestamp: intervention.created_at,
        user_name: intervention.technician 
          ? `${intervention.technician.user.first_name} ${intervention.technician.user.last_name}`
          : ticket ? `${ticket.client.user.first_name} ${ticket.client.user.last_name}` : "",
        attachments: intervention.attachments || []
      })),
      // Chat messages
      ...chatMessages.map(msg => ({
        type: "chat",
        ...msg,
        user_name: msg.user_type === "client" && ticket
          ? `${ticket.client.user.first_name} ${ticket.client.user.last_name}`
          : msg.user_type === "technician" && ticket?.technician
          ? `${ticket.technician.user.first_name} ${ticket.technician.user.last_name}`
          : "Support"
      }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    switch (messageFilter) {
      case "interventions":
        return allMessages.filter(msg => msg.type === "intervention" || msg.type === "original");
      case "chat":
        return allMessages.filter(msg => msg.type === "chat");
      default:
        return allMessages;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Loading Ticket</h2>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the ticket details...</p>
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

  const filteredMessages = getFilteredMessages();
  const currentTypingUsers = Object.values(typingUsers).filter(
    user => user.user_id !== user?.id && Date.now() - user.timestamp < 3000
  );

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Enhanced Header */}
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
                  Manage and respond to customer inquiries
                </p>
              </div>
            </div>

            {/* Connection Status & Online Users */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                {getConnectionStatusIndicator()}
                <span className={`font-medium ${
                  connectionStatus === "connected" 
                    ? "text-green-600 dark:text-green-400" 
                    : connectionStatus === "connecting"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {connectionStatus === "connected" && "Connected"}
                  {connectionStatus === "connecting" && "Connecting..."}
                  {connectionStatus === "disconnected" && "Disconnected"}
                </span>
              </div>

              <button
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{Object.keys(onlineUsers).length}</span>
              </button>
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
                  <User className="w-5 h-5 mr-2" /> Customer
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

              {/* Online Users Panel */}
              {showOnlineUsers && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <Users className="w-5 h-5 mr-2" /> Online Users
                  </h2>
                  <div className="space-y-3">
                    {Object.values(onlineUsers).map((onlineUser) => (
                      <div key={onlineUser.user_id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {onlineUser.user_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {onlineUser.user_type}
                          </p>
                        </div>
                      </div>
                    ))}
                    {Object.keys(onlineUsers).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No users currently online
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
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
                              onClick={() => setSelectedImage(image.image)}
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

                {/* Chat Section */}
                <div className="flex flex-col h-[600px]">
                  {/* Message Filter Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {[
                      { key: "all", label: "All Messages", icon: MessageSquare },
                      { key: "interventions", label: "Interventions", icon: Settings },
                      { key: "chat", label: "Live Chat", icon: MessageCircle }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setMessageFilter(key as any)}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          messageFilter === key
                            ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Messages Container */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50"
                  >
                    {filteredMessages.map((message) => {
                      const isOwnMessage = message.user_id === user?.id;
                      const isClient = message.user_type === "client";
                      const isSystemMessage = message.type === "original";
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage && !isSystemMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex max-w-[80%] ${
                            isOwnMessage && !isSystemMessage ? "flex-row-reverse" : "flex-row"
                          }`}>
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                                isSystemMessage
                                  ? "bg-gray-500"
                                  : isClient
                                  ? "bg-blue-500"
                                  : message.user_type === "technician"
                                  ? "bg-green-500"
                                  : "bg-purple-500"
                              }`}>
                                {isSystemMessage
                                  ? <File className="w-5 h-5" />
                                  : message.user_name
                                  ? message.user_name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)
                                  : <User className="w-5 h-5" />
                                }
                              </div>
                            </div>

                            {/* Message Content */}
                            <div className={`${isOwnMessage && !isSystemMessage ? "mr-3" : "ml-3"} min-w-0 flex-1`}>
                              <div className={`p-4 rounded-2xl ${
                                isSystemMessage
                                  ? "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                  : isOwnMessage
                                  ? "bg-blue-500 text-white"
                                  : isClient
                                  ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                              }`}>
                                {isSystemMessage && (
                                  <div className="flex items-center mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <File className="w-4 h-4 mr-2" />
                                    Original Description
                                  </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.message}
                                </p>
                                
                                {/* Message Status */}
                                {message.status && message.status !== "sent" && (
                                  <div className="flex items-center mt-2 text-xs opacity-75">
                                    {message.status === "sending" && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                    {message.status === "failed" && <XCircle className="w-3 h-3 mr-1" />}
                                    <span className="capitalize">{message.status}</span>
                                  </div>
                                )}
                                
                                {/* Attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {message.attachments.map((attachment, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                        {attachment.type.startsWith('image/') ? (
                                          <ImageIcon className="w-4 h-4" />
                                        ) : (
                                          <File className="w-4 h-4" />
                                        )}
                                        <span className="text-xs truncate">{attachment.name}</span>
                                        <span className="text-xs opacity-75">({formatFileSize(attachment.size)})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Message Footer */}
                              <div className={`flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 gap-2 ${
                                isOwnMessage && !isSystemMessage ? "justify-end" : "justify-start"
                              }`}>
                                <span className="font-medium">{message.user_name}</span>
                                <span>•</span>
                                <span>{formatDate(message.timestamp)}</span>
                                {message.type === "intervention" && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Settings className="w-3 h-3" />
                                      Intervention
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicators */}
                    {currentTypingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {currentTypingUsers.length === 1
                                ? `${currentTypingUsers[0].user_name} is typing...`
                                : `${currentTypingUsers.length} people are typing...`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attachments ({attachments.length})
                          </span>
                          <button
                            onClick={() => setAttachments([])}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {file.type.startsWith('image/') ? (
                                  <ImageIcon className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <File className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                              </div>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <textarea
                            ref={messageInputRef}
                            rows={3}
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                            disabled={connectionStatus !== "connected"}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            id="attachment" 
                            className="hidden" 
                            multiple 
                            accept="image/*,application/pdf,.doc,.docx,.txt"
                            onChange={handleAttachment} 
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            title="Attach files"
                          >
                            <Paperclip className="w-5 h-5" />
                          </button>
                          <button 
                            type="submit" 
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center" 
                            disabled={!newMessage.trim() || submitting || connectionStatus !== "connected"}
                            title={connectionStatus !== "connected" ? "Connection required" : "Send message"}
                          >
                            {submitting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {connectionStatus !== "connected" && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            {connectionStatus === "connecting" 
                              ? "Connecting to live chat..." 
                              : "Disconnected from live chat. Messages cannot be sent."
                            }
                          </span>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={selectedImage}
                alt="Full size attachment"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketReply;