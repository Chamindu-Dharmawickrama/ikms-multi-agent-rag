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
    LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import type { CredentialResponse } from "@react-oauth/google";
import ImageSlideShow from "../../components/home/imageSlideShow";
import GoogleSignInModal from "../../components/auth/GoogleSignInModal";
import { googleAuth } from "../../store/auth/authSlice";
import type { AppDispatch, RootState } from "../../store/store";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, loading, error } = useSelector(
        (state: RootState) => state.auth,
    );
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { toasts, removeToast, toast } = useToast();

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse,
    ) => {
        if (credentialResponse.credential) {
            try {
                const result = await dispatch(
                    googleAuth(credentialResponse.credential),
                ).unwrap();
                setShowLoginModal(false);
                toast.success(
                    `Welcome back, ${result.user.name || result.user.email}!`,
                );
                navigate("/chat");
            } catch (error: any) {
                console.error("Authentication failed:", error);
                toast.error(
                    error || "Authentication failed. Please try again.",
                );
            }
        }
    };

    const handleGoogleError = () => {
        console.error("Google Sign-In failed");
    };

    const handleLoginClick = () => {
        if (isAuthenticated) {
            navigate("/chat");
        } else {
            setShowLoginModal(true);
        }
    };

    const handleGetStartedClick = () => {
        if (isAuthenticated) {
            navigate("/chat");
        } else {
            setShowLoginModal(true);
        }
    };

    const features = [
        {
            icon: MessageSquare,
            title: "Multi-Turn Chat",
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
        <div className="min-h-screen bg-custom-dark">
            <div className="h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-8 relative">
                {/* Login Button */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-12 xl:right-16 z-10">
                    {isAuthenticated && user ? (
                        <button
                            onClick={() => navigate("/chat")}
                            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-600 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name || "User"}
                                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white"
                                />
                            ) : (
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold border-2 border-white">
                                    {user.name?.charAt(0).toUpperCase() ||
                                        user.email.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="hidden sm:inline">
                                {user.name?.split(" ")[0] || "Dashboard"}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="group px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-600 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
                        >
                            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="">Login</span>
                        </button>
                    )}
                </div>

                <div className="h-full flex flex-col lg:flex-row gap-6 pt-16 sm:pt-20 pb-8 sm:pb-13">
                    {/* Left side */}
                    <div className="w-full lg:w-3/5 space-y-6 sm:space-y-8 lg:space-y-10 flex flex-col justify-center lg:pr-6 xl:pr-8">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-start mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl  font-semibold text-white leading-tight">
                                Welcome to{" "}
                                <span className="text-[30px] sm:text-[35px] md:text-[40px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                                    ASK YOUR DOCS
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-white/95 leading-relaxed max-w-3xl">
                                Unlock the power of intelligent knowledge
                                management with our advanced multi-agent RAG
                                system. Transform your documents into actionable
                                insights.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group relative bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-5  hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-22 sm:h-22 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative">
                                            <div
                                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                                            >
                                                <Icon className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <h3 className="text-base sm:text-lg lg:text-[18px] font-bold text-gray-800 mb-1.5 sm:mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm lg:text-[15px] text-gray-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col xs:flex-row sm:flex-row items-stretch xs:items-center sm:items-center pt-2">
                            <button
                                className=" group w-full xs:w-auto sm:w-auto px-7 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-br from-blue-600 to-indigo-900 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-[18px] shadow-xl shadow-white/10"
                                onClick={handleGetStartedClick}
                            >
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Ask Now</span>
                            </button>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="w-full lg:w-2/5 flex items-center justify-center mt-4 lg:mt-0 pl-0 md:pl-5">
                        <div className="w-full max-w-md lg:max-w-none">
                            <ImageSlideShow />
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-8 sm:mt-12 lg:mt-16 px-2 sm:px-0">
                    <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-900 shadow-xl mb-3 sm:mb-4">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white py-2">
                            How It Works
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0 pb-2">
                            IKMS is an intelligent conversational assistant that
                            helps you find answers from your documents. Simply
                            upload your PDF files, ask questions in natural
                            language, and get accurate, context-aware responses
                            powered by advanced AI technology.
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={index}
                                    className="group relative bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 hover:border-indigo-400 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-200 to-blue-50 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative flex items-start gap-3 sm:gap-4">
                                        <div className="flex-shrink-0 relative">
                                            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {step.number}
                                            </div>

                                            {index < steps.length - 1 && (
                                                <div className="absolute left-1/2 transform -translate-x-1/2 top-[42px] sm:top-[46px] lg:top-[50px] w-1 h-5 sm:h-6 bg-gradient-to-b from-indigo-400 via-indigo-300 to-transparent"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 pt-0 sm:pt-0.5">
                                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-indigo-200 group-hover:to-blue-100 transition-all duration-300 shadow-sm">
                                                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-indigo-700" />
                                                </div>
                                                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 group-hover:text-indigo-900 transition-colors">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed pl-0">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Google Sign-In Modal */}
            <GoogleSignInModal
                isOpen={showLoginModal}
                isLoading={loading}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
            />

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Error Display
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom">
                    {error}
                </div>
            )} */}
        </div>
    );
};

export default Home;
