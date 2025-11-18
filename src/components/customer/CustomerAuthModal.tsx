import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Lock, Phone, MapPin, Eye, EyeOff, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useToast } from '@/hooks/use-toast';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'register' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useCustomerAuth();
  const { toast } = useToast();

  // Handle body scroll locking and keyboard events
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.success) {
        onClose();
        setLoginData({ email: '', password: '' });
      } else {
        toast({
          title: 'Errore di accesso',
          description: result.error || 'Credenziali non valide',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'accesso',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Errore',
        description: 'Le password non corrispondono',
        variant: 'destructive',
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Errore',
        description: 'La password deve essere di almeno 6 caratteri',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(registerData.email, registerData.password, {
        fullName: registerData.fullName,
        phone: registerData.phone,
        address: registerData.address,
      });

      if (result.success) {
        toast({
          title: 'Registrazione completata!',
          description: 'Controlla la tua email per confermare l\'account',
        });
        onClose();
        setRegisterData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          address: '',
        });
      } else {
        toast({
          title: 'Errore di registrazione',
          description: result.error || 'Si è verificato un errore durante la registrazione',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la registrazione',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '1rem'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <Card
        className="w-full max-w-md max-h-[85vh] bg-white shadow-2xl border-0 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 my-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative bg-gradient-to-br from-red-600 to-red-700 text-white p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="bg-white/20 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle id="modal-title" className="text-xl font-bold text-white mb-2">
              Pizzeria Regina 2000
            </CardTitle>
            <CardDescription className="text-red-100 text-sm">
              {activeTab === 'login' ? 'Accedi al tuo account' : 'Crea il tuo account'}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-6 pb-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <Button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200 bg-transparent"
              }`}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Accedi
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200 bg-transparent"
              }`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Registrati
            </Button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Accedi al tuo account</h3>
                <p className="text-sm text-gray-600">Inserisci le tue credenziali</p>
              </div>

              <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-red-600" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="la-tua-email@esempio.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="h-4 w-4 mr-1 text-red-600" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="La tua password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-200 rounded-md"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                      </Button>
                    </div>
                  </div>
                </div>


              </form>
            </div>
          )}

          {/* Registration Form */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Crea il tuo account</h3>
                <p className="text-sm text-gray-600 mb-3">Registrati per gestire i tuoi ordini</p>

                {/* Benefits */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                  <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Vantaggi dell'account
                  </h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Tracciamento ordini in tempo reale
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Storico completo degli ordini
                    </li>
                  </ul>
                </div>
              </div>

              <form id="register-form" onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-1 text-red-600" />
                        Nome Completo
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Il tuo nome completo"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-red-600" />
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium text-gray-700 flex items-center">
                        <Lock className="h-4 w-4 mr-1 text-red-600" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Almeno 6 caratteri"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg pr-10"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-200 rounded-md"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700 flex items-center">
                        <Lock className="h-4 w-4 mr-1 text-red-600" />
                        Conferma Password
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ripeti la password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className={`h-10 text-sm border focus:ring-red-500 rounded-lg transition-all duration-200 ${
                          registerData.confirmPassword && registerData.password !== registerData.confirmPassword
                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                            : registerData.confirmPassword && registerData.password === registerData.confirmPassword
                            ? 'border-green-400 bg-green-50 focus:border-green-500'
                            : 'border-gray-300 focus:border-red-500'
                        }`}
                        required
                      />
                      {registerData.confirmPassword && (
                        <div className="flex items-center space-x-2 mt-1">
                          {registerData.password === registerData.confirmPassword ? (
                            <div className="flex items-center text-green-600 text-xs font-medium">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Le password corrispondono
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 text-xs font-medium">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                              Le password non corrispondono
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-red-600" />
                        Telefono
                      </Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+39 123 456 7890"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-address" className="text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-red-600" />
                        Indirizzo
                      </Label>
                      <Input
                        id="register-address"
                        type="text"
                        placeholder="Via, Numero, Città"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        className="h-10 text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                </div>


              </form>
            </div>
          )}
          </div>

          {/* Fixed Button Area */}
          <div className="p-6 pt-4 border-t border-gray-100 bg-white flex-shrink-0">
            {activeTab === 'login' ? (
              <Button
                type="submit"
                form="login-form"
                className="w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all duration-200"
                disabled={loading || !loginData.email || !loginData.password}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Accedi
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                form="register-form"
                className="w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all duration-200"
                disabled={
                  loading ||
                  !registerData.fullName ||
                  !registerData.email ||
                  !registerData.password ||
                  !registerData.confirmPassword ||
                  !registerData.phone ||
                  !registerData.address ||
                  (registerData.password && registerData.confirmPassword && registerData.password !== registerData.confirmPassword)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrazione...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crea Account
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CustomerAuthModal;
