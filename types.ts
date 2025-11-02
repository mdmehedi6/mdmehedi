
import { Timestamp } from 'firebase/firestore';

export interface UserData {
    uid: string;
    name: string;
    email: string;
    balance: number;
    referralCode: string;
    referredBy: string | null;
    lastNotificationCheck: Timestamp;
    createdAt: Timestamp;
    dailyAdCount: number;
    lastAdWatchDate: string;
    isBlocked: boolean;
}

export interface AppConfig {
    minWithdrawal: number;
    paymentMethods: string[];
    dailyAdLimit: number;
    coinValueCoins: number;
    coinValueInr: number;
}

export interface WithdrawalRequest {
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    method: string;
    paymentDetail: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Timestamp;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: Timestamp;
}

export type Page = 'home-page' | 'wallet-page' | 'refer-page' | 'rules-page' | 'profile-page' | 'notifications-page';

// Extend the Window interface for the third-party ad SDK
declare global {
    interface Window {
        show_9832391: (type?: any) => Promise<void>;
    }
}
