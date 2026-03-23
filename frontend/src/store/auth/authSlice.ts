import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { safeDecodeJwt } from "../../utils/decodeJWT";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface User {
    user_id: string;
    email: string;
    name?: string;
    picture?: string;
}

interface AuthState {
    user: User | null;
    access_token: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    access_token: null,
    isAuthenticated: false,
    isHydrated: false,
    loading: false,
    error: null,
};

export const googleAuth = createAsyncThunk(
    "auth/googleAuth",
    async (googleToken: string, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/google`, {
                token: googleToken,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Authentication failed",
            );
        }
    },
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        rehydrateAuth: (state) => {
            if (typeof window !== "undefined") {
                // get the token and user from localStorage
                const token = localStorage.getItem("access_token");
                const userRaw = localStorage.getItem("user");
                let user: User | null = null;
                if (userRaw) {
                    try {
                        user = JSON.parse(userRaw);
                    } catch {
                        localStorage.removeItem("user");
                    }
                }

                if (token && user) {
                    const payload = safeDecodeJwt(token);
                    // Check if token is valid and not expired
                    if (
                        payload &&
                        (!payload.exp || payload.exp * 1000 > Date.now())
                    ) {
                        state.access_token = token;
                        state.isAuthenticated = true;
                        state.user = user;
                    } else {
                        // Token is invalid or expired, remove it
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("user");
                    }
                }
            }

            state.isHydrated = true;
        },
        logout: (state) => {
            state.user = null;
            state.access_token = null;
            state.isAuthenticated = false;
            state.isHydrated = false;
            state.error = null;
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Google Auth
        builder
            .addCase(googleAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                googleAuth.fulfilled,
                (
                    state,
                    action: PayloadAction<{ access_token: string; user: User }>,
                ) => {
                    state.loading = false;
                    state.isHydrated = true;
                    const access_token = action.payload.access_token;
                    if (!access_token) {
                        state.error = "Login succeeded but token missing.";
                        state.isAuthenticated = false;
                        return;
                    }
                    state.access_token = access_token;
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    state.error = null;
                    if (typeof window !== "undefined") {
                        localStorage.setItem("access_token", access_token);
                        localStorage.setItem(
                            "user",
                            JSON.stringify(action.payload.user),
                        );
                    }
                },
            )
            .addCase(googleAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.access_token = null;
                state.user = null;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError, rehydrateAuth } = authSlice.actions;
export default authSlice.reducer;
