import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, LogIn, UserPlus, Shield, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerAuthModal from './customer/CustomerAuthModal';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  title = "Accesso Richiesto",
  message = "Per garantire la sicurezza e tracciare i tuoi ordini, devi essere autenticato."
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  const handleShowLogin = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  const handleShowRegister = () => {
    setAuthModalTab('register');
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    onClose(); // Close the auth required modal as well
  };

  const modalContent = (
    <>
      {/* Auth Required Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50 overflow-hidden">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-pizza-orange to-red-500 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold">
              {title}
            </CardTitle>
            <CardDescription className="text-white/90 mt-2">
              Sicurezza e Privacy dei tuoi Ordini
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Pizza className="h-12 w-12 text-pizza-orange" />
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-800 mb-2">Perché è necessario l'accesso?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tracciamento sicuro dei tuoi ordini</li>
                  <li>• Protezione dei tuoi dati personali</li>
                  <li>• Storico ordini personalizzato</li>
                  <li>• Notifiche in tempo reale</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleShowLogin}
                className="w-full bg-gradient-to-r from-pizza-orange to-red-500 hover:from-red-500 hover:to-pizza-orange text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Accedi al tuo Account
              </Button>
              
              <Button
                onClick={handleShowRegister}
                variant="outline"
                className="w-full border-pizza-orange text-pizza-orange hover:bg-pizza-orange hover:text-white py-3 rounded-xl transition-all duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Crea un Nuovo Account
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700 py-2"
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Auth Modal */}
      {showAuthModal && (
        <CustomerAuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          defaultTab={authModalTab}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AuthRequiredModal;
