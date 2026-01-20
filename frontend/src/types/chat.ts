export interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface CreateConversationResponse {
    session_id: string;
    message: string;
    file_id?: string;
}

export interface ConversationQuestionRequest {
    question: string;
}

export interface ConversationQuestionResponse {
    session_id: string;
    answer: string;
    context: string;
    message_count: number;
    conversation_history?: string;
}

export interface ConversationHistoryResponse {
    session_id: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    messages: Message[];
    current_state: Record<string, any>;
    conversation_history: string;
    active_file_id?: string;
    filename?: string;
}

export interface ConversationSummary {
    session_id: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    active_file_id?: string;
    filename?: string;
}
