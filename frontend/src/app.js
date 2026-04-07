const { useState, useEffect } = React;
const e = React.createElement;

import { Sidebar } from './components/layout/Sidebar.js';
import { TopBar } from './components/layout/TopBar.js';
import { AlertModal } from './components/common/AlertModal.js';
import { HomeView } from './components/views/HomeView.js';
import { SettingsView } from './components/views/SettingsView.js';
import { UserInfoView } from './components/views/UserInfoView.js';
import { Login } from './components/Login.js';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState('all'); 
    const [alert, setAlert] = useState(null);
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [appLoading, setAppLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const s = await window.pywebview.api.get_settings();
                setSettings(s);
                document.body.className = `theme-dark`;
            } finally {
                setAppLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            window.pywebview.api.get_user_info().then(setUser);
        }
    }, [isLoggedIn]);

    // Auto-lock & Activity Tracker
    useEffect(() => {
        if (!isLoggedIn || !settings?.autoLockTimer) return;
        
        let timer;
        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                window.pywebview.api.lock_all_folders();
                setAlert({ type: 'warning', title: 'Auto-Locked', text: 'Folders have been locked due to inactivity.' });
            }, settings.autoLockTimer * 60 * 1000);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && settings?.lockOnSleep) {
                window.pywebview.api.lock_all_folders();
            }
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(timer);
        };
    }, [isLoggedIn, settings]);

    const handleLogout = async () => {
        await window.pywebview.api.logout();
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView('all');
    };

    if (appLoading) {
        return e('div', { className: 'loading-container' },
            e('div', { className: 'spinner' }),
            e('div', { className: 'loading-text' }, 'Securing your vault...')
        );
    }

    if (!isLoggedIn) {
        return e(Login, { onLogin: () => setIsLoggedIn(true) });
    }

    const renderContent = () => {
        switch (currentView) {
            case 'settings': return e(SettingsView, { 
                onSettingsUpdate: (newS) => {
                    setSettings(newS);
                    document.body.className = `theme-dark`;
                }
            });
            case 'profile': return e(UserInfoView, { showAlert: setAlert });
            default: return e(HomeView, { showAlert: setAlert, filter: currentView, searchQuery, settings });
        }
    };

    return e('div', { style: { display: 'flex', height: '100vh', width: '100vw' } },
        e(Sidebar, { 
            currentView, 
            onViewChange: setCurrentView, 
            user,
            onLogout: handleLogout
        }),
        
        e('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' } },
            e(TopBar, { 
                onSearch: setSearchQuery,
                onSettings: () => setCurrentView('settings'),
                onProfile: () => setCurrentView('profile')
            }),
            e('div', { style: { flex: 1, overflow: 'auto' } }, renderContent())
        ),

        e(AlertModal, { alert, onClose: () => setAlert(null) })
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
