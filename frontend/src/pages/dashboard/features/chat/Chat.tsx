import React, { useState } from "react";
import { MessageSquare, History, Plus, Send } from "lucide-react";

const Chat = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<
        Array<{ role: string; content: string }>
    >([]);

    const exampleQuestions = [
        "What is HNSW indexing?",
        "Explain vector databases",
    ];

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { role: "user", content: message }]);
            setMessage("");
            // TODO: Connect to backend API
        }
    };

    const handleExampleClick = (question: string) => {
        setMessage(question);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Start a New Conversation
                </h1>
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <History className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Chat</span>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    /* Empty State */
                    <div className="h-full flex items-center justify-center px-4">
                        <div className="max-w-md text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                                    <MessageSquare
                                        className="w-10 h-10 text-gray-400"
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </div>

                            {/* Text */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                No messages yet
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Start a conversation by asking a question about
                                your documents
                            </p>

                            {/* Example Questions */}
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500">
                                    Try asking:
                                </p>
                                {exampleQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleExampleClick(question)
                                        }
                                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-gray-700 text-sm"
                                    >
                                        "{question}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Messages List */
                    <div className="p-4 sm:p-6 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                                        msg.role === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-white">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Ask a question to start the conversation..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
