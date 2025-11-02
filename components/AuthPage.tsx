
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthPageProps {
    setAlertMessage: (message: string) => void;
    setAuthLoading: (loading: boolean) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ setAlertMessage, setAuthLoading }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            return setAlertMessage("Please enter email and password.");
        }
        setAuthLoading(true);
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        } catch (error: any) {
            setAlertMessage(error.message);
        } finally {
            setAuthLoading(false);
        }
    };
    
    const handleSignup = async () => {
        if (!signupName || !signupEmail || !signupPassword) {
            return setAlertMessage("Please fill in all fields.");
        }
        setAuthLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            // The onAuthStateChanged listener in App.tsx will handle the rest.
        } catch (error: any) {
            setAlertMessage(error.message);
        } finally {
            setAuthLoading(false);
        }
    };


    return (
        <div className="min-h-screen p-6 flex flex-col justify-center main-page active">
            <h1 className="text-4xl font-bold text-center mb-2 text-accent">𝓣𝓪𝓰2𝓒𝓪𝓼𝓱</h1>
            <p className="text-center text-gray-500 mb-8">Login or Sign Up to continue</p>
            <div>
                {isLoginView ? (
                    <div style={{animation: 'fadeIn 0.5s'}}>
                        <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-3 rounded-lg input-field mb-4" />
                        <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-lg input-field mb-4" />
                        <button onClick={handleLogin} className="w-full p-3 rounded-lg btn-accent mb-4">Login</button>
                        <p className="text-center text-gray-500">Don't have an account? <a href="#" onClick={(e) => {e.preventDefault(); setIsLoginView(false)}} className="font-semibold text-accent">Sign Up</a></p>
                    </div>
                ) : (
                    <div style={{animation: 'fadeIn 0.5s'}}>
                        <input value={signupName} onChange={e => setSignupName(e.target.value)} type="text" placeholder="Full Name" className="w-full p-3 rounded-lg input-field mb-4" />
                        <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-3 rounded-lg input-field mb-4" />
                        <input value={signupPassword} onChange={e => setSignupPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-lg input-field mb-4" />
                        <button onClick={handleSignup} className="w-full p-3 rounded-lg btn-accent mb-4">Sign Up</button>
                        <p className="text-center text-gray-500">Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); setIsLoginView(true)}} className="font-semibold text-accent">Login</a></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
