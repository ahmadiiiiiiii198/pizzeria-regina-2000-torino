import React, { useState } from 'react';
import { User, LogOut, Package, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import CustomerAuthModal from './CustomerAuthModal';

const CustomerAccountWidget: React.FC = () => {
  const { user, profile, signOut, isAuthenticated, loading } = useCustomerAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleShowLogin = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  const handleShowRegister = () => {
    setAuthModalTab('register');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewOrders = () => {
    // Navigate to user orders page
    window.location.href = '/my-orders';
  };

  const handleViewProfile = () => {
    // Navigate to user profile page
    window.location.href = '/profile';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center space-x-2">
          {/* Mobile - Single button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowLogin}
              className="flex items-center gap-1 px-2 py-1"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop - Login and Register buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowLogin}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Accedi
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleShowRegister}
              className="flex items-center gap-2"
            >
              Registrati
            </Button>
          </div>
        </div>

        <CustomerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">
                {profile?.full_name || user?.email?.split('@')[0] || 'Account'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">
              {profile?.full_name || 'Account Cliente'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleViewOrders}>
            <Package className="mr-2 h-4 w-4" />
            I Miei Ordini
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleViewProfile}>
            <Settings className="mr-2 h-4 w-4" />
            Profilo
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnetti
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CustomerAccountWidget;
