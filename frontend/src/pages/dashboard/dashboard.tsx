import { useNavigation } from "../../contexts/NavigationContext";
import Chat from "./features/chat/Chat";
import Home from "./features/home/home";

import UploadDocuments from "./features/uploadDocuments/UploadDocuments";

const Dashboard = () => {
    const { currentPage } = useNavigation();

    const renderPage = () => {
        switch (currentPage) {
            case "home":
                return <Home />;
            case "chat":
                return <Chat />;
            case "upload":
                return <UploadDocuments />;
            default:
                return <Home />;
        }
    };

    return (
        <div className="h-full bg-white px-8 py-4 border-3 border-gray-300 rounded-2xl overflow-hidden">
            {renderPage()}
        </div>
    );
};

export default Dashboard;
