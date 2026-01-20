import { useEffect, useState } from "react";
import {
    Menu,
    X,
    Home,
    Bot,
    Upload,
    MessageSquare,
    Trash2,
} from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
    getAllConversations,
    deleteConversation,
    setCurrentSession,
    clearMessages,
    getConversationHistory,
} from "../../store/chat/chatSlice";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentPage, setCurrentPage } = useNavigation();
    const dispatch = useDispatch<AppDispatch>();

    const { conversations, loadingConversations, currentSessionId } =
        useSelector((state: RootState) => state.chat);

    useEffect(() => {
        if (currentPage === "chat") {
            dispatch(getAllConversations());
        }
    }, [currentPage, dispatch]);

    const handleConversationClick = (sessionId: string) => {
        setCurrentPage("chat");

        dispatch(clearMessages());

        dispatch(setCurrentSession(sessionId));
        // load the history -- > message state
        dispatch(getConversationHistory(sessionId));

        setIsOpen(false);
    };

    const handleDeleteConversation = (
        e: React.MouseEvent,
        sessionId: string,
    ) => {
        e.stopPropagation();
        if (
            window.confirm("Are you sure you want to delete this conversation?")
        ) {
            dispatch(deleteConversation(sessionId));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleDateString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (diffInHours < 48) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    const ConversationsLoading = () => {
        return (
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="p-3 rounded-lg bg-gray-800 border border-gray-700 animate-pulse"
                    >
                        <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3.5 h-3.5 bg-gray-700 rounded shrink-0" />
                                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="h-3 bg-gray-700 rounded w-20" />
                                    <span className="text-gray-600">•</span>
                                    <div className="h-3 bg-gray-700 rounded w-24" />
                                </div>
                            </div>

                            <div className="w-8 h-8 bg-gray-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-6 left-6 z-50 p-2 rounded-lg bg-gray-800  text-white hover:bg-gray-700 transition-colors shadow-lg"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={22} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 "
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static top-0 left-0 h-screen
                    w-74 bg-custom-dark 
                    text-white flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    z-40 shadow-2xl
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div>
                    <div className="flex items-center justify-center p-4 mt-12 md:mt-5  ">
                        <h2
                            className="text-[23px] font-bold bg-clip-text text-transparent bg-white drop-shadow-lg tracking-wide"
                            style={{
                                fontFamily:
                                    "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
                            }}
                        >
                            ASK YOUR{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                                DOCS
                            </span>
                        </h2>
                    </div>

                    {/* Navigations */}
                    <nav className="flex flex-col mt-10 space-y-4 px-4">
                        <button
                            className={`text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 cursor-pointer ${
                                currentPage === "home"
                                    ? "bg-gray-700"
                                    : "hover:bg-gray-700"
                            }`}
                            onClick={() => {
                                setCurrentPage("home");
                                setIsOpen(false);
                            }}
                        >
                            <Home size={18} />
                            <span className="text-[16px]">Home</span>
                        </button>
                        <button
                            className={`text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 cursor-pointer ${
                                currentPage === "chat"
                                    ? "bg-gray-700"
                                    : "hover:bg-gray-700"
                            }`}
                            onClick={() => {
                                setCurrentPage("chat");
                                setIsOpen(false);
                            }}
                        >
                            <Bot size={19} />
                            <span className="text-[16px]">Chat</span>
                        </button>
                        <button
                            className={`text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 cursor-pointer ${
                                currentPage === "upload"
                                    ? "bg-gray-700"
                                    : "hover:bg-gray-700"
                            }`}
                            onClick={() => {
                                setCurrentPage("upload");
                                setIsOpen(false);
                            }}
                        >
                            <Upload size={18} />
                            <span className="text-[16px]">
                                Upload Documents
                            </span>
                        </button>
                    </nav>

                    {currentPage === "chat" && (
                        <div className="flex-1 overflow-hidden flex flex-col mt-6 pl-4 pr pb-4 min-h-0">
                            <div className="flex items-center justify-between mb-3 shrink-0">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                                    Recent Conversations
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar min-h-0">
                                {loadingConversations ? (
                                    <ConversationsLoading />
                                ) : conversations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No conversations yet</p>
                                    </div>
                                ) : (
                                    conversations.map((conversation) => (
                                        <div
                                            key={conversation.session_id}
                                            onClick={() =>
                                                handleConversationClick(
                                                    conversation.session_id,
                                                )
                                            }
                                            className={`group relative p-3.5 rounded-lg cursor-pointer transition-all ${
                                                currentSessionId ===
                                                conversation.session_id
                                                    ? "bg-gray-700 border border-gray-600"
                                                    : "bg-gray-800 hover:bg-gray-700 border border-transparent"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <p className="text-[14px] font-medium text-white truncate">
                                                            {
                                                                conversation.filename
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[13px] text-gray-400">
                                                        <span>
                                                            {
                                                                conversation.message_count
                                                            }{" "}
                                                            messages
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {formatDate(
                                                                conversation.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) =>
                                                        handleDeleteConversation(
                                                            e,
                                                            conversation.session_id,
                                                        )
                                                    }
                                                    className=" group-hover:opacity-100 p-1.5 hover:bg-red-600/20 rounded transition-all"
                                                    aria-label="Delete conversation"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-0 w-full mb-6 px-6">
                        <a
                            href="#"
                            className="text-sm mb-4 block hover:text-gray-300 transition-colors"
                        >
                            FAQ
                        </a>
                        <div className="border-t text-gray-400 border-gray-700 pt-4">
                            Free Plan
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
