/**
 * Design Tokens for Figure Skating Planner
 * Centralized design system values
 */

export const DesignTokens = {
    // Color Palette
    colors: {
        // Primary Colors (Ice/Winter Theme)
        primary: {
            main: '#2196F3',
            dark: '#1976D2',
            light: '#64B5F6',
            gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        },
        secondary: {
            main: '#7C4DFF',
            dark: '#651FFF',
            light: '#9575CD',
            gradient: 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)',
        },
        accent: {
            main: '#00BCD4',
            dark: '#0097A7',
            light: '#4DD0E1',
            gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
        },

        // Session Type Colors
        sessions: {
            warmup: {
                main: '#FFF59D',
                dark: '#FFD54F',
                gradient: 'linear-gradient(135deg, #FFF59D 0%, #FFD54F 100%)',
            },
            performance: {
                main: '#81D4FA',
                dark: '#29B6F6',
                gradient: 'linear-gradient(135deg, #81D4FA 0%, #29B6F6 100%)',
            },
            break: {
                main: '#FFAB91',
                dark: '#FF7043',
                gradient: 'linear-gradient(135deg, #FFAB91 0%, #FF7043 100%)',
            },
            resurfacing: {
                main: '#A5D6A7',
                dark: '#66BB6A',
                gradient: 'linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)',
            },
        },

        // Neutral Colors
        neutral: {
            background: '#F5F7FA',
            surface: '#FFFFFF',
            surfaceGlass: 'rgba(255, 255, 255, 0.7)',
            border: '#E5E7EB',
            borderLight: '#F3F4F6',
        },

        // Text Colors
        text: {
            primary: '#1A1A1A',
            secondary: '#6B7280',
            disabled: '#9CA3AF',
            white: '#FFFFFF',
        },

        // Semantic Colors
        semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },
    },

    // Typography
    typography: {
        fontFamily: {
            primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        },
        fontSize: {
            h1: '2.5rem',      // 40px
            h2: '2rem',        // 32px
            h3: '1.5rem',      // 24px
            h4: '1.25rem',     // 20px
            body: '1rem',      // 16px
            small: '0.875rem', // 14px
            tiny: '0.75rem',   // 12px
        },
        fontWeight: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Spacing (4px base grid)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
    },

    // Border Radius
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
    },

    // Shadows (Layered depth)
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15), 0 8px 10px rgba(0, 0, 0, 0.05)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },

    // Transitions
    transitions: {
        fast: '150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        normal: '250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        slow: '400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    },

    // Z-Index
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
    },

    // Breakpoints
    breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px',
    },
} as const

export type DesignTokensType = typeof DesignTokens
