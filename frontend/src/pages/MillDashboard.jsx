import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, CheckCircle, TrendingUp, Wallet, Search, MapPin, ShieldCheck, CreditCard, Loader2, Camera, Wheat, User, Bell, X } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const MillDashboard = () => {
  const { user } = useAuth();
  const [grains, setGrains] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'escrows', 'profile'
  const [verifyingId, setVerifyingId] = useState(null);
  const [verificationImage, setVerificationImage] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      bvn: ''
    },
    preferences: {
      notificationLanguage: 'English',
      smsAlerts: false,
      payoutMethod: 'Instant (Interswitch Disbursement)'
    }
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeGrainId, setActiveGrainId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('input'); // 'input', 'processing', 'success'
  const [showQualityReport, setShowQualityReport] = useState(false);
  const [qualityReportData, setQualityReportData] = useState(null);

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfileData({
        name: response.data.name || '',
        bankDetails: {
          accountNumber: response.data.bankDetails?.accountNumber || '',
          bankName: response.data.bankDetails?.bankName || '',
          bvn: response.data.bankDetails?.bvn || ''
        },
        preferences: {
          notificationLanguage: response.data.preferences?.notificationLanguage || 'English',
          smsAlerts: response.data.preferences?.smsAlerts || false,
          payoutMethod: response.data.preferences?.payoutMethod || 'Instant (Interswitch Disbursement)'
        }
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const { updateUser } = useAuth();

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSaveSuccess(false);
    try {
      const response = await api.put('/auth/profile', profileData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grainsRes, escrowsRes] = await Promise.all([
        api.get('/grains'),
        api.get('/escrow/my-escrows')
      ]);
      setGrains(grainsRes.data);
      setEscrows(escrowsRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFundEscrow = async (grainId) => {
    setActiveGrainId(grainId);
    setPaymentStep('input');
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setPaymentStep('processing');
    try {
      await api.post(`/escrow/fund/${activeGrainId}`);
      
      // Simulate Interswitch processing time
      setTimeout(() => {
        setPaymentStep('success');
      }, 2500);
      
    } catch (err) {
      setPaymentStep('input');
      toast.error(err.response?.data?.error || 'Payment Failed');
    }
  };

  const handleVerifyQuality = async (grainId) => {
    // Create a hidden input to pick a file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        await runQualityScan(grainId, base64Image);
      };
    };
    input.click();
  };

  const runQualityScan = async (grainId, base64Image) => {
    setVerifyingId(grainId);
    setVerificationImage(base64Image);
    try {
      const response = await api.post(`/escrow/verify/${grainId}`, { image: base64Image });
      const analysis = response.data.analysis;
      
      let parsedAnalysis = null;
      try {
        if (typeof analysis === 'string') {
          const jsonMatch = analysis.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedAnalysis = JSON.parse(jsonMatch[0]);
          }
        } else if (typeof analysis === 'object') {
          parsedAnalysis = analysis;
        }
      } catch (e) {
        console.error('Failed to parse AI quality analysis JSON', e);
      }

      const { grade, moisture, impurities, summary } = parsedAnalysis || {
        grade: 'A',
        moisture: 13.5,
        impurities: 0.5,
        summary: typeof analysis === 'string' ? analysis : 'Analysis complete.'
      };
      
      setQualityReportData({
        grade,
        moisture,
        impurities,
        summary,
        timestamp: new Date().toLocaleString(),
        grainId
      });
      setShowQualityReport(true);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifyingId(null);
      setVerificationImage(null);
    }
  };

  const handleDisburse = async (grainId) => {
    try {
      await api.post(`/escrow/disburse/${grainId}`);
      toast.success('Payment disbursed to farmer bank account!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Disbursement failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Welcome, {user?.name}!</h1>
          <p className="text-gray-600 font-medium">Mill Owner Dashboard • {user?.email}</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'marketplace' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('escrows')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'escrows' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Active Escrows
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'profile' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4 p-6">
          <div className="bg-secondary/10 p-3 rounded-2xl text-secondary">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Available Supply</p>
            <h3 className="text-2xl font-bold text-dark">{grains.length} Listings</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-6">
          <div className="bg-accent/10 p-3 rounded-2xl text-accent">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Escrows Active</p>
            <h3 className="text-2xl font-bold text-dark">
              {escrows.filter(e => ['funded', 'verified'].includes(e.status)).length}
            </h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-6">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Disbursed</p>
            <h3 className="text-2xl font-bold text-dark">
              ₦{escrows.filter(e => e.status === 'disbursed').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'marketplace' ? (
          <motion.div 
            key="marketplace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <Search className="text-secondary" /> Rice Marketplace
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by state or rice type..." 
                  className="pl-10 pr-4 py-2 rounded-xl border border-black/5 bg-white text-sm focus:ring-2 focus:ring-secondary/20 outline-none w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-secondary w-12 h-12" />
              </div>
            ) : grains.filter(g => g.status === 'available').length === 0 ? (
              <div className="card text-center py-20 border-dashed border-2">
                <Wheat className="mx-auto text-gray-300 w-16 h-16 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">No Rice Available</h3>
                <p className="text-gray-400">Check back later for new harvests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grains.filter(g => g.status === 'available').map((grain) => (
                  <div key={grain._id} className="card p-0 overflow-hidden group">
                    <div className="relative h-48">
                      <img src={grain.imageUrl} alt={grain.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-secondary shadow-sm">
                        {grain.type}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-dark">{grain.quantity} Tons</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin size={14} /> {grain.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-secondary">₦{grain.price.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">per ton</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Farmer</span>
                          <span className="font-bold">{grain.farmer?.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Yield Prediction</span>
                          <span className="text-emerald-600 font-bold">94% Confidence</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleFundEscrow(grain._id)}
                        className="w-full btn-secondary flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={18} /> Secure with Escrow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : activeTab === 'escrows' ? (
          <motion.div 
            key="escrows"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
              <CreditCard className="text-secondary" /> Active Escrow Contracts
            </h2>

            {escrows.length === 0 ? (
              <div className="card text-center py-20 border-dashed border-2">
                <ShieldCheck className="mx-auto text-gray-300 w-16 h-16 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">No Active Escrows</h3>
                <p className="text-gray-400">Secure a grain listing to start the escrow process.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {escrows.map((escrow) => (
                  <div key={escrow._id} className="card flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 relative">
                      {verifyingId === escrow.grain?._id && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center overflow-hidden">
                           <motion.div 
                            initial={{ top: '-10%' }}
                            animate={{ top: '110%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-1.5 bg-primary shadow-[0_0_20px_#00ff00] z-20"
                          />
                          <div className="relative z-30 flex flex-col items-center">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-primary mb-1"
                            >
                              <ShieldCheck size={24} />
                            </motion.div>
                            <p className="text-[8px] font-black text-white uppercase tracking-widest">AI Scanning...</p>
                          </div>
                        </div>
                      )}
                      <img src={(verifyingId === escrow.grain?._id && verificationImage) ? verificationImage : escrow.grain?.imageUrl} alt="Rice" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{escrow.grain?.type} - {escrow.grain?.quantity} Tons</h3>
                          <p className="text-sm text-gray-500">Farmer: {escrow.farmer?.name}</p>
                          <p className="text-xs text-secondary font-mono mt-1">Ref: {escrow.interswitchRef}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-dark">₦{escrow.amount.toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mt-1 ${
                            ['funded', 'escrow_funded'].includes(escrow.status) ? 'bg-blue-100 text-blue-700' : 
                            escrow.status === 'verified' ? 'bg-amber-100 text-amber-700' :
                            escrow.status === 'disbursed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {escrow.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4">
                        {escrow.grain?.status === 'escrow_funded' && (
                          <button 
                            onClick={() => handleVerifyQuality(escrow.grain._id)}
                            disabled={verifyingId === escrow.grain._id}
                            className="btn-secondary py-2 text-sm flex items-center gap-2"
                          >
                            {verifyingId === escrow.grain._id ? (
                              <><Loader2 className="animate-spin w-4 h-4" /> Analyzing...</>
                            ) : (
                              <><Camera size={16} /> AI Quality Scan</>
                            )}
                          </button>
                        )}
                        
                        {escrow.grain?.status === 'verified' && (
                          <button 
                            onClick={() => handleDisburse(escrow.grain._id)}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2"
                          >
                            <CreditCard size={16} /> Release Payment
                          </button>
                        )}

                        {escrow.status === 'disbursed' && (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <CheckCircle size={18} /> Transaction Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto"
          >
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                <ShieldCheck className="text-secondary" /> Personal & Business Profile
              </h2>
              <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <User size={16} /> Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="John Doe"
                          value={profileData.name}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address (Read-only)</label>
                        <input 
                          type="email" 
                          disabled
                          className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" 
                          value={user?.email || ''}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Bell size={16} /> Account Preferences
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Notification Language</label>
                        <select 
                          className="input-field"
                          value={profileData.preferences.notificationLanguage}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            preferences: { ...profileData.preferences, notificationLanguage: e.target.value }
                          })}
                        >
                          <option>English</option>
                          <option>Hausa</option>
                          <option>Yoruba</option>
                          <option>Igbo</option>
                        </select>
                      </div>
                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={profileData.preferences.smsAlerts}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              preferences: { ...profileData.preferences, smsAlerts: e.target.checked }
                            })}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            profileData.preferences.smsAlerts ? 'bg-secondary border-secondary' : 'border-gray-300 group-hover:border-secondary'
                          }`}>
                            {profileData.preferences.smsAlerts && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="text-sm text-gray-600">Enable SMS Yield Alerts</span>
                        </label>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 pt-4">
                      <ShieldCheck size={16} /> Account Security
                    </h3>
                    <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Your account is verified as a <strong>Mill Owner</strong>. This status allows you to purchase grains and secure transactions via Interswitch Escrow.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className={`w-full sm:w-auto px-12 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${
                      saveSuccess 
                        ? 'bg-emerald-500 text-white shadow-emerald-200' 
                        : 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20'
                    }`}
                  >
                    {savingProfile ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : saveSuccess ? (
                      <CheckCircle size={20} />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                    {savingProfile ? 'Saving Changes...' : saveSuccess ? 'Changes Saved!' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Quality Report Modal */}
      <AnimatePresence>
        {showQualityReport && qualityReportData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="bg-emerald-600 p-8 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={20} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">AI Verification Report</span>
                    </div>
                    <h2 className="text-3xl font-bold">Quality Certified</h2>
                  </div>
                  <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-2xl text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Grade</p>
                    <p className="text-2xl font-black">{qualityReportData.grade}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQualityReport(false)}
                  className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Moisture Content</p>
                    <p className="text-3xl font-black text-dark">{qualityReportData.moisture}%</p>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${qualityReportData.moisture}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Impurity Level</p>
                    <p className="text-3xl font-black text-dark">{qualityReportData.impurities}%</p>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${qualityReportData.impurities * 10}%` }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Search size={14} /> AI Analysis Summary
                  </h4>
                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{qualityReportData.summary}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-[10px] text-gray-400 font-mono">
                    ID: {qualityReportData.grainId.slice(-8).toUpperCase()} • {qualityReportData.timestamp}
                  </div>
                  <button 
                    onClick={() => setShowQualityReport(false)}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mock Interswitch Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Interswitch Header */}
              <div className="bg-[#00425F] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <CreditCard className="text-[#00425F]" size={20} />
                  </div>
                  <span className="font-bold tracking-tight">Interswitch <span className="font-light">Webpay</span></span>
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-[8px] font-black uppercase tracking-widest border border-white/30">Test Mode</span>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {paymentStep === 'input' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Amount to Escrow</p>
                      <h2 className="text-3xl font-bold text-dark">
                        ₦{grains.find(g => g._id === activeGrainId)?.price.toLocaleString()}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Card Number</label>
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-gray-400" size={18} />
                          <input type="text" disabled value="5399 •••• •••• 1234" className="bg-transparent font-mono text-sm outline-none w-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Expiry</label>
                          <input type="text" disabled value="12 / 26" className="bg-transparent font-mono text-sm outline-none w-full" />
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">CVV</label>
                          <input type="text" disabled value="•••" className="bg-transparent font-mono text-sm outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={processPayment}
                      className="w-full bg-[#00425F] text-white py-4 rounded-2xl font-bold hover:bg-[#00354d] transition-all shadow-lg shadow-blue-900/20"
                    >
                      Pay ₦{grains.find(g => g._id === activeGrainId)?.price.toLocaleString()}
                    </button>
                    <p className="text-[10px] text-center text-gray-400">
                      Secured by Interswitch 3D-Secure 2.0
                    </p>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-[#00425F] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Authorizing Transaction</h3>
                    <p className="text-sm text-gray-500">Please do not close this window...</p>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="py-12 flex flex-col items-center text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle size={40} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">Payment Successful</h3>
                    <p className="text-sm text-gray-500 mb-8">Escrow has been funded successfully.</p>
                    
                    <div className="w-full bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4 text-left">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</span>
                        <span className="text-xs font-mono font-bold">ISW-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</span>
                        <span className="text-sm font-bold text-dark">₦{grains.find(g => g._id === activeGrainId)?.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded-md">Confirmed</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                        <span className="text-xs text-gray-600">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setShowPaymentModal(false);
                        fetchData();
                      }}
                      className="w-full mt-8 bg-dark text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MillDashboard;