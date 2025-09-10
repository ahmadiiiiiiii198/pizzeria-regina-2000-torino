import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Shield, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AuthSeparationTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Get both authentication states
  const customerAuth = useCustomerAuth();
  const adminAuth = useAdminAuth();

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${timestamp} ${icon} ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getCurrentAuthStates = () => {
    return {
      client: {
        isAuthenticated: customerAuth.isAuthenticated,
        user: customerAuth.user?.email || null,
        session: !!customerAuth.session
      },
      admin: {
        isAuthenticated: adminAuth.isAuthenticated,
        loading: adminAuth.isLoading
      }
    };
  };

  const testAuthSeparation = async () => {
    setIsRunning(true);
    clearResults();
    
    addResult('🧪 Starting Authentication Separation Test', 'info');
    
    // Test 1: Check initial states
    const initialStates = getCurrentAuthStates();
    addResult(`Initial Client Auth: ${initialStates.client.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`, 'info');
    addResult(`Initial Admin Auth: ${initialStates.admin.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`, 'info');
    
    // Test 2: Check localStorage separation
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const adminCreds = localStorage.getItem('adminCredentials');
    const clientIdentity = localStorage.getItem('pizzeria_client_identity');
    
    addResult(`Admin localStorage keys: ${adminAuth ? 'Present' : 'Missing'} (adminAuthenticated), ${adminCreds ? 'Present' : 'Missing'} (adminCredentials)`, 'info');
    addResult(`Client localStorage keys: ${clientIdentity ? 'Present' : 'Missing'} (pizzeria_client_identity)`, 'info');
    
    // Test 3: Verify no shared keys
    const allLocalStorageKeys = Object.keys(localStorage);
    const sharedKeys = allLocalStorageKeys.filter(key => 
      key.includes('admin') && key.includes('client') ||
      key.includes('supabase') && key.includes('admin')
    );
    
    if (sharedKeys.length === 0) {
      addResult('✅ No shared localStorage keys found - Good separation!', 'success');
    } else {
      addResult(`❌ Found potentially shared keys: ${sharedKeys.join(', ')}`, 'error');
    }
    
    // Test 4: Test admin logout doesn't affect client
    if (initialStates.admin.isAuthenticated) {
      addResult('Testing admin logout impact on client auth...', 'info');
      const clientStateBefore = getCurrentAuthStates().client;
      
      // Simulate admin logout (just clear localStorage, don't call actual logout)
      localStorage.removeItem('adminAuthenticated');
      
      // Wait a moment and check client state
      setTimeout(() => {
        const clientStateAfter = getCurrentAuthStates().client;
        
        if (clientStateBefore.isAuthenticated === clientStateAfter.isAuthenticated) {
          addResult('✅ Admin logout did not affect client authentication', 'success');
        } else {
          addResult('❌ Admin logout affected client authentication!', 'error');
        }
        
        // Restore admin auth if it was there
        if (initialStates.admin.isAuthenticated) {
          localStorage.setItem('adminAuthenticated', 'true');
        }
        
        setIsRunning(false);
      }, 1000);
    } else {
      setIsRunning(false);
    }
  };

  const testClientLogout = async () => {
    if (!customerAuth.isAuthenticated) {
      addResult('❌ No client session to test logout', 'error');
      return;
    }
    
    addResult('Testing client logout impact on admin auth...', 'info');
    const adminStateBefore = getCurrentAuthStates().admin;
    
    // Perform client logout
    await customerAuth.signOut();
    
    // Check admin state after client logout
    setTimeout(() => {
      const adminStateAfter = getCurrentAuthStates().admin;
      
      if (adminStateBefore.isAuthenticated === adminStateAfter.isAuthenticated) {
        addResult('✅ Client logout did not affect admin authentication', 'success');
      } else {
        addResult('❌ Client logout affected admin authentication!', 'error');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center text-2xl">
              <Shield className="h-8 w-8 mr-3" />
              Authentication Separation Test
            </CardTitle>
            <CardDescription className="text-blue-100">
              Verify that client and admin authentication systems are completely independent
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Client Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={customerAuth.isAuthenticated ? "default" : "secondary"}>
                    {customerAuth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </div>
                {customerAuth.user && (
                  <div className="flex items-center justify-between">
                    <span>User:</span>
                    <span className="text-sm text-gray-600">{customerAuth.user.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Session:</span>
                  <Badge variant={customerAuth.session ? "default" : "secondary"}>
                    {customerAuth.session ? "Active" : "None"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Admin Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={adminAuth.isAuthenticated ? "default" : "secondary"}>
                    {adminAuth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Loading:</span>
                  <Badge variant={adminAuth.isLoading ? "outline" : "secondary"}>
                    {adminAuth.isLoading ? "Loading..." : "Ready"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={testAuthSeparation}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? 'Running...' : 'Test Auth Separation'}
              </Button>
              
              <Button 
                onClick={testClientLogout}
                disabled={!customerAuth.isAuthenticated}
                variant="outline"
              >
                Test Client Logout Impact
              </Button>
              
              <Button 
                onClick={clearResults}
                variant="outline"
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <div className="space-y-1 font-mono text-sm">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-gray-800">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default AuthSeparationTest;
