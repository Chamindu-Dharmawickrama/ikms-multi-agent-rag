import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./fileUpload/fileSlice";
import chatReducer from "./chat/chatSlice";

export const store = configureStore({
    reducer: {
        file: fileReducer,
        chat: chatReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
