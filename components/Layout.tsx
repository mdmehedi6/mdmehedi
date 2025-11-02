
import React, { useState, useCallback, Suspense, lazy } from 'react';
import type { User } from 'firebase/auth';
import type { UserData, AppConfig, Page } from '../types';
import { HomeIcon, WalletIcon, UsersIcon, BookIcon, UserIcon, BellIcon } from './Icons';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Loader } from './common';

const HomePage = lazy(() => import('../pages/HomePage'));
const WalletPage = lazy(() => import('../pages/WalletPage'));
const ReferPage = lazy(() => import('../pages/ReferPage'));
const RulesPage = lazy(() => import('../pages/RulesPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));


interface LayoutProps {
    user: User;
    userData: UserData;
    appConfig: AppConfig;
    setAlertMessage: (message: string) => void;
    updateUserData: (updates: Partial<UserData>) => void;
    hasNewNotification: boolean;
    setHasNewNotification: (value: boolean) => void;
}

const Header: React.FC<{ onNavigate: (page: Page) => void; hasNewNotification: boolean }> = ({ onNavigate, hasNewNotification }) => (
    <header className="flex items-center justify-between p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 dark-bg">
        <h1 className="text-xl font-bold">𝓣𝓪𝓰2𝓒𝓪𝓼𝓱</h1>
        <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer" onClick={() => onNavigate('notifications-page')}>
                <BellIcon className="w-6 h-6" />
                {hasNewNotification && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
            </div>
            <UserIcon className="w-6 h-6 cursor-pointer" onClick={() => onNavigate('profile-page')} />
        </div>
    </header>
);

const BottomNav: React.FC<{ activePage: Page; onNavigate: (page: Page) => void }> = ({ activePage, onNavigate }) => {
    const navItems = [
        { id: 'home-page', icon: HomeIcon, label: 'Home' },
        { id: 'wallet-page', icon: WalletIcon, label: 'Wallet' },
        { id: 'refer-page', icon: UsersIcon, label: 'Refer & Earn' },
        { id: 'rules-page', icon: BookIcon, label: 'Rules' },
        { id: 'profile-page', icon: UserIcon, label: 'Profile' }
    ] as const;

    return (
        <nav className="bottom-nav sticky bottom-0 grid grid-cols-5 items-center text-center py-2 card-bg z-10">
            {navItems.map(item => (
                <a
                    key={item.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                    className={`nav-link text-gray-500 ${activePage === item.id ? 'active text-accent font-bold' : ''}`}
                >
                    <item.icon className="mx-auto w-6 h-6" />
                    <span className="text-xs">{item.label}</span>
                </a>
            ))}
        </nav>
    );
};


const Layout: React.FC<LayoutProps> = ({ user, userData, appConfig, setAlertMessage, updateUserData, hasNewNotification, setHasNewNotification }) => {
    const [activePage, setActivePage] = useState<Page>('home-page');

    const handleNavigate = useCallback((page: Page) => {
        setActivePage(page);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const renderPage = () => {
        const pageProps = { userData, appConfig, setAlertMessage, updateUserData };
        switch (activePage) {
            case 'home-page':
                return <HomePage {...pageProps} />;
            case 'wallet-page':
                return <WalletPage {...pageProps} />;
            case 'refer-page':
                return <ReferPage {...pageProps} />;
            case 'rules-page':
                return <RulesPage />;
            case 'profile-page':
                 return <ProfilePage user={user} userData={userData} onLogout={handleLogout} />;
            case 'notifications-page':
                return <NotificationsPage userData={userData} updateUserData={updateUserData} setHasNewNotification={setHasNewNotification} />;
            default:
                return <HomePage {...pageProps} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col main-page active">
            <Header onNavigate={handleNavigate} hasNewNotification={hasNewNotification} />
            <main className="flex-grow">
                <Suspense fallback={<div className="p-10"><Loader /></div>}>
                    {renderPage()}
                </Suspense>
            </main>
            <BottomNav activePage={activePage} onNavigate={handleNavigate} />
        </div>
    );
};

export default Layout;
