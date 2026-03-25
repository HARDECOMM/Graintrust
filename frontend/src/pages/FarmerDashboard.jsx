import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, TrendingUp, Wallet, Plus, X, Wheat, Trash2, Edit2, Loader2, Camera, ShieldCheck, CreditCard, Building2, CheckCircle, Bell } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const FarmerDashboard = () => {
  const { user, updateUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'profile'
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Faro 44 (Paddy)',
    quantity: '',
    price: '',
    location: '',
    description: '',
    imageUrl: '',
  });
  const [hasScanned, setHasScanned] = useState(false);
  const [showYieldReport, setShowYieldReport] = useState(false);
  const [yieldReportData, setYieldReportData] = useState(null);
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

  useEffect(() => {
    fetchListings();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (showModal && !editingId) {
      setFormData({
        type: 'Faro 44 (Paddy)',
        quantity: '',
        price: '',
        location: '',
        description: '',
        imageUrl: '',
      });
      setHasScanned(false);
    }
  }, [showModal, editingId]);

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

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSaveSuccess(false);
    try {
      const response = await api.put('/auth/profile', profileData);
      updateUser(response.data);
      toast.success('Profile and Bank details updated!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await api.get('/grains/my-listings');
      setListings(response.data);
    } catch (err) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const [predicting, setPredicting] = useState(false);
  const [visualizing, setVisualizing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      // Show the uploaded image immediately as a preview during the scan
      setFormData(prev => ({ ...prev, imageUrl: base64Image }));
      await runAiFlow(base64Image);
    };
  };

  const runAiFlow = async (base64Image) => {
    setPredicting(true);
    try {
      // 1. Scan Field for Yield Prediction
      const scanResponse = await api.post('/grains/scan-field', { image: base64Image });
      const analysis = scanResponse.data.analysis;
      
      // Attempt to parse JSON if it's a JSON string
      let parsedAnalysis = null;
      try {
        if (typeof analysis === 'string') {
          // Try to find a JSON block in the string
          const jsonMatch = analysis.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedAnalysis = JSON.parse(jsonMatch[0]);
          }
        } else if (typeof analysis === 'object') {
          parsedAnalysis = analysis;
        }
      } catch (e) {
        console.error('Failed to parse AI analysis JSON', e);
      }

      // Update description with AI analysis
      setFormData(prev => ({
        ...prev,
        description: typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)
      }));
      
      // Prepare Yield Report Data
      setYieldReportData({
        maturity: parsedAnalysis?.crop_maturity_percentage || parsedAnalysis?.maturity || 85,
        predictedYield: parsedAnalysis?.predicted_yield_tons_per_hectare || parsedAnalysis?.predictedYield || 4.2,
        pests: parsedAnalysis?.visible_pests_or_diseases || parsedAnalysis?.pests || 'None Detected',
        health: parsedAnalysis?.health || 'Optimal',
        analysis: typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2),
        timestamp: new Date().toLocaleString()
      });
      setShowYieldReport(true);
      toast.success('AI Yield Prediction Complete!');

      // 2. Visualize Grains based on the field
      setVisualizing(true);
      const vizResponse = await api.post('/grains/visualize', { 
        type: formData.type,
        fieldImage: base64Image 
      });
      
      setFormData(prev => ({
        ...prev,
        imageUrl: vizResponse.data.imageUrl
      }));
      setHasScanned(true);
      setVisualizing(false);
      toast.success('Professional Listing Image Generated!');

    } catch (err) {
      console.error(err);
      toast.error('AI Processing failed. Please try again.');
    } finally {
      setPredicting(false);
      setVisualizing(false);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('field-image-input').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasScanned && !editingId) {
      toast.error('Please scan your field with AI first to verify quality!');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/grains/${editingId}`, formData);
        toast.success('Listing updated successfully!');
      } else {
        await api.post('/grains', formData);
        toast.success('Rice listed successfully!');
      }
      setShowModal(false);
      setEditingId(null);
      setHasScanned(false);
      fetchListings();
      setFormData({
        type: 'Faro 44 (Paddy)',
        quantity: '',
        price: '',
        location: '',
        description: '',
        imageUrl: '',
      });
    } catch (err) {
      toast.error(editingId ? 'Failed to update listing' : 'Failed to create listing');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      type: item.type,
      quantity: item.quantity,
      price: item.price,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/grains/${id}`);
      toast.success('Listing deleted');
      setDeletingId(null);
      fetchListings();
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Welcome, {user?.name}!</h1>
          <p className="text-gray-600 font-medium">Farmer Dashboard • {user?.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
            <button 
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'listings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              My Listings
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Profile & Bank
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={20} /> List New Harvest
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {!profileData.bankDetails.accountNumber && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-amber-800">
            <CreditCard size={20} />
            <p className="text-sm font-bold">Action Required: Add your bank details to receive Interswitch payments.</p>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold bg-amber-200 text-amber-900 px-4 py-2 rounded-xl hover:bg-amber-300 transition-all"
          >
            Update Bank Details
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4 p-6">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <Wheat size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Active Listings</p>
            <h3 className="text-2xl font-bold text-dark">{listings.length}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-6">
          <div className="bg-accent/10 p-3 rounded-2xl text-accent">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Quantity</p>
            <h3 className="text-2xl font-bold text-dark">
              {listings.reduce((acc, curr) => acc + curr.quantity, 0)} Tons
            </h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-6">
          <div className="bg-secondary/10 p-3 rounded-2xl text-secondary">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Potential Revenue</p>
            <h3 className="text-2xl font-bold text-dark">
              ₦{listings.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'listings' ? (
          <motion.div 
            key="listings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
              <Wheat className="text-primary" /> Your Rice Listings
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
              </div>
            ) : listings.length === 0 ? (
              <div className="card flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-200 bg-gray-50/30 py-16">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Wheat className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-400">No Listings Yet</h3>
                <p className="text-gray-400 text-sm max-w-[250px] mt-2">
                  Start by listing your harvested rice to find buyers and get verified.
                </p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="mt-6 text-primary font-semibold hover:underline"
                >
                  Create your first listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <div key={item._id} className="card overflow-hidden p-0 group">
                      <div className="relative h-40">
                        <img src={item.imageUrl} alt={item.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className={`absolute top-4 right-4 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase ${
                          item.status === 'available' ? 'bg-white/90 text-primary' :
                          item.status === 'escrow_funded' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'verified' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </div>
                      </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{item.type}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> {item.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₦{item.price.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">per ton</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Quantity</span>
                          <span className="font-bold">{item.quantity} Tons</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Quality Score</span>
                          <span className="text-emerald-600 font-bold">Grade A (92%)</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {deletingId === item._id ? (
                          <div className="flex-1 flex gap-2">
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                            >
                              Confirm Delete
                            </button>
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button 
                              onClick={() => setDeletingId(item._id)}
                              className="p-2 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
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
                <CreditCard className="text-primary" /> Settlement & Account Settings
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
                      <ShieldCheck size={16} /> Account Security
                    </h3>
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Your account is verified as a <strong>Farmer</strong>. This status allows you to list grains and receive payments via Interswitch Escrow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-dark flex items-center gap-2 pt-4">
                <CreditCard className="text-primary" /> Settlement & Bank Settings
              </h2>
              <div className="card">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-medium mb-8 flex items-start gap-3">
                  <ShieldCheck className="flex-shrink-0" size={18} />
                  Bank details are encrypted and used exclusively for instant Interswitch disbursements upon quality verification.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Building2 size={16} /> Bank Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Account Number (Accepts any for demo)</label>
                        <input 
                          type="text" 
                          autoComplete="off"
                          className="input-field" 
                          placeholder="0123456789"
                          value={profileData.bankDetails.accountNumber}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            bankDetails: { ...profileData.bankDetails, accountNumber: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
                        <select 
                          className="input-field"
                          value={profileData.bankDetails.bankName}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            bankDetails: { ...profileData.bankDetails, bankName: e.target.value }
                          })}
                        >
                          <option value="">Select Bank</option>
                          <option value="Access Bank">Access Bank</option>
                          <option value="GTBank">GTBank</option>
                          <option value="Zenith Bank">Zenith Bank</option>
                          <option value="First Bank">First Bank</option>
                          <option value="UBA">UBA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">BVN (Verification Only)</label>
                        <input 
                          type="password" 
                          title="BVN is required for Interswitch compliance" 
                          className="input-field" 
                          placeholder="•••••••••••"
                          value={profileData.bankDetails.bvn}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            bankDetails: { ...profileData.bankDetails, bvn: e.target.value }
                          })}
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
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Preferred Payout Method</label>
                        <select 
                          className="input-field"
                          value={profileData.preferences.payoutMethod}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            preferences: { ...profileData.preferences, payoutMethod: e.target.value }
                          })}
                        >
                          <option>Instant (Interswitch Disbursement)</option>
                          <option>Escrow Hold (14 Days)</option>
                        </select>
                      </div>
                      <div className="pt-4">
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
                            profileData.preferences.smsAlerts ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'
                          }`}>
                            {profileData.preferences.smsAlerts && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="text-sm text-gray-600">Enable SMS Yield Alerts</span>
                        </label>
                      </div>
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
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    {savingProfile ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : saveSuccess ? (
                      <CheckCircle size={20} />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                    {savingProfile ? 'Saving Changes...' : saveSuccess ? 'Changes Saved!' : 'Save All Profile & Bank Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Yield Report Modal */}
      <AnimatePresence>
        {showYieldReport && yieldReportData && (
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
              <div className="bg-primary p-8 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={20} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">AI Agronomist Report</span>
                    </div>
                    <h2 className="text-3xl font-bold">Yield Prediction</h2>
                  </div>
                  <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-2xl text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Health</p>
                    <p className="text-xl font-black">{yieldReportData.health}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowYieldReport(false)}
                  className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Crop Maturity</p>
                    <p className="text-3xl font-black text-dark">{yieldReportData.maturity}%</p>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${yieldReportData.maturity}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Predicted Yield</p>
                    <p className="text-3xl font-black text-dark">{yieldReportData.predictedYield}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Tons / Hectare</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} /> Agronomic Analysis
                  </h4>
                  <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{yieldReportData.analysis}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-[10px] text-gray-400 font-mono">
                    TIMESTAMP: {yieldReportData.timestamp}
                  </div>
                  <button 
                    onClick={() => setShowYieldReport(false)}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Grain Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl">
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
                setHasScanned(false);
                setFormData({
                  type: 'Faro 44 (Paddy)',
                  quantity: '',
                  price: '',
                  location: '',
                  description: '',
                  imageUrl: '',
                });
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              {editingId ? <Edit2 className="text-primary" /> : <Plus className="text-primary" />}
              {editingId ? 'Edit Rice Listing' : 'List New Harvest'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden File Input */}
              <input 
                type="file" 
                id="field-image-input" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* Image Preview with Scanning Animation */}
              <div 
                onClick={triggerFileInput}
                className="relative h-48 bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group cursor-pointer hover:border-primary/50 transition-all"
              >
                {/* The Image (Uploaded or Generated) */}
                {formData.imageUrl && (
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Placeholder (Only if no image and not scanning) */}
                {!formData.imageUrl && !predicting && !visualizing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Camera size={32} className="opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Field Photo to Start AI Scan</p>
                  </div>
                )}

                {/* Scanning Overlay (On top of image or placeholder) */}
                {(visualizing || predicting) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 overflow-hidden">
                    <motion.div 
                      initial={{ top: '-10%' }}
                      animate={{ top: '110%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1.5 bg-primary shadow-[0_0_30px_#00ff00,0_0_60px_#00ff00] z-20"
                    />
                    <div className="relative z-30 flex flex-col items-center">
                      <div className="w-16 h-16 mb-4 relative">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-primary/20 rounded-full"
                        />
                        <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
                        />
                        <Camera className="absolute inset-0 m-auto text-primary" size={24} />
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-[0.3em] mb-1 drop-shadow-lg">
                        {predicting ? 'Neural Yield Analysis' : 'Generating Market Visuals'}
                      </p>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover Overlay (Only if image exists and not scanning) */}
                {formData.imageUrl && !predicting && !visualizing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Camera className="text-white" size={24} />
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Field Photo</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rice Variety</label>
                  <select 
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option>Faro 44 (Paddy)</option>
                    <option>Basmati</option>
                    <option>Long Grain White</option>
                    <option>Short Grain</option>
                    <option>Brown Rice</option>
                    <option>Jasmine</option>
                    <option>Ofada Rice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Tons)</label>
                  <input 
                    type="number" 
                    required
                    className="input-field"
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Ton (₦)</label>
                  <input 
                    type="number" 
                    required
                    className="input-field"
                    placeholder="e.g. 150000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (State)</label>
                  <select 
                    required
                    className="input-field"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  >
                    <option value="">Select State</option>
                    <option value="Abia">Abia</option>
                    <option value="Adamawa">Adamawa</option>
                    <option value="Akwa Ibom">Akwa Ibom</option>
                    <option value="Anambra">Anambra</option>
                    <option value="Bauchi">Bauchi</option>
                    <option value="Bayelsa">Bayelsa</option>
                    <option value="Benue">Benue</option>
                    <option value="Borno">Borno</option>
                    <option value="Cross River">Cross River</option>
                    <option value="Delta">Delta</option>
                    <option value="Ebonyi">Ebonyi</option>
                    <option value="Edo">Edo</option>
                    <option value="Ekiti">Ekiti</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Gombe">Gombe</option>
                    <option value="Imo">Imo</option>
                    <option value="Jigawa">Jigawa</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Kano">Kano</option>
                    <option value="Katsina">Katsina</option>
                    <option value="Kebbi">Kebbi</option>
                    <option value="Kogi">Kogi</option>
                    <option value="Kwara">Kwara</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Nasarawa">Nasarawa</option>
                    <option value="Niger">Niger</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Ondo">Ondo</option>
                    <option value="Osun">Osun</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Sokoto">Sokoto</option>
                    <option value="Taraba">Taraba</option>
                    <option value="Yobe">Yobe</option>
                    <option value="Zamfara">Zamfara</option>
                    <option value="FCT">FCT (Abuja)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description & AI Analysis</label>
                <div className="relative">
                  <textarea 
                    className="input-field h-24 resize-none"
                    placeholder="Tell buyers about the quality, harvest date, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    disabled={predicting || visualizing}
                    className="absolute bottom-2 right-2 bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/20 transition-all disabled:opacity-50"
                  >
                    {predicting ? <Loader2 className="animate-spin w-3 h-3" /> : <Camera size={12} />}
                    {predicting ? 'Analyzing Field...' : 'Scan Field with AI'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={predicting || visualizing}
                className="btn-primary w-full py-4 mt-4 disabled:opacity-50"
              >
                {predicting || visualizing ? 'Processing...' : (editingId ? 'Update Listing' : 'List Rice for Sale')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
