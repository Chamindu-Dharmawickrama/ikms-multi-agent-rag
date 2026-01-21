import React from "react";
import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
    onExampleClick: (question: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onExampleClick }) => {
    
    const exampleQuestions = [
        "What is the main topic of the document?",
        "What is this document about?",
        "What is the purpose of this document?",
    ];

    return (
        <div className="h-full flex items-center justify-center px-4">
            <div className="max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <MessageSquare
                            className="w-10 h-10 text-gray-400"
                            strokeWidth={1.5}
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    No messages yet
                </h2>
                <p className="text-gray-600 mb-8">
                    Start a conversation by asking a question about your
                    documents
                </p>

                <div className="space-y-3">
                    <p className="text-sm text-gray-500 font-medium">
                        Try asking:
                    </p>
                    {exampleQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => onExampleClick(question)}
                            className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-custom-dark hover:bg-gray-50 transition-all text-gray-700 text-sm text-left"
                        >
                            "{question}"
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
