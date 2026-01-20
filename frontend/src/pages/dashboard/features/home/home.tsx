import {
    MessageSquare,
    Upload,
    GitBranch,
    FileUp,
    Database,
    MessageCircle,
    Users,
    CheckCircle,
    Sparkles,
} from "lucide-react";
import { useNavigation } from "../../../../contexts/NavigationContext";

const Home = () => {
    const { setCurrentPage } = useNavigation();
    const features = [
        {
            icon: MessageSquare,
            title: "Multi-Turn Conversations",
            description:
                "Maintain context across multiple questions with intelligent conversation memory",
            gradient: "from-blue-500 to-blue-600",
        },
        {
            icon: Upload,
            title: "Document Upload",
            description:
                "Index PDF documents for semantic search and intelligent retrieval",
            gradient: "from-purple-500 to-purple-600",
        },
        {
            icon: GitBranch,
            title: "Multi-Agent Pipeline",
            description:
                "Advanced retrieval, summarization, and verification agents working in harmony",
            gradient: "from-indigo-500 to-indigo-600",
        },
    ];

    const steps = [
        {
            number: 1,
            icon: FileUp,
            title: "Upload Your Documents",
            description:
                "Upload PDF documents to build your knowledge base. Files are automatically processed and indexed for intelligent search.",
        },
        {
            number: 2,
            icon: Database,
            title: "Smart Indexing",
            description:
                "Your documents are split into searchable chunks and converted into semantic embeddings stored in a vector database.",
        },
        {
            number: 3,
            icon: MessageCircle,
            title: "Ask Questions",
            description:
                "Start a conversation and ask questions in natural language. The system remembers context across multiple questions.",
        },
        {
            number: 4,
            icon: Users,
            title: "AI Agents Work Together",
            description:
                "Three specialized agents collaborate: one retrieves relevant information, another creates a draft answer, and a third verifies accuracy.",
        },
        {
            number: 5,
            icon: CheckCircle,
            title: "Get Verified Answers",
            description:
                "Receive accurate, fact-checked responses grounded in your documents. All conversations are saved for future reference.",
        },
    ];

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                        Welcome to IKMS Multi-Agent RAG
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Unlock the power of intelligent knowledge management
                        with our advanced multi-agent RAG system. Transform your
                        documents into actionable insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 sm:mb-10">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-xl p-4 sm:p-5 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div
                                        className={`w-11 h-11 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <button
                        onClick={() => setCurrentPage("chat")}
                        className="group w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-base">Ask Now</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage("upload")}
                        className="group w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-custom-dark-less to-custom-dark-more hover:from-custom-dark-hover-less hover:to-custom-dark-hover-more text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="text-base">Upload Documents</span>
                    </button>
                </div>

                <div className="mt-8 sm:mt-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                            How It Works
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            IKMS is an intelligent conversational assistant that
                            helps you find answers from your documents. Simply
                            upload your PDF files, ask questions in natural
                            language, and get accurate, context-aware responses
                            powered by advanced AI technology.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={index}
                                    className="group relative bg-white rounded-xl p-4 sm:p-5 border border-gray-400 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex-shrink-0 relative">
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-105 transition-transform">
                                                {step.number}
                                            </div>
                                        </div>

                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                    <Icon className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-0 sm:pl-10">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div className="absolute left-[27px] sm:left-[30px] top-[68px] sm:top-[76px] w-0.5 h-6 bg-gradient-to-b from-indigo-300 to-transparent"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
