import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type PageType = "home" | "chat" | "upload";

interface NavigationContextType {
    currentPage: PageType;
    setCurrentPage: (page: PageType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
    undefined,
);

const STORAGE_KEY = "ask-your-docs-current-page";

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [currentPage, setCurrentPage] = useState<PageType>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return (saved as PageType) || "home";
    });

    // Persist to localStorage whenever currentPage changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, currentPage);
    }, [currentPage]);

    return (
        <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = (): NavigationContextType => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error(
            "useNavigation must be used within a NavigationProvider",
        );
    }
    return context;
};
