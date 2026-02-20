import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('hms_user');
        return saved ? JSON.parse(saved) : null;
    });

    const signup = (name, email, password) => {
        const users = JSON.parse(localStorage.getItem('hms_users') || '[]');
        if (users.find(u => u.email === email)) {
            throw new Error('Email already registered');
        }
        const newUser = { id: Date.now(), name, email, password, role: 'admin' };
        users.push(newUser);
        localStorage.setItem('hms_users', JSON.stringify(users));
        const { password: _, ...safeUser } = newUser;
        localStorage.setItem('hms_user', JSON.stringify(safeUser));
        setUser(safeUser);
    };

    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem('hms_users') || '[]');
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) throw new Error('Invalid email or password');
        const { password: _, ...safeUser } = found;
        localStorage.setItem('hms_user', JSON.stringify(safeUser));
        setUser(safeUser);
    };

    const logout = () => {
        localStorage.removeItem('hms_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
