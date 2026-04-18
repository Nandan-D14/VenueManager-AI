import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/api';

export default function Register() {
  const [role, setRole] = useState('guest');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    mobile: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const data = await register(payload);
      
      if (role === 'guest') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', data.user);
        localStorage.setItem('role', 'guest');
        navigate('/');
      } else {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 mt-2">Join the VenueManager ecosystem</p>
        </div>

        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
          {['guest', 'employee', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
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
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
              <input 
                name="name"
                type="text" 
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                placeholder="How should we address you?"
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
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Mobile Number</label>
                <input 
                  name="mobile"
                  type="tel" 
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                <input 
                  name="password"
                  type="password" 
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  placeholder="Create a password"
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#111111] text-white font-medium py-3 rounded-lg text-sm transition-colors hover:bg-black disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating...' : (role === 'guest' ? 'Continue as Guest' : 'Register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Already have an account? <Link to="/login" className="text-black font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
