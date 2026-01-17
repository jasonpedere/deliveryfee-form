import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DeliveryForm } from './components/DeliveryForm';
import { InvoiceCalculator } from './components/InvoiceCalculator';
import { Toaster } from './components/ui/sonner';

type ActivePage = 'delivery' | 'invoice';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState<ActivePage>('invoice');
  const [transactionData, setTransactionData] = useState<string>('');
  const [deliveryFeeData, setDeliveryFeeData] = useState<number>(0);

  // Check if user is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('jds_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jds_logged_in');
    localStorage.removeItem('jds_user');
    setIsLoggedIn(false);
    setActivePage('invoice'); // Reset to invoice page on logout
  };

  const handleNavigateToDelivery = (summary: string, deliveryFee: number) => {
    setTransactionData(summary);
    setDeliveryFeeData(deliveryFee);
    setActivePage('delivery');
  };

  // Show loading state briefly while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <span className="inline-block w-8 h-8 border-[3px] border-[#EA5A47]/30 border-t-[#EA5A47] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
          {/* Navigation Tabs */}
          <div className="bg-white border-b-2 border-[#e5e7eb] sticky top-0 z-10 shadow-md backdrop-blur-sm bg-white/95">
            <div className="max-w-[600px] mx-auto px-5 flex gap-1 md:px-3">
              <button
                onClick={() => setActivePage('invoice')}
                className={`px-6 py-4 text-[16px] transition-all duration-200 border-b-[3px] relative md:px-4 md:py-3 md:text-[15px] ${
                  activePage === 'invoice'
                    ? 'border-[#EA5A47] text-[#EA5A47]'
                    : 'border-transparent text-[#666] hover:text-[#EA5A47] hover:bg-[#EA5A47]/5'
                }`}
              >
                Invoice Calculator
              </button>
              <button
                onClick={() => setActivePage('delivery')}
                className={`px-6 py-4 text-[16px] transition-all duration-200 border-b-[3px] relative md:px-4 md:py-3 md:text-[15px] ${
                  activePage === 'delivery'
                    ? 'border-[#EA5A47] text-[#EA5A47]'
                    : 'border-transparent text-[#666] hover:text-[#EA5A47] hover:bg-[#EA5A47]/5'
                }`}
              >
                Delivery Form
              </button>
            </div>
          </div>

          {/* Page Content */}
          {activePage === 'delivery' ? (
            <DeliveryForm 
              onLogout={handleLogout}
              onNavigateToInvoice={() => setActivePage('invoice')}
              transactionData={transactionData}
              deliveryFeeData={deliveryFeeData}
            />
          ) : (
            <InvoiceCalculator 
              onLogout={handleLogout} 
              onNavigateToDelivery={handleNavigateToDelivery}
            />
          )}
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      <Toaster />
    </>
  );
}