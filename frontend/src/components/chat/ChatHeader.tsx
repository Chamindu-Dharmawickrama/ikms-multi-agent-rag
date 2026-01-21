import React from "react";
import { MessageSquare, Plus } from "lucide-react";

interface ChatHeaderProps {
    onNewChat: () => void;
    messageCount?: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    onNewChat,
    messageCount = 0,
}) => {
    return (
        <div className="flex items-center justify-between px-4 mt-2 sm:px-6 pb-3 border-b border-gray-200 bg-white ">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-custom-dark" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-[22px] font-bold text-gray-800">
                        {messageCount > 0
                            ? "Conversation"
                            : "Start a New Conversation"}
                    </h1>
                    {messageCount > 0 && (
                        <p className="text-[13px] text-gray-500">
                            {messageCount} message
                            {messageCount !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={onNewChat}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-custom-dark-less hover:bg-custom-dark-more text-white rounded-lg transition-colors font-medium cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Chat</span>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
