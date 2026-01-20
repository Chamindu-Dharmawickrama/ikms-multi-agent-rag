import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    disabled = false,
    placeholder = "Ask a question about your documents...",
}) => {
    const [message, setMessage] = useState("");

    // if !disable --> send msg
    const handleSend = () => {
        if (!disabled) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-dark focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="p-3 bg-custom-dark hover:bg-custom-dark-more disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    aria-label="Send message"
                >
                    {disabled ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
