import React from "react";
import { Bot, User } from "lucide-react";

const MessageSkeleton: React.FC = () => {
    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex gap-3 justify-start animate-pulse">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-400" />
                </div>
                <div className="max-w-[75%] sm:max-w-[70%] flex flex-col gap-2">
                    <div className="bg-gray-200 rounded-2xl px-4 py-3 h-20 w-80"></div>
                    <div className="bg-gray-200 rounded h-3 w-16 ml-2"></div>
                </div>
            </div>

            <div className="flex gap-3 justify-end animate-pulse">
                <div className="max-w-[75%] sm:max-w-[70%] flex flex-col gap-2">
                    <div className="bg-gray-200 rounded-2xl px-4 py-3 h-16 w-64"></div>
                    <div className="bg-gray-200 rounded h-3 w-16 ml-auto mr-2"></div>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="flex gap-3 justify-start animate-pulse">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-400" />
                </div>
                <div className="max-w-[75%] sm:max-w-[70%] flex flex-col gap-2">
                    <div className="bg-gray-200 rounded-2xl px-4 py-3 h-24 w-96"></div>
                    <div className="bg-gray-200 rounded h-3 w-16 ml-2"></div>
                </div>
            </div>

            <div className="flex gap-3 justify-end animate-pulse">
                <div className="max-w-[75%] sm:max-w-[70%] flex flex-col gap-2">
                    <div className="bg-gray-200 rounded-2xl px-4 py-3 h-14 w-56"></div>
                    <div className="bg-gray-200 rounded h-3 w-16 ml-auto mr-2"></div>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="flex gap-3 justify-start animate-pulse">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-400" />
                </div>
                <div className="max-w-[75%] sm:max-w-[70%] flex flex-col gap-2">
                    <div className="bg-gray-200 rounded-2xl px-4 py-3 h-16 w-72"></div>
                    <div className="bg-gray-200 rounded h-3 w-16 ml-2"></div>
                </div>
            </div>
        </div>
    );
};

export default MessageSkeleton;
