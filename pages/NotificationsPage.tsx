
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Notification, UserData } from '../types';
import { Loader } from '../components/common';

interface NotificationsPageProps {
    userData: UserData;
    updateUserData: (updates: Partial<UserData>) => void;
    setHasNewNotification: (value: boolean) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ userData, updateUserData, setHasNewNotification }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        setHasNewNotification(false);
        try {
            const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const notifList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(notifList);
            
            const newTimestamp = serverTimestamp();
            const userRef = doc(db, "users", userData.uid);
            await updateDoc(userRef, { lastNotificationCheck: newTimestamp });
            // The parent state update will be slow, so we don't call updateUserData here.
            // The change is only reflected on next app load. This is a reasonable trade-off.

        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userData.uid, setHasNewNotification]);

    useEffect(() => {
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-4 space-y-4" style={{animation: 'fadeIn 0.5s'}}>
            <h2 className="text-xl font-bold text-center">Notifications</h2>
            <div className="space-y-3">
                {isLoading ? <Loader /> : notifications.length === 0 ? (
                    <p className="text-gray-500 text-center">No notifications available.</p>
                ) : (
                    notifications.map(msg => (
                        <div key={msg.id} className="card-bg p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold">{msg.title}</h3>
                                <p className="text-xs text-gray-400">{msg.createdAt?.toDate().toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm text-gray-600">{msg.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
