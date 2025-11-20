import { useState, useEffect } from 'react';
import { LogOut, User, Plus, X } from 'lucide-react';

interface InvoiceCalculatorProps {
  onLogout: () => void;
  onNavigateToDelivery?: (summary: string, deliveryFee: number) => void;
}

interface UserInfo {
  username: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

export function InvoiceCalculator({ onLogout, onNavigateToDelivery }: InvoiceCalculatorProps) {
  const [products, setProducts] = useState<Product[]>([{ id: 1, name: '', price: 0 }]);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash'>('Cash');
  const [selectedGCashAccount, setSelectedGCashAccount] = useState<string>('');
  const [productCounter, setProductCounter] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // ====== EDIT GCASH ACCOUNTS HERE ======
  // Add or modify GCash accounts in this list
  const gcashAccounts = [
    'JA**N P. - 09050265325',
    'AL***H G - 09361026849',
    'RE**L F. - 09943124231',
    'J** P** B. - 09927382670',
    'JE****Y F. - 09507063067',
    'RA**Y GA***A R. - 09928458329',
    'RU****L J** P. - 09537348890',
  ];
  // ====================================

  useEffect(() => {
    // Load user info from localStorage
    const userStr = localStorage.getItem('jds_user');
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  }, []);

  const formatCurrency = (number: number): string => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const calculateTotal = (): number => {
    const productsTotal = products.reduce((sum, product) => sum + product.price, 0);
    const gcashFee = paymentMethod === 'GCash' ? 10 : 0;
    return productsTotal + serviceFee + deliveryFee + gcashFee;
  };

  const addProduct = () => {
    const newId = productCounter + 1;
    setProductCounter(newId);
    setProducts([...products, { id: newId, name: '', price: 0 }]);
  };

  const removeProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const updateProductName = (id: number, name: string) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, name } : product
    ));
  };

  const updateProductPrice = (id: number, price: number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, price } : product
    ));
  };

  const generateSummary = (): string => {
    let summaryText = "Invoice\n";
    let hasValidProducts = false;
    let subtotal = 0;

    products.forEach((product) => {
      if (product.name || product.price > 0) {
        summaryText += `• ${product.name || 'Unnamed Product'}: ₱${formatCurrency(product.price)}\n`;
        subtotal += product.price;
        hasValidProducts = true;
      }
    });

    if (!hasValidProducts && products.length === 0) {
      summaryText += "No products added.\n";
    } else if (!hasValidProducts && products.length > 0) {
      summaryText += "No product details entered.\n";
    }

    if (serviceFee > 0) {
      summaryText += `Service Fee: ₱${formatCurrency(serviceFee)}\n`;
    }
    summaryText += `Delivery Fee: ₱${formatCurrency(deliveryFee)}\n`;
    
    // Add GCash fee if payment method is GCash
    if (paymentMethod === 'GCash') {
      summaryText += `GCash Fee: ₱10.00\n`;
    }
    
    summaryText += `Total: ₱${formatCurrency(calculateTotal())}\n`;
    
    // Add payment method info
    summaryText += `Payment Method: ${paymentMethod}\n`;
    if (paymentMethod === 'GCash' && selectedGCashAccount) {
      summaryText += `GCash Account: ${selectedGCashAccount}\n`;
    }

    return summaryText;
  };

  const copySummary = () => {
    const textToCopy = generateSummary();
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2500);
      }
    } catch (err) {
      console.error('Error copying text:', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center px-0 pb-0 md:px-5 md:pb-5 md:bg-gradient-to-br md:from-[#f5f5f5] md:to-[#e8e8e8]">
      <div className="w-full max-w-none bg-white rounded-none shadow-none p-5 mt-0 border-0 min-h-screen md:max-w-[600px] md:rounded-2xl md:shadow-xl md:p-10 md:mt-5 md:border md:border-[#e5e7eb] md:min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="text-[#EA5A47] text-center flex-1 text-[28px] md:text-[22px] tracking-tight">
            Invoice Calculator
          </h1>
          <div className="flex items-center gap-2">
            {userInfo && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#EA5A47]/10 to-[#EA5A47]/5 rounded-lg border border-[#EA5A47]/20">
                <User className="w-4 h-4 text-[#EA5A47]" />
                <span className="text-[14px] text-[#EA5A47] md:text-[13px]">
                  {userInfo.role}
                </span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="text-[#EA5A47] hover:text-[#d94d3a] transition-all duration-200 p-2 rounded-lg hover:bg-[#EA5A47]/10 active:scale-95"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="mb-6 md:mb-5 space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="flex gap-3 items-center animate-in fade-in slide-in-from-left-4 duration-300">
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProductName(product.id, e.target.value)}
                placeholder="Product name"
                className="w-[48%] h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
              />
              <div className="flex-1 flex items-center gap-1">
                <span className="text-[18px] text-[#111] md:text-[17px] font-semibold">₱</span>
                <input
                  type="number"
                  value={product.price || ''}
                  onChange={(e) => updateProductPrice(product.id, parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#111] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#6b7280] md:h-11 md:text-[15px] md:px-3"
                />
              </div>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="w-10 h-10 flex items-center justify-center bg-[#dc3545] text-white rounded-full hover:bg-[#c82333] transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 shadow-md hover:shadow-lg"
                  title="Remove product"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <button
          type="button"
          onClick={addProduct}
          className="w-full h-[50px] bg-gradient-to-r from-[#EA5A47] to-[#d94d3a] text-white text-[16px] rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] mb-6 flex items-center justify-center gap-2 md:h-11 md:text-[15px] md:mb-5"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>

        {/* Service Fee */}
        <div className="mb-6 md:mb-5">
          <label className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
            Service Fee
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[18px] text-[#111] md:text-[17px] font-semibold">₱</span>
            <input
              type="number"
              value={serviceFee || ''}
              onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#111] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#6b7280] md:h-11 md:text-[15px] md:px-3"
            />
          </div>
        </div>

        {/* Delivery Fee */}
        <div className="mb-6 md:mb-5">
          <label className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
            Delivery Fee
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[18px] text-[#111] md:text-[17px] font-semibold">₱</span>
            <input
              type="number"
              value={deliveryFee || ''}
              onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#111] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#6b7280] md:h-11 md:text-[15px] md:px-3"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6 md:mb-5">
          <label className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'GCash')}
            className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
          >
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
          </select>
        </div>

        {/* GCash Account Selection */}
        {paymentMethod === 'GCash' && (
          <div className="mb-6 md:mb-5">
            <label className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
              GCash Account
            </label>
            <select
              value={selectedGCashAccount}
              onChange={(e) => setSelectedGCashAccount(e.target.value)}
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
            >
              <option value="">Select GCash Account</option>
              {gcashAccounts.map((account, index) => (
                <option key={index} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary Section */}
        <div className="mt-8 pt-8 border-t-2 border-[#e5e7eb] md:mt-6 md:pt-6">
          <h2 className="text-[21px] mb-4 text-[#333] md:text-[18px] md:mb-3">Summary</h2>
          <pre className="bg-gradient-to-br from-[#f8f9fa] to-[#f1f3f5] border-2 border-[#e5e7eb] rounded-xl p-4 whitespace-pre-wrap font-mono text-[15px] leading-relaxed text-[#333] mb-4 md:text-[14px] md:p-3 md:mb-3 shadow-inner">
            {generateSummary()}
          </pre>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={copySummary}
              className="flex-1 h-[50px] bg-gradient-to-r from-[#28a745] to-[#218838] text-white text-[16px] rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] md:h-11 md:text-[15px] flex items-center justify-start px-6 md:px-4"
            >
              Copy Summary
            </button>
            <button
              type="button"
              onClick={() => onNavigateToDelivery && onNavigateToDelivery(generateSummary(), deliveryFee)}
              className="flex-1 h-[50px] bg-gradient-to-r from-[#EA5A47] to-[#d94d3a] text-white text-[16px] rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] md:h-11 md:text-[15px] flex items-center justify-start px-6 md:px-4"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Copied Message */}
      {showCopiedMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#212529] to-[#343a40] text-white px-6 py-3 rounded-xl z-50 text-[14px] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 border border-white/10">
          ✓ Summary copied to clipboard!
        </div>
      )}
    </div>
  );
}
