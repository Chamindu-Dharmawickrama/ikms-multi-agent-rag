import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppLayout from "./layouts/AppLayout.tsx";
import { NavigationProvider } from "./contexts/NavigationContext.tsx";
import Login from "./pages/login/login.tsx";
import Home from "./pages/home/home.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import { rehydrateAuth } from "./store/auth/authSlice.ts";
import type { AppDispatch } from "./store/store.ts";

function App() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(rehydrateAuth());
    }, [dispatch]);

    return (
        <NavigationProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
            </Routes>
        </NavigationProvider>
    );
}

export default App;
