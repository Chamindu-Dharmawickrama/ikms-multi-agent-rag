import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store/store";
import ChatHeader from "../../../../components/chat/ChatHeader";
import {
    addUserMessage,
    clearChatState,
    createConversation,
    sendMessage,
    setActiveFilename,
} from "../../../../store/chat/chatSlice";
import FileSelector from "../../../../components/chat/FileSelector";
import { AlertCircle, FileText } from "lucide-react";
import EmptyState from "../../../../components/chat/EmptyState";
import MessageSkeleton from "../../../../components/chat/MessageSkeleton";
import MessageList from "../../../../components/chat/MessageList";
import ChatInput from "../../../../components/chat/ChatInput";

const Chat = () => {
    const dispatch = useDispatch<AppDispatch>();

    const {
        currentSessionId,
        messages,
        sendingMessage,
        creatingConversation,
        loadingHistory,
        error,
        messageCount,
        activeFileId,
        activeFilename,
        isFileLocked,
    } = useSelector((state: RootState) => state.chat);

    // set selected file
    const handleFileSelect = (fileId: string, filename: string) => {
        if (!isFileLocked) {
            dispatch(clearChatState());
            dispatch(setActiveFilename(filename));
            dispatch(createConversation(fileId));
        }
    };

    // send the user msg
    const handleSendMessage = (message: string) => {
        if (!currentSessionId || !message.trim() || !activeFileId) return;

        dispatch(addUserMessage(message));

        dispatch(
            sendMessage({
                sessionId: currentSessionId,
                question: message,
            }),
        );
    };

    const handleNewChat = () => {
        dispatch(clearChatState());
    };

    const handleExampleClick = (question: string) => {
        handleSendMessage(question);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <ChatHeader onNewChat={handleNewChat} messageCount={messageCount} />

            <div className="px-4 sm:px-6 pt-2 pb-2">
                <FileSelector
                    selectedFileId={activeFileId}
                    onFileSelect={handleFileSelect}
                    disabled={creatingConversation}
                    locked={isFileLocked}
                />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                {!activeFileId && !loadingHistory ? (
                    <div className="flex items-center justify-center h-full px-4">
                        <div className="text-center max-w-md">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-custom-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Select a File to Start
                            </h3>
                            <p className="text-sm text-gray-600">
                                Choose a PDF file from the list above to start
                                asking questions. Each conversation is scoped to
                                a specific file.
                            </p>
                        </div>
                    </div>
                ) : loadingHistory && messages.length === 0 ? (
                    <MessageSkeleton />
                ) : messages.length === 0 ? (
                    <EmptyState onExampleClick={handleExampleClick} />
                ) : (
                    <MessageList
                        messages={messages}
                        isLoading={sendingMessage}
                    />
                )}
            </div>

            {error && (
                <div className="mx-4 sm:mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Input Area */}
            <ChatInput
                onSendMessage={handleSendMessage}
                disabled={
                    !activeFileId ||
                    sendingMessage ||
                    creatingConversation ||
                    !currentSessionId
                }
                placeholder={
                    !activeFileId
                        ? "Select a file first..."
                        : creatingConversation
                          ? "Creating conversation..."
                          : `Ask a question about ${activeFilename}...`
                }
            />
        </div>
    );
};

export default Chat;
