export type Thought = {
  id: string;
  content: string;
  createdAt: string;
};

export type ChatMessageType = {
  id: string;
  content: string;
  isUser: boolean;
}; 