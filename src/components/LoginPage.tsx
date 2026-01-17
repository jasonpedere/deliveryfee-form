import React, { useState, useEffect } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hardcoded credentials - Add more users here
  const VALID_USERS = [
    {
      username: 'json',
      password: 'json22',
      role: 'Admin'
    },
    {
      username: 'matetadmin',
      password: 'matet123',
      role: 'Co-Admin'
    },
    // Add more users below:
    // {
    //   username: 'john',
    //   password: 'john123',
    //   role: 'Co-Admin'
    // },
  ];

  // Auto-hide error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      // Check if credentials match any user
      const user = VALID_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Store login state with user info
        localStorage.setItem('jds_logged_in', 'true');
        localStorage.setItem('jds_user', JSON.stringify({
          username: user.username,
          role: user.role
        }));
        onLoginSuccess();
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] flex items-center justify-center px-5">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-10 md:p-6 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-[#EA5A47] text-center text-[28px] mb-10 md:text-[22px] md:mb-6 tracking-tight">
          JDS Delivery
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-[#333] text-[16px] md:text-[15px] md:mb-[6px]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-[50px] px-4 text-[16px] border-2 border-[#e5e7eb] rounded-xl bg-white text-[#333] transition-all duration-200 focus:outline-none focus:border-[#EA5A47] focus:shadow-[0_0_0_3px_rgba(234,90,71,0.1)] placeholder:text-[#9ca3af] md:h-11 md:text-[15px] md:px-3"
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] bg-[#EA5A47] text-white text-[16px] rounded-xl transition-all duration-200 hover:bg-[#d94d3a] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-6 flex items-center justify-center md:h-11 md:text-[15px] md:mt-5"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-xl bg-[#fee] text-[#EA5A47] text-[14px] md:text-[13px] md:p-[10px] animate-in fade-in slide-in-from-top-2 duration-300">
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

          {/* Helper Text */}
          <div className="mt-6 text-center text-[#9ca3af] text-[13px] md:text-[12px]">
            Default: admin / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
