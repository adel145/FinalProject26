import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { 
  Home, Search, MessageSquare, User, MapPin, Bell, 
  ChevronLeft, ShieldCheck, Camera, Image as ImageIcon, 
  Globe, LogOut, CheckCircle2, Star, Clock, AlertTriangle,
  X, Send, Mic, Map as MapIcon, List, Menu, Filter, ArrowUpDown, Phone, Share2, Heart, CreditCard, History, Settings
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import { MOCK_PROS, CATEGORIES_DATA, MOCK_CONTRACTS, STORIES_DATA } from './services/mockData';
import { generateAIResponse } from './services/geminiService';
import { TRANSLATIONS } from './services/translations';
import { authService } from './services/authService';
import { useStore } from './services/store';
import { ChatMessage, Professional, UserRole, GeoLocation, Quote } from './types';

// --- Fix Leaflet Icons ---
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- Components ---

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-primary-500 flex items-center justify-center z-50">
        <div className="text-center text-white">
            <h1 className="text-4xl font-black mb-4">מקצוען</h1>
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
    </div>
);

const StoryViewer = ({ story, onClose }: { story: any, onClose: () => void }) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(timer);
                    onClose();
                    return 100;
                }
                return p + 1;
            });
        }, story.duration * 10);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
        >
            <div className="relative w-full max-w-md h-full md:h-[80vh] bg-black">
                <div className="absolute top-0 left-0 right-0 z-10 p-2">
                     <div className="h-1 bg-gray-600 w-full rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all ease-linear" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                
                <img src={story.imageUrl} className="w-full h-full object-cover md:rounded-xl" alt="Story" />
                
                <button onClick={onClose} className="absolute top-6 right-4 text-white bg-black/20 p-2 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                    <X size={24} />
                </button>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white md:rounded-b-xl">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-full border-2 border-primary-500 overflow-hidden">
                             <img src={story.pro?.avatar} alt="" className="w-full h-full object-cover"/>
                         </div>
                         <span className="font-bold">{story.pro?.name}</span>
                    </div>
                    <h3 className="text-xl font-bold">{story.title}</h3>
                </div>
            </div>
        </motion.div>
    );
};

const ProCard = ({ pro, onClick, featured = false }: { pro: Professional, onClick: () => void, featured?: boolean }) => (
    <div onClick={onClick} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 active:scale-[0.98] transition-all hover:shadow-md cursor-pointer h-full ${featured ? 'border-primary-200 ring-2 ring-primary-50' : ''}`}>
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden relative">
            <img src={pro.avatar} alt={pro.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            {pro.isAvailable && <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
        </div>
        <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-secondary text-lg">{pro.name}</h4>
                <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    {pro.rating} <Star size={10} fill="currentColor" />
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{pro.description}</p>
            <div className="flex items-center gap-2 flex-wrap mt-auto">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">₪{pro.hourlyRate}/שעה</span>
                {pro.verified && <span className="text-[10px] text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100">מאומת</span>}
                {pro.distance && <span className="text-[10px] text-gray-400">{pro.distance.toFixed(1)} ק״מ</span>}
            </div>
        </div>
    </div>
);

// --- Pages ---

const AuthPage = () => {
    const { user, setUser, setLanguage, language } = useStore();
    const [step, setStep] = useState<2|3>(2);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [role, setRole] = useState<UserRole>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef<(HTMLInputElement|null)[]>([]);

    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;

    const handleSendCode = async () => {
        if (phone.length < 9) return;
        setLoading(true);
        try {
            await authService.requestOtp(phone);
            setStep(3);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) return;
        setLoading(true);
        try {
            await authService.verifyOtp(phone, code, role, language);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8" dir={language === 'en' ? 'ltr' : 'rtl'}>
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 md:p-10 animate-slide-up border border-gray-100">
                <h1 className="text-5xl font-black text-primary-500 mb-8 text-center tracking-tight">מקצוען</h1>
                <h2 className="text-3xl font-bold mb-2 text-right">{step === 2 ? t('login_prompt') : t('verify_code')}</h2>
                <p className="text-gray-500 mb-8 text-right">{step === 3 ? `${t('code_sent_to')} ${phone}` : t('subtitle')}</p>

                {step === 2 ? (
                    <div className="space-y-6">
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="050-0000000" 
                            className="w-full text-3xl font-bold tracking-widest border-b-2 border-gray-200 py-4 focus:border-primary-500 outline-none text-center bg-transparent transition-colors"
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setRole('user')} className={`p-4 rounded-xl border-2 transition-all ${role === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-100 hover:border-gray-200'}`}>{t('role_user')}</button>
                            <button onClick={() => setRole('professional')} className={`p-4 rounded-xl border-2 transition-all ${role === 'professional' ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-100 hover:border-gray-200'}`}>{t('role_pro')}</button>
                        </div>

                        <button onClick={handleSendCode} disabled={loading || phone.length < 9} className="w-full bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 disabled:opacity-50 transition-all transform active:scale-95">
                            {loading ? '...' : t('continue')}
                        </button>
                        
                        <div className="flex justify-center gap-4 mt-6 text-sm text-gray-400">
                            <button onClick={() => setLanguage('en')} className="hover:text-primary-500 transition-colors">English</button>
                            <span>|</span>
                            <button onClick={() => setLanguage('he')} className="font-bold text-primary-500">עברית</button>
                            <span>|</span>
                            <button onClick={() => setLanguage('ar')} className="hover:text-primary-500 transition-colors">العربية</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between gap-2" dir="ltr">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { otpRefs.current[i] = el; }}
                                    type="tel"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    className="w-12 h-14 border-2 border-gray-200 rounded-lg text-center text-2xl font-bold focus:border-primary-500 outline-none transition-colors"
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                        <button onClick={handleVerify} disabled={loading} className="w-full bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all transform active:scale-95">
                            {loading ? '...' : t('continue')}
                        </button>
                        <button onClick={() => setStep(2)} className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors">חזור</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useStore();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;
    
    // In a real app, this would fetch from backend. For now, find in mock.
    const pro = MOCK_PROS.find(p => p.id === id);

    if (!pro) return <div className="p-10 text-center">Professional not found</div>;

    return (
        <div className="pb-24 animate-fade-in max-w-4xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-3xl md:shadow-lg md:my-4 md:border md:border-gray-100 overflow-hidden" dir={language === 'en' ? 'ltr' : 'rtl'}>
            {/* Header Image */}
            <div className="relative h-64 md:h-80 w-full">
                <img src={pro.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button onClick={() => navigate(-1)} className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors">
                    <ChevronLeft size={24} className={language === 'he' ? 'rotate-180' : ''} />
                </button>
                <div className="absolute top-4 left-4 flex gap-2">
                     <button className="bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors"><Share2 size={20}/></button>
                     <button className="bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors"><Heart size={20}/></button>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-50">
                    <div className="w-24 h-24 rounded-2xl p-1 bg-white shadow-sm -mt-16 mb-3">
                        <img src={pro.avatar} alt={pro.name} className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <h1 className="text-2xl font-black mb-1">{pro.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <span>{pro.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                            <span>{pro.rating}</span>
                            <Star size={12} fill="currentColor" />
                        </div>
                        <span>•</span>
                        <span>({pro.reviewCount} {t('reviews')})</span>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-center mb-6">
                        {pro.verified && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1"><CheckCircle2 size={12}/> {t('verified')}</span>}
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">{t('starting_at')} ₪{pro.hourlyRate}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex w-full gap-3 mb-6">
                        <button className="flex-1 bg-primary-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                             <Phone size={18} /> {t('contact_pro')}
                        </button>
                        <button onClick={() => navigate('/chat')} className="flex-1 bg-gray-100 text-secondary py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                             <MessageSquare size={18} /> Chat
                        </button>
                    </div>

                    <div className="w-full text-right space-y-6">
                        <section>
                            <h3 className="font-bold text-lg mb-2">{t('about')}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{pro.description}</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg mb-2">{t('gallery')}</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {pro.gallery.length > 0 ? pro.gallery.map((img, i) => (
                                    <img key={i} src={img} className="rounded-lg h-24 w-full object-cover border border-gray-100" />
                                )) : <p className="text-gray-400 text-sm col-span-3 text-center py-4 bg-gray-50 rounded-xl">No photos available</p>}
                            </div>
                        </section>

                         <section>
                            <h3 className="font-bold text-lg mb-2">{t('reviews')}</h3>
                             <div className="space-y-3">
                                 {(pro as any).reviews?.map((review: any) => (
                                     <div key={review.id} className="bg-gray-50 p-3 rounded-xl">
                                         <div className="flex justify-between items-center mb-1">
                                             <span className="font-bold text-sm">{review.user}</span>
                                             <div className="flex gap-0.5 text-yellow-400">
                                                 {[...Array(5)].map((_,i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""}/>)}
                                             </div>
                                         </div>
                                         <p className="text-xs text-gray-600 mb-1">{review.text}</p>
                                         <span className="text-[10px] text-gray-400 block text-left">{review.date}</span>
                                     </div>
                                 ))}
                             </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserProfilePage = () => {
    const { user, setUser, logout, language, setLanguage, history } = useStore();
    const navigate = useNavigate();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');

    const handleSave = () => {
        if (user) {
            setUser({ ...user, name });
            setIsEditing(false);
        }
    };

    return (
        <div className="pb-24 pt-6 max-w-4xl mx-auto px-4 md:px-0" dir={language === 'en' ? 'ltr' : 'rtl'}>
             <div className="md:bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-100 md:p-8">
                <h1 className="text-3xl font-black mb-8 px-2 md:px-0">{t('profile')}</h1>
                
                <div className="flex items-center gap-4 mb-8 px-2 md:px-0">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                        <img src={user?.avatar} alt="" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        {isEditing ? (
                            <input value={name} onChange={e => setName(e.target.value)} className="border-b border-primary-500 outline-none font-bold text-xl bg-transparent mb-1" autoFocus/>
                        ) : (
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                        )}
                        <p className="text-gray-500 text-sm">{user?.phone}</p>
                    </div>
                    <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="mr-auto text-primary-500 font-bold text-sm">
                        {isEditing ? t('save') : t('edit_profile')}
                    </button>
                </div>

                <div className="space-y-2">
                    {/* Menu Items */}
                    {[
                        { icon: CreditCard, label: t('payment_methods') },
                        { icon: MapPin, label: t('saved_addresses') },
                        { icon: Bell, label: t('notifications') },
                        { icon: Globe, label: t('change_language'), action: () => setLanguage(language === 'he' ? 'en' : 'he'), value: language === 'he' ? 'עברית' : 'English' },
                        { icon: History, label: t('history_log') },
                    ].map((item, i) => (
                        <div key={i} onClick={item.action} className="bg-white md:bg-gray-50 p-4 rounded-xl flex items-center justify-between cursor-pointer active:bg-gray-100 transition-colors border border-gray-50 md:border-transparent">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
                                    <item.icon size={20} />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.value && <span className="text-sm text-gray-400">{item.value}</span>}
                                <ChevronLeft size={16} className={`text-gray-300 ${language === 'he' ? '' : 'rotate-180'}`} />
                            </div>
                        </div>
                    ))}
                    
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 mt-8 font-medium hover:bg-red-100 transition-colors">
                        <LogOut size={20} />
                        {t('log_out')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const { language, user } = useStore();
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;

    const stories = STORIES_DATA.map(s => {
        const pro = MOCK_PROS.find(p => p.stories.some(st => st.id === s.id));
        return { ...s, pro };
    });

    return (
        <div className="pb-24 pt-6 md:pt-10 animate-fade-in max-w-7xl mx-auto w-full px-4 md:px-8" dir={language === 'en' ? 'ltr' : 'rtl'}>
            
            {/* Desktop Header Info */}
            <div className="hidden md:flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
                 <div>
                     <h2 className="text-3xl font-black text-secondary">שלום, {user?.name.split(' ')[0]} 👋</h2>
                     <p className="text-gray-500 mt-1">מה נחפש עבורך היום?</p>
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                         <p className="text-xs text-gray-400 mb-1">המיקום שלי</p>
                         <div className="flex items-center gap-1 text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-full">
                            <MapPin size={16} />
                            <span>{user?.location?.address || "תל אביב-יפו"}</span>
                        </div>
                     </div>
                 </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden px-0 mb-6 flex justify-between items-center">
                <div onClick={() => navigate('/search')} className="cursor-pointer">
                    <p className="text-xs text-gray-500 font-medium">{t('current_location')}</p>
                    <div className="flex items-center gap-1 text-primary-500 font-bold">
                        <MapPin size={16} />
                        <span>{user?.location?.address || "תל אביב-יפו"}</span>
                    </div>
                </div>
                <div className="bg-gray-100 p-2 rounded-full relative">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </div>
            </div>

            {/* AI Banner */}
            <div className="mb-10">
                <div onClick={() => navigate('/chat')} className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-primary-500/20 cursor-pointer relative overflow-hidden group md:flex md:items-center md:justify-between transition-all hover:shadow-2xl hover:shadow-primary-500/30">
                    <div className="relative z-10 md:max-w-xl">
                        <h2 className="text-2xl md:text-4xl font-black mb-3">{t('got_problem')}</h2>
                        <p className="text-primary-50 text-sm md:text-lg mb-6 whitespace-pre-wrap leading-relaxed opacity-90">{t('ai_teaser')}</p>
                        <button className="bg-white text-primary-600 px-6 py-3 rounded-2xl text-sm md:text-base font-bold shadow-sm group-hover:scale-105 transition-transform flex items-center gap-2">
                             <MessageSquare size={18} />
                             {t('ask_ai')}
                        </button>
                    </div>
                    <div className="absolute -left-6 -bottom-10 w-32 h-32 md:w-64 md:h-64 bg-white opacity-10 rounded-full md:-left-10 md:-bottom-20 pointer-events-none"></div>
                    {/* Desktop Graphic Decoration */}
                    <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 opacity-20">
                         <MessageSquare size={180} />
                    </div>
                </div>
            </div>

            {/* Stories */}
            <div className="mb-10">
                <h3 className="font-bold text-xl md:text-2xl text-secondary mb-4">{t('stories')}</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {stories.map((story) => (
                        <div key={story.id} onClick={() => setSelectedStory(story)} className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer group">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-gradient-to-tr from-primary-500 via-purple-500 to-green-400 group-hover:scale-105 transition-transform shadow-sm">
                                <div className="w-full h-full rounded-full border-4 border-white overflow-hidden relative">
                                    <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-700 truncate w-20 text-center group-hover:text-primary-600 transition-colors">{story.pro?.name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="mb-10">
                <h3 className="font-bold text-xl md:text-2xl text-secondary mb-4">{t('categories')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {CATEGORIES_DATA.slice(0, 5).map(cat => (
                        <div key={cat.id} onClick={() => navigate(`/search?cat=${cat.id}`)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                                {/* Icons based on data */}
                                <CheckCircle2 size={24} />
                            </div>
                            <span className="font-bold text-gray-800">{cat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Pros */}
            <div className="pb-8">
                <h3 className="font-bold text-xl md:text-2xl text-secondary mb-4">{t('top_pros')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PROS.map(pro => (
                        <ProCard key={pro.id} pro={pro} onClick={() => navigate(`/pro/${pro.id}`)} />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedStory && <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />}
            </AnimatePresence>
        </div>
    );
};

const SearchPage = () => {
    const { language, user } = useStore();
    const navigate = useNavigate();
    const [view, setView] = useState<'list'|'map'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter States
    const [sortBy, setSortBy] = useState<'recommended'|'priceLow'|'priceHigh'|'rating'>('recommended');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;

    // Logic
    const filteredPros = MOCK_PROS
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => p.hourlyRate >= priceRange[0] && p.hourlyRate <= priceRange[1])
        .sort((a, b) => {
            if (sortBy === 'priceLow') return a.hourlyRate - b.hourlyRate;
            if (sortBy === 'priceHigh') return b.hourlyRate - a.hourlyRate;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0; // recommended (mock order)
        });

    return (
        <div className="h-[calc(100vh-65px)] md:h-[calc(100vh-80px)] flex flex-col pt-4 bg-gray-50 max-w-7xl mx-auto w-full px-0 md:px-6 relative" dir={language === 'en' ? 'ltr' : 'rtl'}>
            
            {/* Desktop: Split View Layout */}
            <div className="hidden md:flex flex-row h-full gap-6 pb-6">
                {/* Left Side: List & Filters */}
                <div className="w-1/2 flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-6 border-b">
                         <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-3.5 right-4 text-gray-400" size={20}/>
                                <input 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="חפש אינסטלטור, חשמלאי..."
                                    className="w-full bg-gray-50 pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                                />
                            </div>
                            <button onClick={() => setShowFilters(!showFilters)} className={`p-3.5 rounded-xl border ${showFilters ? 'bg-primary-50 border-primary-500 text-primary-600' : 'border-gray-200 text-gray-600'} transition-colors`}>
                                <Filter size={20}/>
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="pt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-2 block">{t('sort_by')}</label>
                                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full bg-gray-50 p-2 rounded-lg text-sm border border-gray-200 outline-none">
                                                <option value="recommended">{t('recommended')}</option>
                                                <option value="priceLow">{t('price_low_high')}</option>
                                                <option value="priceHigh">{t('price_high_low')}</option>
                                                <option value="rating">{t('rating')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-2 block">{t('price_range')}: ₪{priceRange[1]}</label>
                                            <input type="range" min="0" max="1000" step="50" value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-primary-500"/>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                             {['זמין כעת', 'דירוג גבוה', 'מחיר', 'הכי קרוב'].map(f => (
                                 <button key={f} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 whitespace-nowrap">{f}</button>
                             ))}
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <h3 className="font-bold text-gray-400 text-sm">נמצאו {filteredPros.length} בעלי מקצוע</h3>
                        {filteredPros.map(pro => <ProCard key={pro.id} pro={pro} onClick={() => navigate(`/pro/${pro.id}`)} />)}
                     </div>
                </div>

                {/* Right Side: Map */}
                <div className="w-1/2 h-full rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
                    <MapContainer center={[32.0853, 34.7818]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {filteredPros.map(pro => (
                            <Marker key={pro.id} position={[pro.location.lat, pro.location.lng]} icon={icon}>
                                <Popup>
                                    <div className="text-center font-sans" dir="rtl">
                                        <b className="block mb-1 text-sm">{pro.name}</b>
                                        <span className="text-green-600 text-xs font-bold">{pro.rating} ★</span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col h-full">
                <div className="px-4 mb-4 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute top-3 right-3 text-gray-400" size={20}/>
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="אינסטלטור, חשמלאי..."
                            className="w-full bg-white pr-10 pl-4 py-3 rounded-xl shadow-sm border border-gray-200 outline-none"
                        />
                    </div>
                    <button onClick={() => setShowFilters(true)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 text-gray-600">
                        <Filter size={24}/>
                    </button>
                    <button onClick={() => setView(view === 'list' ? 'map' : 'list')} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 text-gray-600">
                        {view === 'list' ? <MapIcon size={24}/> : <List size={24}/>}
                    </button>
                </div>

                {/* Mobile Filters Modal */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{t('filters')}</h3>
                                <button onClick={() => setShowFilters(false)} className="bg-gray-100 p-2 rounded-full"><X size={20}/></button>
                            </div>
                            
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="font-bold text-gray-700 mb-2 block">{t('sort_by')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'recommended', label: t('recommended') },
                                            { id: 'priceLow', label: t('price_low_high') },
                                            { id: 'rating', label: t('rating') },
                                            { id: 'closest', label: t('closest') }
                                        ].map(opt => (
                                            <button 
                                                key={opt.id} 
                                                onClick={() => setSortBy(opt.id as any)}
                                                className={`p-3 rounded-xl text-sm font-medium border ${sortBy === opt.id ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-100 text-gray-600'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="font-bold text-gray-700 mb-2 block">{t('price_range')} (₪0 - ₪{priceRange[1]})</label>
                                    <input type="range" min="0" max="1000" step="50" value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-primary-500 h-2 bg-gray-200 rounded-lg appearance-none"/>
                                </div>
                            </div>
                            
                            <button onClick={() => setShowFilters(false)} className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-500/30">
                                {t('continue')} ({filteredPros.length})
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {view === 'list' ? (
                    <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
                        {filteredPros.map(pro => <ProCard key={pro.id} pro={pro} onClick={() => navigate(`/pro/${pro.id}`)} />)}
                        <div className="h-20"></div>
                    </div>
                ) : (
                    <div className="flex-1 relative">
                        <MapContainer center={[32.0853, 34.7818]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {filteredPros.map(pro => (
                                <Marker key={pro.id} position={[pro.location.lat, pro.location.lng]} icon={icon}>
                                    <Popup>
                                        <div className="text-center">
                                            <b className="block mb-1">{pro.name}</b>
                                            <span className="text-green-600">{pro.rating} ★</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatPage = () => {
    const { language, addHistory } = useStore();
    const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;
    const [messages, setMessages] = useState<ChatMessage[]>([{id:'1', senderId: 'ai', senderRole: 'ai', text: t('welcome'), timestamp: Date.now()}]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    const handleSend = async () => {
        if (!input && !image) return;
        const msg: ChatMessage = { id: Date.now().toString(), senderId: 'me', senderRole: 'user', text: input, imageUrl: image || undefined, timestamp: Date.now() };
        setMessages(p => [...p, msg]);
        addHistory({ action: 'chat_message', metadata: { textLength: input.length, hasImage: !!image } });
        
        setInput(''); setImage(null); setLoading(true);

        const aiRes = await generateAIResponse(
            [{ role: 'user', parts: msg.text }],
            image ? [{ inlineData: { data: image.split(',')[1], mimeType: 'image/jpeg' } }] : undefined
        );

        setMessages(p => [...p, { id: Date.now().toString(), senderId: 'ai', senderRole: 'ai', text: aiRes, timestamp: Date.now() }]);
        setLoading(false);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] md:h-[calc(100vh-80px)] bg-gray-50 max-w-4xl mx-auto w-full md:my-4 md:rounded-3xl md:border md:border-gray-200 md:shadow-lg md:overflow-hidden md:bg-white" dir={language === 'en' ? 'ltr' : 'rtl'}>
            <div className="bg-white p-4 shadow-sm z-10 text-center border-b">
                <h2 className="font-bold text-lg">{t('ai_assistant')}</h2>
                <span className="text-xs text-green-500 flex items-center justify-center gap-1 font-medium"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> מחובר</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${m.senderRole === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white rounded-bl-none border border-gray-100'}`}>
                            {m.imageUrl && <img src={m.imageUrl} className="mb-2 rounded-lg max-h-64 object-cover" />}
                            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{m.text}</p>
                            <span className={`text-[10px] block text-left mt-2 ${m.senderRole === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                ))}
                {loading && <div className="flex gap-1 p-4"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div></div>}
                <div ref={scrollRef}></div>
            </div>

            <div className="p-4 bg-white border-t">
                {image && <div className="relative inline-block mb-2 animate-slide-up"><img src={image} className="h-20 rounded-lg border border-gray-200" /><button onClick={()=>setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors">×</button></div>}
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        <label className="p-2 text-gray-400 hover:bg-gray-100 hover:text-primary-500 rounded-full cursor-pointer transition-colors"><input type="file" accept="image/*" className="hidden" capture="environment" onChange={handleUpload} /><Camera size={24}/></label>
                        <label className="p-2 text-gray-400 hover:bg-gray-100 hover:text-primary-500 rounded-full cursor-pointer transition-colors"><input type="file" accept="image/*" className="hidden" onChange={handleUpload} /><ImageIcon size={24}/></label>
                    </div>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all border border-transparent focus:border-primary-200" placeholder={t('type_message')} />
                    <button onClick={handleSend} disabled={!input && !image} className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full disabled:opacity-50 transition-all transform active:scale-95 shadow-md shadow-primary-500/20"><Send size={20} className={language === 'he' ? 'rotate-180' : ''}/></button>
                </div>
            </div>
        </div>
    );
};

// --- App Container ---

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useStore();
  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;
  const isActive = (path: string) => location.pathname === path ? 'text-primary-500' : 'text-gray-400';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${isActive('/')}`}><Home size={24} /><span className="text-[10px] font-medium">{t('home')}</span></button>
      <button onClick={() => navigate('/search')} className={`flex flex-col items-center gap-1 ${isActive('/search')}`}><Search size={24} /><span className="text-[10px] font-medium">{t('search')}</span></button>
      <div className="relative -top-5">
         <button onClick={() => navigate('/chat')} className="bg-primary-500 text-white p-4 rounded-full shadow-lg shadow-primary-500/40 hover:scale-105 transition-transform"><MessageSquare size={26} fill="white" /></button>
      </div>
      <button onClick={() => navigate('/contracts')} className={`flex flex-col items-center gap-1 ${isActive('/contracts')}`}><ShieldCheck size={24} /><span className="text-[10px] font-medium">{t('contracts')}</span></button>
      <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 ${isActive('/profile')}`}><User size={24} /><span className="text-[10px] font-medium">{t('profile')}</span></button>
    </div>
  );
};

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, logout, user } = useStore();
  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;
  const isActive = (path: string) => location.pathname === path ? 'text-primary-600 bg-primary-50 font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium';

  return (
    <div className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div onClick={() => navigate('/')} className="text-2xl font-black text-primary-500 cursor-pointer tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white">
                    <CheckCircle2 size={20} className="stroke-[3]" />
                </div>
                מקצוען
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <button onClick={() => navigate('/')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/')}`}>
                    <Home size={18} /> {t('home')}
                </button>
                <button onClick={() => navigate('/search')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/search')}`}>
                    <Search size={18} /> {t('search')}
                </button>
                <button onClick={() => navigate('/chat')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/chat')}`}>
                    <MessageSquare size={18} /> AI
                </button>
                <button onClick={() => navigate('/contracts')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/contracts')}`}>
                    <ShieldCheck size={18} /> {t('contracts')}
                </button>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                 <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors" onClick={() => navigate('/profile')}>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                        <img src={user?.avatar} alt="" className="w-full h-full object-cover"/>
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-gray-800 leading-none mb-1">{user?.name}</p>
                        <p className="text-gray-400 text-xs">{t('role_user')}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const App = () => {
    const { user, language } = useStore();

    useEffect(() => {
        document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    }, [language]);

    if (!user) return <AuthPage />;

    return (
        <HashRouter>
            <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
                <DesktopNav />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/pro/:id" element={<ProProfilePage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    {/* Placeholders for other routes */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <BottomNav />
            </div>
        </HashRouter>
    );
};

export default App;