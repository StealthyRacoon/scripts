'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme, ThemeConfig } from 'antd';

type ThemeName = 'light' | 'dark';

type ThemeCtx = {
    theme: ThemeName;
    setTheme: (t: ThemeName) => void;
};

/**
 * Centralized design tokens for the app.
 * Adjust these once and they will cascade through AntD components.
 * You can add more token keys as needed (e.g., colorSuccess, colorWarning, fontSize, etc.).
 */
const THEME_TOKENS: Record<ThemeName, ThemeConfig> = {
    light: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#1677ff',      // AntD default blue (kept for familiarity)
            colorBgBase: '#ffffff',
            colorTextBase: '#1f1f1f',
            colorBorder: '#d9d9d9',
            colorBgContainer: '#ffffff',
            borderRadius: 8,
        },
    },
    dark: {
        algorithm: antdTheme.darkAlgorithm,
        token: {
            colorPrimary: '#3b82f6',      // Slightly softer primary for dark UI
            colorBgBase: '#0b0b0c',
            colorTextBase: '#e6e6e6',
            colorBorder: '#2a2a2a',
            colorBgContainer: '#141414',
            borderRadius: 8,
        },
    },
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeName>('light');

    // Load persisted preference on mount
    useEffect(() => {
        const stored = (window.localStorage.getItem('theme') as ThemeName | null) ?? 'light';
        setTheme(stored);
        document.documentElement.dataset.theme = stored;
    }, []);

    // Persist + reflect changes
    useEffect(() => {
        window.localStorage.setItem('theme', theme);
        document.documentElement.dataset.theme = theme;
    }, [theme]);


    useEffect(() => {
        const root = document.documentElement;
        const t = THEME_TOKENS[theme].token!;
        root.style.setProperty('--color-primary', t.colorPrimary!);
        root.style.setProperty('--color-text-base', t.colorTextBase!);
        root.style.setProperty('--color-bg-base', t.colorBgBase!);
        root.style.setProperty('--color-border', t.colorBorder!);
    }, [theme]);

    const config = THEME_TOKENS[theme];

    const ctx = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeContext.Provider value={ctx}>
            <ConfigProvider theme={config}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
