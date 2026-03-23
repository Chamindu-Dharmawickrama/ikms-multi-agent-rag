import { useNavigation } from "../../contexts/NavigationContext";
import Chat from "./features/chat/Chat";

import UploadDocuments from "./features/uploadDocuments/UploadDocuments";

const Dashboard = () => {
    const { currentPage } = useNavigation();

    const renderPage = () => {
        switch (currentPage) {
            case "chat":
                return <Chat />;
            case "upload":
                return <UploadDocuments />;
            default:
                return <Chat />;
        }
    };

    return (
        <div className="h-full bg-white px-2 sm:px-8 py-5 sm:py-4 border-3 border-gray-300 rounded-0 md:rounded-2xl overflow-hidden">
            {renderPage()}
        </div>
    );
};

export default Dashboard;
