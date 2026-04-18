import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/api';

export default function Login() {
  const [role, setRole] = useState('guest');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    otp: ''
  });
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = () => {
    if (!formData.username) return setError('Please enter username first');
    setShowOtp(true);
    alert('Simulated OTP sent: 1234');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const data = await login(payload);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', data.user);
      localStorage.setItem('role', data.role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl enterprise-shadow overflow-hidden border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-[#111111] rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">V</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Access Console</h1>
          <p className="text-sm text-gray-500 mt-2">Choose your role to continue</p>
        </div>

        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
          {['guest', 'employee', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setShowOtp(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-md capitalize transition-all ${
                role === r ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md">
              {error}
            </div>
          )}
          
          {role === 'guest' ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Name</label>
              <input 
                name="name"
                type="text" 
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                placeholder="Enter your name"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                <input 
                  name="username"
                  type="text" 
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  placeholder="Enter username"
                  required
                />
              </div>

              {!showOtp ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    placeholder="Enter password"
                  />
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                  >
                    Or use mobile OTP
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Enter OTP (Simulated: 1234)</label>
                  <input 
                    name="otp"
                    type="text" 
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    placeholder="1234"
                    maxLength={4}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                  >
                    Back to password
                  </button>
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#111111] text-white font-medium py-3 rounded-lg text-sm transition-colors hover:bg-black disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Don't have an account? <Link to="/register" className="text-black font-semibold hover:underline">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
