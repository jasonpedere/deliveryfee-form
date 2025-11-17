import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  pickupLocation: string;
  deliveryFee: string;
  rider: string;
  admin: string;
}

interface DeliveryFormProps {
  onLogout: () => void;
  onNavigateToInvoice?: () => void;
  transactionData?: string;
  deliveryFeeData?: number;
}

interface UserInfo {
  username: string;
  role: string;
}

export function DeliveryForm({ onLogout, onNavigateToInvoice, transactionData, deliveryFeeData }: DeliveryFormProps) {
  const [formData, setFormData] = useState<FormData>({
    pickupLocation: '',
    deliveryFee: '',
    rider: '',
    admin: '',
  });

  const [riders, setRiders] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Configuration - Replace with your own URLs
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHV_AtNWgvdQzZ3gS1V5IRfnVnQIIjh2aE9GhmeT5hHezauHtUPy7fJStnE7k0nreLCbhxTSzcMYay/pub?gid=0&single=true&output=csv';
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFWt1jZQKXv18SXyFCPv8_BmHSQpywpiTR5CeNWaDzfjk7X0TS2-EXoMGiafmHC686Nw/exec';

  // Load dropdown data from Google Sheets
  useEffect(() => {
    loadDropdownData();
    
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

  // Auto-fill transaction data when provided
  useEffect(() => {
    if (transactionData) {
      setFormData((prev) => ({
        ...prev,
        pickupLocation: transactionData,
      }));
    }
  }, [transactionData]);

  // Auto-fill delivery fee data when provided
  useEffect(() => {
    if (deliveryFeeData !== undefined) {
      setFormData((prev) => ({
        ...prev,
        deliveryFee: deliveryFeeData.toString(),
      }));
    }
  }, [deliveryFeeData]);

  // Auto-hide error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-hide success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadDropdownData = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const data = results.data as Array<{ Rider?: string; Admin?: string }>;

          // Extract unique riders
          const uniqueRiders = [...new Set(
            data
              .map((row) => row.Rider)
              .filter((rider) => rider && rider.trim() !== '')
          )] as string[];

          // Extract unique admins
          const uniqueAdmins = [...new Set(
            data
              .map((row) => row.Admin)
              .filter((admin) => admin && admin.trim() !== '')
          )] as string[];

          setRiders(uniqueRiders);
          setAdmins(uniqueAdmins);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setError('Unable to load dropdown data. Please refresh the page.');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Unable to load dropdown data. Please refresh the page.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.pickupLocation || !formData.deliveryFee || !formData.rider || !formData.admin) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const submissionData = {
        pickupLocation: formData.pickupLocation,
        deliveryFee: formData.deliveryFee,
        rider: formData.rider,
        admin: formData.admin,
        encoder: userInfo?.username || 'Unknown',
        timestamp: new Date().toISOString(),
      };

      console.log('Submitting data:', submissionData); // Debug log

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      // Show success message
      setSuccess(true);
      toast.success('Form submitted successfully! ✓', {
        description: `Transaction recorded for ${formData.rider}`,
        duration: 4000,
      });

      // Clear form
      setFormData({
        pickupLocation: '',
        deliveryFee: '',
        rider: '',
        admin: '',
      });

      // Don't auto-navigate - let user see the success message and click Back when ready
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit. Please try again.');
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center px-0 pb-0 md:px-5 md:pb-5 md:bg-gradient-to-br md:from-[#f5f5f5] md:to-[#e8e8e8]">
      <div className="w-full max-w-none bg-white rounded-none shadow-none p-5 mt-0 border-0 min-h-screen md:max-w-[600px] md:rounded-2xl md:shadow-xl md:p-10 md:mt-5 md:border md:border-[#e5e7eb] md:min-h-0">
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="text-[#EA5A47] text-center flex-1 text-[28px] md:text-[22px] tracking-tight">
            JDS Delivery Form
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

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-5">
          {/* Pickup Location */}
          <div>
            <label htmlFor="pickupLocation" className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
              Transactions
            </label>
            <input
              type="text"
              id="pickupLocation"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              placeholder="Enter location"
              required
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
            />
          </div>

          {/* Delivery Fee */}
          <div>
            <label htmlFor="deliveryFee" className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
              Delivery Fee (DF)
            </label>
            <input
              type="text"
              id="deliveryFee"
              name="deliveryFee"
              value={formData.deliveryFee}
              onChange={handleInputChange}
              placeholder="Enter delivery fee"
              required
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
            />
          </div>

          {/* Rider */}
          <div>
            <label htmlFor="rider" className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
              Rider
            </label>
            <select
              id="rider"
              name="rider"
              value={formData.rider}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full h-[50px] px-4 pr-10 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23666%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_16px_center] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed md:h-11 md:text-[15px] md:px-3 md:pr-9 md:bg-[right_12px_center]"
            >
              <option value="">{loading ? 'Loading...' : 'Select a rider'}</option>
              {riders.map((rider) => (
                <option key={rider} value={rider}>
                  {rider}
                </option>
              ))}
            </select>
          </div>

          {/* Admin */}
          <div>
            <label htmlFor="admin" className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]">
              Admin
            </label>
            <select
              id="admin"
              name="admin"
              value={formData.admin}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full h-[50px] px-4 pr-10 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23666%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_16px_center] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed md:h-11 md:text-[15px] md:px-3 md:pr-9 md:bg-[right_12px_center]"
            >
              <option value="">{loading ? 'Loading...' : 'Select an admin'}</option>
              {admins.map((admin) => (
                <option key={admin} value={admin}>
                  {admin}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[50px] bg-gradient-to-r from-[#EA5A47] to-[#d94d3a] text-white text-[16px] rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-2 flex items-center justify-center md:h-11 md:text-[15px]"
          >
            {submitting ? (
              <>
                <span className="inline-block w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>

          {/* Back Button */}
          {onNavigateToInvoice && (
            <button
              type="button"
              onClick={onNavigateToInvoice}
              className="w-full h-[50px] bg-[#6c757d] text-white text-[16px] rounded-xl transition-all duration-200 hover:bg-[#5a6268] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center md:h-11 md:text-[15px]"
            >
              Back
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#fee] to-[#fdd] text-[#EA5A47] text-[14px] md:text-[13px] md:p-[10px] animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-[#EA5A47]/20">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#d4edda] to-[#c3e6cb] text-[#155724] text-[14px] md:text-[13px] md:p-[10px] animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-[#28a745]/20">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Form submitted successfully!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}