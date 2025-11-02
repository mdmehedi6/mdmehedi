
import React, { useState, useEffect, useCallback } from 'react';
import type { UserData, AppConfig, WithdrawalRequest } from '../types';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Loader } from '../components/common';

interface WalletPageProps {
    userData: UserData;
    appConfig: AppConfig;
    setAlertMessage: (message: string) => void;
    updateUserData: (updates: Partial<UserData>) => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ userData, appConfig, setAlertMessage, updateUserData }) => {
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState(appConfig.paymentMethods[0] || '');
    const [paymentDetail, setPaymentDetail] = useState('');

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(
                collection(db, "withdrawals"), 
                where("userId", "==", userData.uid),
                orderBy("requestedAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const withdrawalHistory = querySnapshot.docs.map(doc => doc.data() as WithdrawalRequest);
            setHistory(withdrawalHistory);
        } catch (error) {
            console.error("Error fetching withdrawal history: ", error);
            setAlertMessage("Could not load withdrawal history.");
        } finally {
            setIsLoading(false);
        }
    }, [userData.uid, setAlertMessage]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleWithdrawal = async () => {
        const amount = parseInt(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            return setAlertMessage("Please enter a valid amount.");
        }
        if (amount < appConfig.minWithdrawal) {
            return setAlertMessage(`Minimum withdrawal is ${appConfig.minWithdrawal} coins.`);
        }
        if (amount > userData.balance) {
            return setAlertMessage("Insufficient balance.");
        }
        if (!paymentDetail.trim()) {
            return setAlertMessage("Please enter your payment details.");
        }

        try {
            updateUserData({ balance: userData.balance - amount });
            await addDoc(collection(db, "withdrawals"), {
                userId: userData.uid,
                userName: userData.name,
                userEmail: userData.email,
                amount: amount,
                method: withdrawMethod,
                paymentDetail: paymentDetail.trim(),
                status: "pending",
                requestedAt: serverTimestamp()
            });
            setAlertMessage("Withdrawal request submitted successfully!");
            setWithdrawAmount('');
            setPaymentDetail('');
            fetchHistory(); // Refresh history
        } catch (error: any) {
            setAlertMessage("Error submitting request: " + error.message);
            // Revert balance update on failure
            updateUserData({ balance: userData.balance });
        }
    };
    
    const getPaymentDetailPlaceholder = () => {
        const method = withdrawMethod.toLowerCase();
        if (method.includes('upi')) return "Enter your UPI ID";
        if (method.includes('paytm')) return "Enter your Paytm Number";
        return "Enter payment details";
    };

    return (
        <div className="p-4 space-y-6" style={{animation: 'fadeIn 0.5s'}}>
            <h2 className="text-xl font-bold text-center">My Wallet</h2>
            <div className="card-bg p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Withdraw Earnings</h3>
                <p className="text-sm text-gray-500 mb-1">Current Balance: <span className="font-bold text-accent">{userData.balance} Coins</span></p>
                <p className="text-sm text-gray-500 mb-2">Minimum Withdrawal: {appConfig.minWithdrawal} Coins</p>
                <p className="text-sm text-gray-500 mb-4 font-semibold">{appConfig.coinValueCoins} Coins = BDT{appConfig.coinValueInr}</p>
                
                <input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number" placeholder="Enter coin amount" className="w-full p-3 rounded-lg input-field mb-3" />
                <select value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value)} className="w-full p-3 rounded-lg input-field mb-3">
                    {appConfig.paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                </select>
                <input value={paymentDetail} onChange={e => setPaymentDetail(e.target.value)} type="text" placeholder={getPaymentDetailPlaceholder()} className="w-full p-3 rounded-lg input-field" />
                <button onClick={handleWithdrawal} className="w-full p-3 rounded-lg btn-accent mt-4">Request Withdrawal</button>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-3">Withdrawal History</h3>
                <div className="space-y-3">
                    {isLoading ? <Loader /> : history.length === 0 ? (
                        <p className="text-gray-500 text-center">You have not made any withdrawal yet.</p>
                    ) : (
                        history.map((item, index) => {
                            const statusColors = {
                                pending: 'text-yellow-500',
                                approved: 'text-green-500',
                                rejected: 'text-red-500',
                            };
                            return (
                                <div key={index} className="card-bg p-3 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{item.amount} Coins - {item.method}</p>
                                        <p className="text-xs text-gray-500">{item.requestedAt?.toDate().toLocaleDateString()}</p>
                                    </div>
                                    <p className={`font-bold ${statusColors[item.status]} capitalize`}>{item.status}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
