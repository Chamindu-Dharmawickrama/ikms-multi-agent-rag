import api from "../../utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
    CreateConversationResponse,
    ConversationQuestionResponse,
    ConversationHistoryResponse,
    ConversationSummary,
    Message,
} from "../../types/chat";

interface ChatState {
    // Current conversation
    currentSessionId: string | null;
    messages: Message[];

    // File association (locked once conversation is created)
    activeFileId: string | null;
    activeFilename: string | null;
    isFileLocked: boolean; // true when viewing existing conversation

    creatingConversation: boolean;
    sendingMessage: boolean;
    loadingHistory: boolean;
    loadingConversations: boolean;

    conversationCreated: boolean;
    messageSent: boolean;
    error: string | null;

    // Conversation data
    messageCount: number;
    conversations: ConversationSummary[];
}

const initialState: ChatState = {
    currentSessionId: null,
    messages: [],
    activeFileId: null,
    activeFilename: null,
    isFileLocked: false,
    creatingConversation: false,
    sendingMessage: false,
    loadingHistory: false,
    loadingConversations: false,
    conversationCreated: false,
    messageSent: false,
    error: null,
    messageCount: 0,
    conversations: [],
};

// Create a new conversation
export const createConversation = createAsyncThunk<
    CreateConversationResponse,
    string | undefined,
    { rejectValue: string }
>("chat/createConversation", async (fileId, { rejectWithValue }) => {
    try {
        const url = fileId
            ? `/conversations/?file_id=${fileId}`
            : "/conversations/";
        const response = await api.post<CreateConversationResponse>(url);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.detail || "Failed to create conversation",
        );
    }
});

// Send a message in conversation
export const sendMessage = createAsyncThunk<
    ConversationQuestionResponse,
    { sessionId: string; question: string },
    { rejectValue: string }
>("chat/sendMessage", async ({ sessionId, question }, { rejectWithValue }) => {
    try {
        const response = await api.post<ConversationQuestionResponse>(
            `/conversations/${sessionId}/ask`,
            { question },
        );
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.detail || "Failed to send message",
        );
    }
});

// Get conversation history
export const getConversationHistory = createAsyncThunk<
    ConversationHistoryResponse,
    string,
    { rejectValue: string }
>("chat/getHistory", async (sessionId, { rejectWithValue }) => {
    try {
        const response = await api.get<ConversationHistoryResponse>(
            `/conversations/${sessionId}`,
        );
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.detail ||
                "Failed to load conversation history",
        );
    }
});

// Get all conversations
export const getAllConversations = createAsyncThunk<
    ConversationSummary[],
    void,
    { rejectValue: string }
>("chat/getAllConversations", async (_, { rejectWithValue }) => {
    try {
        const response =
            await api.get<ConversationSummary[]>("/conversations/");
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.detail || "Failed to load conversations",
        );
    }
});

// Delete conversation
export const deleteConversation = createAsyncThunk<
    { sessionId: string },
    string,
    { rejectValue: string }
>("chat/deleteConversation", async (sessionId, { rejectWithValue }) => {
    try {
        await api.delete(`/conversations/${sessionId}`);
        return { sessionId };
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.detail || "Failed to delete conversation",
        );
    }
});

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        clearChatState: (state) => {
            state.messages = [];
            state.currentSessionId = null;
            state.activeFileId = null;
            state.activeFilename = null;
            state.isFileLocked = false;
            state.error = null;
            state.conversationCreated = false;
            state.messageSent = false;
            state.messageCount = 0;
        },
        clearError: (state) => {
            state.error = null;
        },
        addUserMessage: (state, action) => {
            state.messages.push({
                role: "user",
                content: action.payload,
                timestamp: new Date().toISOString(),
            });
        },
        setCurrentSession: (state, action) => {
            state.currentSessionId = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        setActiveFilename: (state, action) => {
            state.activeFilename = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(createConversation.pending, (state) => {
                state.creatingConversation = true;
                state.error = null;
            })
            .addCase(createConversation.fulfilled, (state, action) => {
                state.creatingConversation = false;
                state.conversationCreated = true;
                state.currentSessionId = action.payload.session_id;
                state.messages = [];
                state.messageCount = 0;
                // Lock the file once conversation is created
                if (action.payload.file_id) {
                    state.activeFileId = action.payload.file_id;
                    state.isFileLocked = true;
                }
            })
            .addCase(createConversation.rejected, (state, action) => {
                state.creatingConversation = false;
                state.error = action.payload || "Failed to create conversation";
            })

            .addCase(sendMessage.pending, (state) => {
                state.sendingMessage = true;
                state.error = null;
                state.messageSent = false;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sendingMessage = false;
                state.messageSent = true;
                state.messageCount = action.payload.message_count;
                // Add assistant message
                state.messages.push({
                    role: "assistant",
                    content: action.payload.answer,
                    timestamp: new Date().toISOString(),
                });
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.sendingMessage = false;
                state.error = action.payload || "Failed to send message";
            })

            .addCase(getConversationHistory.pending, (state) => {
                state.loadingHistory = true;
                state.error = null;
            })
            .addCase(getConversationHistory.fulfilled, (state, action) => {
                state.loadingHistory = false;
                state.currentSessionId = action.payload.session_id;
                state.messages = action.payload.messages;
                state.messageCount = action.payload.message_count;
                // Restore file association and lock when loading history
                state.activeFileId = action.payload.active_file_id || null;
                state.activeFilename = action.payload.filename || null;
                state.isFileLocked = !!action.payload.active_file_id; // Lock if file is associated
            })
            .addCase(getConversationHistory.rejected, (state, action) => {
                state.loadingHistory = false;
                state.error = action.payload || "Failed to load history";
            })

            .addCase(getAllConversations.pending, (state) => {
                state.loadingConversations = true;
                state.error = null;
            })
            .addCase(getAllConversations.fulfilled, (state, action) => {
                state.loadingConversations = false;
                // Filter out empty conversations (with 0 messages)
                state.conversations = action.payload.filter(
                    (conv) => conv.message_count > 0,
                );
            })
            .addCase(getAllConversations.rejected, (state, action) => {
                state.loadingConversations = false;
                state.error = action.payload || "Failed to load conversations";
            })

            .addCase(deleteConversation.fulfilled, (state, action) => {
                state.conversations = state.conversations.filter(
                    (conv) => conv.session_id !== action.payload.sessionId,
                );
                if (state.currentSessionId === action.payload.sessionId) {
                    state.currentSessionId = null;
                    state.messages = [];
                    state.messageCount = 0;
                }
            })
            .addCase(deleteConversation.rejected, (state, action) => {
                state.error = action.payload || "Failed to delete conversation";
            });
    },
});

export const {
    clearChatState,
    clearError,
    addUserMessage,
    setCurrentSession,
    clearMessages,
    setActiveFilename,
} = chatSlice.actions;

export default chatSlice.reducer;
