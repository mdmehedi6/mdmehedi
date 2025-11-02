
import React from 'react';

const RulesPage: React.FC = () => {
    return (
        <div className="p-4 space-y-6" style={{animation: 'fadeIn 0.5s'}}>
            <h2 className="text-xl font-bold text-center mb-4">Rules</h2>
            <div className="card-bg p-4 rounded-lg space-y-3">
                <p className="text-gray-700">1. Do not use multiple accounts to abuse the system.</p>
                <p className="text-gray-700">2. Any kind of fraudulent activity will result in a permanent ban.</p>
                <p className="text-gray-700">3. After viewing every 10 ads, click on the 11th ad and visit for 1 minute.</p>
                <p className="text-gray-700">4. Join the <a href="https://t.me/tag2cash_bot" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold">@Tag2Cash_bot</a> group and work.</p>
                <p>
                    <span style={{ backgroundColor: 'yellow', color: 'red', fontWeight: 'bold', padding: '2px 4px', borderRadius: '3px' }}>
                        Note: Fake referrals will result in an immediate ban.
                    </span>
                </p>
            </div>
            <div className="text-center mt-4">
                <a href="https://t.me/tag2cash_bot/3" target="_blank" rel="noopener noreferrer">
                    <button className="w-full p-3 rounded-lg btn-accent">Bangla Rules</button>
                </a>
            </div>
        </div>
    );
};

export default RulesPage;
