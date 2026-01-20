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

const Home = () => {
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Hero Section */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-5">
                        Welcome to IKMS Multi-Agent RAG
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        Unlock the power of intelligent knowledge management
                        with our advanced multi-agent RAG system. Transform your
                        documents into actionable insights.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 sm:mb-20">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* How It Works Section */}
                <div className="mt-16 sm:mt-20">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                            How It Works
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            IKMS is an intelligent conversational assistant that
                            helps you find answers from your documents. Simply
                            upload your PDF files, ask questions in natural
                            language, and get accurate, context-aware responses
                            powered by advanced AI technology.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={index}
                                    className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-gray-400 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-start gap-5 sm:gap-6">
                                        {/* Number Badge */}
                                        <div className="flex-shrink-0 relative">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-105 transition-transform">
                                                {step.number}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                    <Icon className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed pl-0 sm:pl-13">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-[35px] sm:left-[39px] top-[88px] sm:top-[100px] w-0.5 h-8 bg-gradient-to-b from-indigo-300 to-transparent"></div>
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
