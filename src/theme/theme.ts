import { createTheme, ThemeOptions } from '@mui/material/styles'
import { DesignTokens } from './DesignTokens'

const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: DesignTokens.colors.primary.main,
            dark: DesignTokens.colors.primary.dark,
            light: DesignTokens.colors.primary.light,
        },
        secondary: {
            main: DesignTokens.colors.secondary.main,
            dark: DesignTokens.colors.secondary.dark,
            light: DesignTokens.colors.secondary.light,
        },
        error: {
            main: DesignTokens.colors.semantic.error,
        },
        warning: {
            main: DesignTokens.colors.semantic.warning,
        },
        info: {
            main: DesignTokens.colors.semantic.info,
        },
        success: {
            main: DesignTokens.colors.semantic.success,
        },
        background: {
            default: DesignTokens.colors.neutral.background,
            paper: DesignTokens.colors.neutral.surface,
        },
        text: {
            primary: DesignTokens.colors.text.primary,
            secondary: DesignTokens.colors.text.secondary,
            disabled: DesignTokens.colors.text.disabled,
        },
    },
    typography: {
        fontFamily: DesignTokens.typography.fontFamily.primary,
        h1: {
            fontSize: DesignTokens.typography.fontSize.h1,
            fontWeight: DesignTokens.typography.fontWeight.semibold,
            lineHeight: DesignTokens.typography.lineHeight.tight,
        },
        h2: {
            fontSize: DesignTokens.typography.fontSize.h2,
            fontWeight: DesignTokens.typography.fontWeight.semibold,
            lineHeight: DesignTokens.typography.lineHeight.tight,
        },
        h3: {
            fontSize: DesignTokens.typography.fontSize.h3,
            fontWeight: DesignTokens.typography.fontWeight.semibold,
            lineHeight: DesignTokens.typography.lineHeight.normal,
        },
        h4: {
            fontSize: DesignTokens.typography.fontSize.h4,
            fontWeight: DesignTokens.typography.fontWeight.medium,
            lineHeight: DesignTokens.typography.lineHeight.normal,
        },
        body1: {
            fontSize: DesignTokens.typography.fontSize.body,
            fontWeight: DesignTokens.typography.fontWeight.regular,
            lineHeight: DesignTokens.typography.lineHeight.normal,
        },
        body2: {
            fontSize: DesignTokens.typography.fontSize.small,
            fontWeight: DesignTokens.typography.fontWeight.regular,
            lineHeight: DesignTokens.typography.lineHeight.normal,
        },
        caption: {
            fontSize: DesignTokens.typography.fontSize.tiny,
            fontWeight: DesignTokens.typography.fontWeight.regular,
            lineHeight: DesignTokens.typography.lineHeight.normal,
        },
    },
    shape: {
        borderRadius: parseInt(DesignTokens.borderRadius.md),
    },
    shadows: [
        'none',
        DesignTokens.shadows.sm,
        DesignTokens.shadows.sm,
        DesignTokens.shadows.md,
        DesignTokens.shadows.md,
        DesignTokens.shadows.md,
        DesignTokens.shadows.lg,
        DesignTokens.shadows.lg,
        DesignTokens.shadows.lg,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
        DesignTokens.shadows.xl,
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: DesignTokens.borderRadius.md,
                    textTransform: 'none',
                    fontWeight: DesignTokens.typography.fontWeight.medium,
                    padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.lg}`,
                    transition: DesignTokens.transitions.normal,
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: DesignTokens.shadows.lg,
                    },
                },
                contained: {
                    background: DesignTokens.colors.primary.gradient,
                    '&:hover': {
                        background: DesignTokens.colors.primary.gradient,
                        filter: 'brightness(1.1)',
                    },
                },
                containedSecondary: {
                    background: DesignTokens.colors.secondary.gradient,
                    '&:hover': {
                        background: DesignTokens.colors.secondary.gradient,
                        filter: 'brightness(1.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: DesignTokens.borderRadius.lg,
                    transition: DesignTokens.transitions.normal,
                },
                elevation1: {
                    boxShadow: DesignTokens.shadows.md,
                },
                elevation2: {
                    boxShadow: DesignTokens.shadows.lg,
                },
                elevation3: {
                    boxShadow: DesignTokens.shadows.xl,
                },
            },
            variants: [
                {
                    props: { variant: 'glass' } as any,
                    style: {
                        background: DesignTokens.colors.neutral.surfaceGlass,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid rgba(255, 255, 255, 0.18)`,
                        boxShadow: DesignTokens.shadows.glass,
                    },
                },
            ],
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: DesignTokens.borderRadius.lg,
                    boxShadow: DesignTokens.shadows.md,
                    transition: DesignTokens.transitions.normal,
                    '&:hover': {
                        boxShadow: DesignTokens.shadows.lg,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: DesignTokens.borderRadius.md,
                        transition: DesignTokens.transitions.normal,
                        '&:hover': {
                            boxShadow: `0 0 0 4px rgba(33, 150, 243, 0.1)`,
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 4px rgba(33, 150, 243, 0.15)`,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: DesignTokens.borderRadius.md,
                    fontWeight: DesignTokens.typography.fontWeight.medium,
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    borderRadius: DesignTokens.borderRadius.lg,
                },
                indicator: {
                    height: 3,
                    borderRadius: DesignTokens.borderRadius.full,
                    background: DesignTokens.colors.primary.gradient,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: DesignTokens.typography.fontWeight.medium,
                    fontSize: DesignTokens.typography.fontSize.body,
                    transition: DesignTokens.transitions.normal,
                    '&:hover': {
                        background: 'rgba(33, 150, 243, 0.05)',
                    },
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    borderRadius: DesignTokens.borderRadius.lg,
                    '&:before': {
                        display: 'none',
                    },
                    '&.Mui-expanded': {
                        margin: `${DesignTokens.spacing.sm} 0`,
                    },
                },
            },
        },
    },
}

export const theme = createTheme(themeOptions)
