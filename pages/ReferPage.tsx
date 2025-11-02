
import React, { useState } from 'react';
import type { UserData, AppConfig } from '../types';
import { CopyIcon } from '../components/Icons';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, runTransaction } from 'firebase/firestore';

interface ReferPageProps {
    userData: UserData;
    appConfig: AppConfig;
    setAlertMessage: (message: string) => void;
    updateUserData: (updates: Partial<UserData>) => void;
}

const ReferPage: React.FC<ReferPageProps> = ({ userData, setAlertMessage, updateUserData }) => {
    const [enteredCode, setEnteredCode] = useState('');

    const copyCode = () => {
        navigator.clipboard.writeText(userData.referralCode);
        setAlertMessage("Referral code copied!");
    };

    const shareCode = () => {
        const text = `Join Tag2Cash and earn money! Use my referral code to get a bonus: ${userData.referralCode}`;
        if (navigator.share) {
            navigator.share({ title: 'Join Tag2Cash!', text: text, url: window.location.href })
                .catch((error) => console.error("Share failed:", error));
        } else {
            copyCode();
        }
    };

    const applyCode = async () => {
        if (userData.referredBy) {
            return setAlertMessage("You have already used a referral code.");
        }
        const code = enteredCode.trim().toUpperCase();
        if (!code) {
            return setAlertMessage("Please enter a code.");
        }
        if (code === userData.referralCode) {
            return setAlertMessage("You cannot use your own code.");
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("referralCode", "==", code));

        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return setAlertMessage("Invalid referral code.");
            }
            
            const referrerDoc = querySnapshot.docs[0];
            const referrerId = referrerDoc.id;
            const currentUserRef = doc(db, "users", userData.uid);
            const referrerRef = doc(db, "users", referrerId);

            await runTransaction(db, async (transaction) => {
                const referrerSnap = await transaction.get(referrerRef);
                if (!referrerSnap.exists()) {
                    throw "Referrer not found.";
                }
                const referrerData = referrerSnap.data();
                const newReferrerBalance = (referrerData.balance || 0) + 1000;
                transaction.update(referrerRef, { balance: newReferrerBalance });
                
                transaction.update(currentUserRef, {
                    balance: userData.balance + 1000,
                    referredBy: code
                });
            });

            updateUserData({
                balance: userData.balance + 1000,
                referredBy: code
            });

            setAlertMessage("Code applied! You both received 1000 coins.");
            setEnteredCode('');
        } catch (error) {
            console.error("Error applying code:", error);
            setAlertMessage("Failed to apply code. Please try again.");
        }
    };

    return (
        <div className="p-4 space-y-6" style={{animation: 'fadeIn 0.5s'}}>
            <h2 className="text-xl font-bold text-center">Refer & Earn</h2>
            <div className="card-bg p-6 rounded-lg text-center">
                <p className="text-gray-500 mb-2">Your Referral Code</p>
                <div className="bg-orange-100 p-3 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold tracking-widest text-orange-600">{userData.referralCode}</span>
                    <button onClick={copyCode} className="ml-4 text-gray-500"><CopyIcon /></button>
                </div>
                <p className="text-sm text-gray-400">Share this code with your friends.</p>
            </div>
            <button onClick={shareCode} className="w-full p-3 rounded-lg btn-accent">Share Your Code</button>
            <div className="card-bg p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-3 text-center">Have a Referral Code?</h3>
                <input value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} type="text" placeholder="Enter code here" className="w-full p-3 rounded-lg input-field mb-3" />
                <button onClick={applyCode} className="w-full p-3 rounded-lg btn-outline-accent">Apply Code</button>
            </div>
        </div>
    );
};

export default ReferPage;
