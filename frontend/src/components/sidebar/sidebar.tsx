import { useState } from "react";
import { Menu, X, Home, Bot, Upload } from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentPage, setCurrentPage } = useNavigation();

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-6 left-6 z-50 p-2 rounded-lg bg-gray-800  text-white hover:bg-gray-700 transition-colors shadow-lg"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={22} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
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
                    w-64 bg-custom-dark 
                    text-white flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    z-40 shadow-2xl
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div>
                    <div className="flex items-center justify-center p-4 mt-12 sm:mt-5  ">
                        <h2
                            className="text-[22px] font-bold bg-clip-text text-transparent bg-white drop-shadow-lg tracking-wide"
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
                            <span className="text-[15px]">Home</span>
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
                            <Bot size={18} />
                            <span className="text-[15px]">Chat</span>
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
                            <span className="text-[15px]">
                                Upload Documents
                            </span>
                        </button>
                    </nav>

                    {/* bottom items  */}
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
