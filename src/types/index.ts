export interface Profile {
  id: string;
  display_name: string;
  preferred_language: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  created_by: string | null;
  created_at: string;
  is_public: boolean;
  invite_code: string;
}

export interface PublicRoomWithCount {
  id: string;
  name: string;
  description: string;
  created_by: string | null;
  created_at: string;
  is_public: boolean;
  member_count: number;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  source_language: string;
  created_at: string;
}

export interface MessageTranslation {
  id: string;
  message_id: string;
  target_language: string;
  translated_content: string;
  created_at: string;
}

export interface MessageWithSender extends Message {
  sender?: Profile;
  translation?: string;
  showOriginal?: boolean;
}
