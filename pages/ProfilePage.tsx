
import React from 'react';
import type { User } from 'firebase/auth';
import type { UserData } from '../types';

interface ProfilePageProps {
    user: User;
    userData: UserData;
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, onLogout }) => {
    return (
        <div className="p-4 space-y-6" style={{animation: 'fadeIn 0.5s'}}>
            <h2 className="text-xl font-bold text-center mb-4">Profile</h2>
            <div className="flex flex-col items-center">
                <img src={`https://ui-avatars.com/api/?name=${userData.name.replace(/\s/g, '+')}&background=ff9800&color=fff&size=100`} alt="User avatar" className="rounded-full mb-2" />
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-gray-500">{userData.email}</p>
            </div>
            <button onClick={onLogout} className="w-full mt-6 p-3 rounded-lg bg-gray-700 text-white font-bold btn">Logout</button>
        </div>
    );
};

export default ProfilePage;
