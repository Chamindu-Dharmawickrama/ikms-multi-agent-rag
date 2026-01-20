import api from "../../utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
    CreateConversationResponse,
    ConversationQuestionResponse,
    ConversationHistoryResponse,
    ConversationSummary,
    Message,
} from "../../types/chat";
