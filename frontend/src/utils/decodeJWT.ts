export const safeDecodeJwt = (token?: string | null) => {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
}