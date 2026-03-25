import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wheat, ShieldCheck, TrendingUp, UserPlus, LogIn, Camera, CreditCard } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import MillDashboard from './pages/MillDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'farmer') navigate('/farmer-dashboard');
      else if (user.role === 'mill') navigate('/mill-dashboard');
    }
  }, [user, navigate]);

  return (
    <>
      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://cdn.pixabay.com/photo/2022/10/15/11/44/paddy-field-7523024_1280.jpg"
            alt="Rice Field Background"
            className="w-full h-full object-cover opacity-60 scale-105 blur-[1px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/40 to-transparent"></div>
        </div>

        {/* Decorative Glowing Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl" />
              
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-16 rounded-[3rem] shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8"
                >
                  <ShieldCheck className="text-primary w-4 h-4" />
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">AI-Powered Trust</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white mb-8">
                  Securing the <span className="text-primary-light">Rice Supply</span> with Intelligence
                </h1>
                <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed max-w-xl">
                  GrainTrust AI bridges the gap between farmers and mills using advanced computer vision and secure Interswitch escrow payments.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/register" className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-center">
                    Get Started Now
                  </Link>
                  <button 
                    onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
                    className="border border-white/20 bg-white/5 backdrop-blur-md px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all text-white text-center"
                  >
                    Watch Demo
                  </button>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10 grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-2xl font-bold text-white">10k+</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Farmers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">99.9%</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">₦5B+</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Processed</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 aspect-square rounded-[4rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src="https://images.unsplash.com/photo-1536633310197-28344c236239?auto=format&fit=crop&q=80&w=1000&h=1000"
                  alt="Rice Field Detail"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Simulated AI Scan Overlay for Landing Page */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <motion.div 
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(0,255,0,1)] z-20"
                  />
                  <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white flex flex-col items-center gap-2 scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ShieldCheck className="text-primary w-8 h-8" />
                    <p className="text-[10px] font-black uppercase tracking-widest">AI Quality Scan</p>
                    <p className="text-xl font-bold text-primary">98.4% Pure</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 bg-white/10 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/20 z-20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <ShieldCheck className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Verified Quality</p>
                    <p className="text-sm text-white/60">AI Inspection Passed</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-10 -right-10 bg-white/10 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/20 z-20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30">
                    <TrendingUp className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Market Value</p>
                    <p className="text-sm text-white/60">+12.5% This Week</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Demo Section */}
      <section id="demo-section" className="bg-black py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">The Process</span>
            <h2 className="text-5xl font-bold text-white mb-8 tracking-tight">How GrainTrust AI Works</h2>
          </div>
          
          <div className="space-y-12">
            {[
              { step: '01', title: 'Farmer Lists Harvest', desc: 'Farmers upload photos of their rice fields. Our AI analyzes the crop health and predicts yield quality.', icon: Wheat },
              { step: '02', title: 'AI Quality Verification', desc: 'Mill owners use our AI scanner to verify the quality of the rice before purchase, ensuring transparency.', icon: Camera },
              { step: '03', title: 'Secure Escrow Payment', desc: 'Funds are held in a secure Interswitch escrow and released instantly upon successful quality verification.', icon: CreditCard }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col md:flex-row gap-6 group bg-white/5 p-8 rounded-3xl border border-white/10"
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-primary/20 font-mono mb-2">{item.step}</span>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block"
            >
              Core Capabilities
            </motion.span>
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Why Choose GrainTrust AI?</h2>
            <p className="text-black/50 text-xl max-w-2xl mx-auto leading-relaxed">
              We've built the most advanced platform to ensure every grain of rice is accounted for and every payment is secure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: 'Secure Escrow', desc: 'Payments are held securely via Interswitch and released only when quality is verified.', icon: ShieldCheck, color: 'primary' },
              { title: 'AI Verification', desc: 'Advanced computer vision analyzes rice quality in real-time with 99% accuracy.', icon: Wheat, color: 'secondary' },
              { title: 'Market Insights', desc: 'Real-time pricing data and supply chain visibility for better decision making.', icon: TrendingUp, color: 'primary' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white p-12 rounded-[3rem] border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-20 h-20 bg-${feature.color}/10 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className={`text-${feature.color} w-10 h-10`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-black/50 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['mill']} />}>
              <Route path="/mill-dashboard" element={<MillDashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;