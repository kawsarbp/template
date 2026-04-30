import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/context/theme-context';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import 'viewerjs/dist/viewer.css';
import '../css/app.css';
import { Toaster } from './components/ui/sonner';
import './styles/theme.css';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <ThemeProvider
                    defaultTheme="light"
                    storageKey="dashboard-theme"
                >
                    <App {...props} />
                    <Toaster />
                </ThemeProvider>
            </LanguageProvider>,
        );
    },
    progress: {
        color: '#ef4444',
    },
});
