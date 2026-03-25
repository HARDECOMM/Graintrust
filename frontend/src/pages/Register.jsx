import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Wheat, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await register(formData);
      toast.success('Account created successfully!');
      
      if (userData.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else if (userData.role === 'mill') {
        navigate('/mill-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to register';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Full Screen Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://cdn.pixabay.com/photo/2022/10/15/11/44/paddy-field-7523024_1280.jpg"
          alt="Rice Harvest"
          className="w-full h-full object-cover opacity-50 scale-105 blur-[3px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-black/60 to-secondary/20" />
      </div>

      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />

      {/* Centered Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20"
      >
        <Link to="/" className="inline-flex items-center text-sm text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/20 rounded-xl backdrop-blur-md">
            <Wheat className="text-primary-light w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/20 backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                className={`py-3 rounded-xl font-medium border transition-all ${
                  formData.role === 'farmer'
                    ? 'bg-primary/20 border-primary text-primary-light'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                Farmer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'mill' })}
                className={`py-3 rounded-xl font-medium border transition-all ${
                  formData.role === 'mill'
                    ? 'bg-secondary/20 border-secondary text-secondary'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                Mill
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {loading ? 'Creating account...' : <><UserPlus className="w-5 h-5" /> Sign Up</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
