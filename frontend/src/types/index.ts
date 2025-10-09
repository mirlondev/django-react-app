
  export interface OnlineUser {
    user_id: string;
    user_name: string;
    user_type: string;
    last_seen: string;
  }
  
  export interface WhatsAppMessage {
    id: string;
    body: string;
    direction: 'inbound' | 'outbound';
    status: string;
    timestamp: string;
    is_whatsapp?: boolean;
  }
  export interface Ticket {
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
  
  export interface Intervention {
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
  
  export interface ChatMessage {
    id: string;
    message: string;
    user_id: string;
    user_type: "client" | "technician" | "admin";
    timestamp: string;
    status?: "sending" | "sent" | "failed";
    image_url?: string;
    is_whatsapp?: boolean; // Nouvelle propriété
    // Nouveau champ pour l'URL de l'image
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  }


  
export interface TypingUser {
    user_id: string;
    user_name: string;
    timestamp: number;
  }
  




export interface Client {
  id: string;
  user: User;
  phone?: string;
  company?: string;
}

export interface Technician {
  id: string;
  user: User;
  phone?: string;
  specialty: string;
}

export interface TicketImage {
  id: string;
  image: string;
}



export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  rater: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface RatingStats {
  average_rating: number;
  total_ratings: number;
  ratings: Rating[];
}

export interface ChatRequest {
  id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  technician_id: string;
}


export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userType: string;
  profile_image: string | null;
}

export interface PerformanceData {
  name: string;
  value: number;
}

export interface PriorityData {
  name: string;
  value: number;
  color: string;
}
export interface StatusData {
  name: string;
  value: number;
  color: string;
}


export interface Procedure {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  status: string;
  author: Author;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  bookmarks: number;
  tags: ProcedureTag[];
  images: ProcedureImage[];
  attachments: ProcedureAttachment[];
  related_procedures: Procedure[];
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  author_name: string;
  author_title: string;
  author_avatar: string;
  reading_time?: number;
}


export interface ProcedureTag {
  id: string;
  name: string;
  slug: string;
}

export interface ProcedureImage {
  id: string;
  image_url: string;
  caption?: string;
  alt_text?: string;
  uploaded_at: string;
}

export interface ProcedureAttachment {
  id: string;
  name: string;
  file_type: string;
  file_size: string;
  file_url: string;
  uploaded_at: string;
}


interface Author {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
}

