
import React, { useMemo } from 'react';
import type { UserData, AppConfig } from '../types';

interface HomePageProps {
    userData: UserData;
    appConfig: AppConfig;
    setAlertMessage: (message: string) => void;
    updateUserData: (updates: Partial<UserData>) => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, appConfig, setAlertMessage, updateUserData }) => {

    const adsLeftCount = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const currentAdCount = userData.lastAdWatchDate === today ? userData.dailyAdCount : 0;
        return Math.max(0, appConfig.dailyAdLimit - currentAdCount);
    }, [userData, appConfig]);
    
    const claimReward = async (taskType: string) => {
        const today = new Date().toISOString().split('T')[0];
        let currentData = { ...userData };

        if (currentData.lastAdWatchDate !== today) {
            currentData.lastAdWatchDate = today;
            currentData.dailyAdCount = 0;
            updateUserData({ lastAdWatchDate: today, dailyAdCount: 0 });
        }

        if (currentData.dailyAdCount >= appConfig.dailyAdLimit) {
            return setAlertMessage("You have reached your ad limit for today.");
        }

        if (typeof window.show_9832391 !== 'function') {
            return setAlertMessage("Ad service is not available. Please try again later.");
        }
        
        try {
            await window.show_9832391(); // Assuming all buttons trigger the same ad type for now

            const newCount = currentData.dailyAdCount + 1;
            let rewardAmount = taskType === 'miniApp' ? 50 : 50; // Simplified reward logic
            
            const newBalance = currentData.balance + rewardAmount;
            
            updateUserData({
                dailyAdCount: newCount,
                balance: newBalance,
            });

            if (rewardAmount > 0) {
                setAlertMessage(`Congratulations! You have earned ${rewardAmount} coins.`);
            }

        } catch (e) {
            console.error("Ad error:", e);
            setAlertMessage('Ad could not be displayed. Please try again later.');
        }
    };


    return (
        <div className="p-4 space-y-6" style={{animation: 'fadeIn 0.5s'}}>
            <div className="card-bg p-4 rounded-lg flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">Your Balance</p>
                    <p className="text-3xl font-bold">{userData.balance} Coins</p>
                </div>
                <button className="bg-orange-100 text-orange-600 font-semibold px-6 py-2 rounded-lg">Withdraw</button>
            </div>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Daily Tasks</h2>
                        <p className="text-sm text-gray-500">Complete tasks to get rewards.</p>
                    </div>
                    <p className="text-sm text-gray-500">Ads Left: <span className="font-bold">{adsLeftCount}</span></p>
                </div>
                <div className="space-y-3">
                    <div className="bg-orange-500 p-3 rounded-lg flex items-center justify-between text-white">
                        <div>
                            <h3 className="font-bold">Watch Short Ad</h3>
                            <p className="text-xs font-medium">Rewarded Interstitial</p>
                        </div>
                        <button className="bg-white text-orange-500 font-bold px-6 py-2 rounded-lg text-sm btn" onClick={() => claimReward('interstitial')}>Claim</button>
                    </div>
                    <div className="card-bg p-3 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Click for Reward</h3>
                            <p className="text-xs text-gray-500">Rewarded Popup</p>
                        </div>
                        <button className="bg-gray-100 text-gray-800 font-bold px-6 py-2 rounded-lg text-sm btn" onClick={() => claimReward('popup')}>Claim</button>
                    </div>
                    <div className="card-bg p-3 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Watch a Video</h3>
                            <p className="text-xs text-gray-500">In-App Interstitial</p>
                        </div>
                        <button className="bg-gray-700 text-white font-bold px-6 py-2 rounded-lg text-sm btn" onClick={() => claimReward('inApp')}>Start</button>
                    </div>
                    <div className="card-bg p-3 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Play Mini App</h3>
                            <p className="text-xs text-gray-500">Get a big reward!</p>
                        </div>
                        <button className="bg-blue-500 text-white font-bold px-6 py-2 rounded-lg text-sm btn" onClick={() => claimReward('miniApp')}>Play</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
