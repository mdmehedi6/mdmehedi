
import React from 'react';

interface LoaderProps {
    fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 dark-bg bg-opacity-75 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }
    return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>;
};

interface CustomAlertProps {
    message: string;
    onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-lg">
                <p className="mb-4 text-gray-700">{message}</p>
                <button onClick={onClose} className="btn-accent px-6 py-2 rounded-lg">OK</button>
            </div>
        </div>
    );
};
