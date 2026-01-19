import Sidebar from "../components/sidebar/sidebar";
import Dashboard from "../pages/dashboard/dashboard";

const AppLayout = () => {
    return (
        <div className="flex h-screen bg-custom-dark overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-hidden sm:p-6 p-4 ">
                <Dashboard />
            </main>
        </div>
    );
};

export default AppLayout;
