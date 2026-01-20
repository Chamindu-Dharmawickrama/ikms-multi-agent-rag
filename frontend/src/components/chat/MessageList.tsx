import React, { useEffect, useRef, useState } from "react";
import { User, Bot, Loader2, Check } from "lucide-react";
import type { Message } from "../../types/chat";

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    isLoading = false,
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const steps = [
        "Retrieving context from knowledge base...",
        "Summarizing information...",
        "Verifying response accuracy...",
        "Finalizing answer...",
    ];

    useEffect(() => {
        if (isLoading) {
            setCurrentStep(0);
            const interval = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev < steps.length - 1) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const normalizeRole = (role: string): "user" | "assistant" => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === "user") {
            return "user";
        }
        return "assistant";
    };

    const sendingMessageSkeleton = () => {
        return (
            <div className="flex gap-3 justify-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <Bot className="w-5.5 h-5.5 text-custom-dark" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl space-y-2 min-w-[300px]">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-2 transition-all duration-500 ${
                                    isActive
                                        ? "opacity-100 scale-100"
                                        : isCompleted
                                          ? "opacity-70 scale-95"
                                          : "opacity-30 scale-95"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : isActive ? (
                                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                                )}
                                <span
                                    className={`text-[16px] ${
                                        isActive
                                            ? "text-gray-700 font-medium"
                                            : isCompleted
                                              ? "text-gray-600 "
                                              : "text-gray-500"
                                    }`}
                                >
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 ">
            {/* one msg */}
            {messages.map((message, index) => {
                const normalizedRole = normalizeRole(message.role);
                const isUser = normalizedRole === "user";

                return (
                    <div
                        key={index}
                        className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                        {!isUser && (
                            <div className="shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Bot className="w-5.5 h-5.5 text-custom-dark" />
                            </div>
                        )}

                        {/* Message bubble */}
                        <div className="max-w-[75%] sm:max-w-[70%] flex flex-col">
                            <div
                                className={`px-4 py-2.5 rounded-2xl ${
                                    isUser
                                        ? "bg-custom-dark text-white"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                <p className="text-sm sm:text-[15px] whitespace-pre-wrap wrap-break-word">
                                    {message.content}
                                </p>
                            </div>
                            <p
                                className={`text-xs text-gray-500 mt-1 px-2 ${
                                    isUser ? "text-right" : "text-left"
                                }`}
                            >
                                {formatTime(message.timestamp)}
                            </p>
                        </div>

                        {isUser && (
                            <div className="shrink-0 w-10 h-10 rounded-full bg-custom-dark flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                );
            })}

            {isLoading && sendingMessageSkeleton()}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
