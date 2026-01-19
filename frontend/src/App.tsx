import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.tsx";
import { NavigationProvider } from "./contexts/NavigationContext.tsx";

function App() {
    return (
        <NavigationProvider>
            <Routes>
                <Route path="/" element={<AppLayout />} />
            </Routes>
        </NavigationProvider>
    );
}

export default App;
