import { Sparkles, X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

interface GoogleSignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (credentialResponse: CredentialResponse) => void;
    onError: () => void;
}

const GoogleSignInModal = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
}: GoogleSignInModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={onClose}
            ></div>

            <div className="relative max-w-md w-full mx-4 overflow-hidden rounded-2xl  bg-white py-15 px-8 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in duration-200">
                <div className="pointer-events-none absolute inset-x-0 " />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-900 hover:text-black transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6">
                    <div className="flex items-start mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center mx-auto shadow-lg flex-shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Welcome Back
                        </h2>
                        <p className="text-gray-700">
                            Sign in to access your documents and conversations
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <GoogleLogin
                            onSuccess={onSuccess}
                            onError={onError}
                            theme="filled_black"
                            size="large"
                            text="signin_with"
                            shape="pill"
                            width="300"
                        
                        />
                    </div>

                    <p className="text-[13px] text-gray-600 pt-6">
                        By signing in, you agree to our Terms of Service and
                        <br></br>Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GoogleSignInModal;
