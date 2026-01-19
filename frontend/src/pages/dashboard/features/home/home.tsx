import {
    MessageSquare,
    Upload,
    GitBranch,
    FileUp,
    Database,
    MessageCircle,
    Users,
    CheckCircle,
    ArrowRight,
} from "lucide-react";

const Home = () => {
    const features = [
        {
            icon: MessageSquare,
            title: "Multi-Turn Conversations",
            description: "Maintain context across multiple questions",
            gradient: "from-blue-500 to-blue-600",
        },
        {
            icon: Upload,
            title: "Document Upload",
            description: "Index PDFs for intelligent retrieval",
            gradient: "from-purple-500 to-purple-600",
        },
        {
            icon: GitBranch,
            title: "Multi-Agent Pipeline",
            description: "Retrieval, Summarization & Verification agents",
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
                "Start a conversation and ask questions in plain English. The system remembers context across multiple questions.",
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
            <div className="max-w-5xl text-left py-4 sm:py-8 px-4 sm:px-0">
                <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-bold bg-clip-text text-transparent bg-custom-dark mb-3 sm:mb-4">
                    Welcome to IKMS Multi-Agent RAG
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8 sm:mb-12">
                    Explore intelligent knowledge management with our advanced
                    multi-agent RAG system.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 sm:mb-16">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300"
                            >
                                <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* How It Works Section */}
                <div className="mt-12 sm:mt-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                        How It Works
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8 sm:mb-10 max-w-3xl">
                        IKMS is an intelligent conversational assistant that
                        helps you find answers from your documents. Simply
                        upload your PDF files, ask questions in natural
                        language, and get accurate, context-aware responses
                        powered by advanced AI technology.
                    </p>

                    {/* Steps */}
                    <div className="space-y-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === steps.length - 1;
                            return (
                                <div key={index} className="relative">
                                    <div className="flex items-start gap-4 sm:gap-6">
                                        {/* Number Badge */}
                                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                                            {step.number}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className="w-5 h-5 text-indigo-600" />
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    {!isLast && (
                                        <div className="flex justify-center my-4">
                                            <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                                        </div>
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
