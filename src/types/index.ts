
export type FileType = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
};

export type MessageType = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

export type ChatSessionType = {
  id: string;
  title: string;
  files: FileType[];
  messages: MessageType[];
  createdAt: Date;
};

export type FileContentType = {
  id: string;
  content: string;
};
