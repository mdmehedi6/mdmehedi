
import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import type { UserData, AppConfig, Page } from './types';

import { Loader, CustomAlert } from './components/common';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [hasNewNotification, setHasNewNotification] = useState(false);

    const fetchAppConfig = useCallback(async () => {
        const configRef = doc(db, "config", "main");
        try {
            const configSnap = await getDoc(configRef);
            const configData = configSnap.exists() 
                ? configSnap.data() as AppConfig
                : { minWithdrawal: 5000, paymentMethods: ["UPI", "Paytm"], dailyAdLimit: 10, coinValueCoins: 1000, coinValueInr: 10 };
            setAppConfig(configData);
        } catch (error) {
            console.error("Error fetching app config:", error);
            setAlertMessage("Failed to load app settings.");
        }
    }, []);
    
    const checkNewNotifications = useCallback(async (currentData: UserData) => {
        if (!currentData.lastNotificationCheck) return;
        const q = query(collection(db, "notifications"), where("createdAt", ">", currentData.lastNotificationCheck), limit(1));
        const querySnapshot = await getDocs(q);
        setHasNewNotification(!querySnapshot.empty);
    }, []);

    const fetchUserData = useCallback(async (currentUser: User) => {
        const userRef = doc(db, "users", currentUser.uid);
        try {
            const userSnap = await getDoc(userRef);
            let currentData: UserData;
            if (userSnap.exists()) {
                currentData = userSnap.data() as UserData;
            } else {
                const ownReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const defaultUserData = {
                    uid: currentUser.uid, name: currentUser.displayName || currentUser.email!.split('@')[0], email: currentUser.email!,
                    balance: 50, referralCode: ownReferralCode, referredBy: null,
                    lastNotificationCheck: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    dailyAdCount: 0, lastAdWatchDate: new Date().toISOString().split('T')[0], isBlocked: false
                };
                await setDoc(userRef, defaultUserData);
                // We need to refetch to get the server timestamp correctly
                const newUserSnap = await getDoc(userRef);
                currentData = newUserSnap.data() as UserData;
            }

            if (currentData.isBlocked) {
                setAlertMessage("Your account has been blocked.");
                await signOut(auth);
                return;
            }
            
            setUserData(currentData);
            await checkNewNotifications(currentData);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setAlertMessage("Error loading your profile.");
        }
    }, [checkNewNotifications]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsLoading(true);
            if (user) {
                setUser(user);
                await fetchAppConfig();
                await fetchUserData(user);
            } else {
                setUser(null);
                setUserData(null);
                setAppConfig(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [fetchUserData, fetchAppConfig]);

    const handleUpdateUserData = useCallback((updates: Partial<UserData>) => {
        if (!userData) return;
        const newUserData = { ...userData, ...updates };
        setUserData(newUserData);
        // Persist to firestore
        const userRef = doc(db, "users", userData.uid);
        updateDoc(userRef, updates).catch(err => {
            console.error("Failed to update user data in Firestore:", err);
            setAlertMessage("Failed to save your progress. Please check your connection.");
            // Optionally revert state
            setUserData(userData);
        });
    }, [userData]);


    if (isLoading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="antialiased">
            {alertMessage && <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />}
            {authLoading && <Loader fullScreen />}
            
            {!user || !userData || !appConfig ? (
                <AuthPage
                    setAlertMessage={setAlertMessage}
                    setAuthLoading={setAuthLoading}
                />
            ) : (
                <Layout
                    user={user}
                    userData={userData}
                    appConfig={appConfig}
                    setAlertMessage={setAlertMessage}
                    updateUserData={handleUpdateUserData}
                    hasNewNotification={hasNewNotification}
                    setHasNewNotification={setHasNewNotification}
                />
            )}
        </div>
    );
};

export default App;
