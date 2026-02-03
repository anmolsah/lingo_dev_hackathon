import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  Mail, 
  Globe, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  Settings, 
  Edit2, 
  Save,
  LogOut,
  Calendar,
  BookOpen,
  CheckCircle,
  Home,
  HelpCircle,
  Users
} from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { currentLanguage, setCurrentLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.username || user?.email?.split('@')[0] || 'User');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  // User stats
  const stats = [
    { label: 'Reputation', value: '4,520', icon: Award },
    { label: 'Questions Asked', value: '12', icon: HelpCircle },
    { label: 'Answers Given', value: '86', icon: CheckCircle },
    { label: 'Helpful Votes', value: '142', icon: ThumbsUp },
  ];

  // Language proficiency
  const languages = [
    { name: 'English', level: 'Native', color: 'bg-green-500' },
    { name: 'Spanish', level: 'Fluent', color: 'bg-blue-500' },
    { name: 'Japanese', level: 'Intermediate', color: 'bg-yellow-500' },
  ];

  // Top badges
  const badges = [
    { name: 'First Answer', icon: '🏅', color: 'bg-amber-100' },
    { name: 'Helpful', icon: '⭐', color: 'bg-blue-100' },
    { name: 'Polyglot', icon: '🌍', color: 'bg-green-100' },
    { name: 'Top Contributor', icon: '🏆', color: 'bg-purple-100' },
  ];

  // Recent activity
  const recentActivity = [
    { 
      type: 'answer', 
      title: 'How to handle async/await effectively in Python loops?', 
      preview: 'You should ensure that you are running the event loop correctly. If you are using asyncio, try gathering the tasks first...',
      time: '2 hours ago' 
    },
    { 
      type: 'question', 
      title: 'Best practices for state management in large React apps?', 
      preview: '',
      time: '1 day ago' 
    },
    { 
      type: 'answer', 
      title: 'Centering a div with Tailwind CSS', 
      preview: 'The easiest way is using flexbox. Just add `flex justify-center items-center h-screen` to the parent container...',
      time: '3 days ago' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif]">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#137fec]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-400/15 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden mb-6">
          {/* Cover/Banner */}
          <div className="h-32 bg-gradient-to-r from-[#137fec] to-blue-600"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#137fec] to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#137fec] transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left sm:mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1"
                    />
                    <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                    <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-[#137fec]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <p className="text-slate-500 text-sm">
                  @{displayName.toLowerCase().replace(/\s/g, '')} • Joined {new Date(user?.created_at || '2022-01-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <p className="text-slate-600 mt-2 max-w-xl">
                  Full-stack developer passionate about open source and language learning. Polyglot in code and speech.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:mb-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-white/50 p-5 text-center"
            >
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Language Proficiency */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#137fec]">translate</span>
                <h2 className="text-lg font-bold text-slate-900">Language Proficiency</h2>
              </div>
              
              <div className="space-y-3">
                {languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{lang.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${lang.color} text-white`}>
                      {lang.level}
                    </span>
                  </div>
                ))}
                <button className="w-full mt-3 text-center text-sm text-[#137fec] font-medium hover:underline">
                  + Add Language
                </button>
              </div>
            </div>

            {/* Top Badges */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Top Badges</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div 
                    key={index}
                    className={`${badge.color} rounded-xl p-3 text-center`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <p className="text-xs font-medium text-slate-700 mt-1">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-[#137fec]" />
                <h2 className="text-lg font-bold text-slate-900">Settings</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Preferred Language
                  </label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm"
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-700">Auto-translate</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#137fec] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-[#137fec]" />
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl border border-slate-100 hover:border-[#137fec]/30 hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        activity.type === 'question' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {activity.type === 'question' ? 'Asked' : 'Answered'}
                      </span>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{activity.title}</h3>
                    {activity.preview && (
                      <p className="text-sm text-slate-500 line-clamp-2">{activity.preview}</p>
                    )}
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 text-center text-sm text-[#137fec] font-medium border border-[#137fec]/30 rounded-xl hover:bg-[#137fec]/5 transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
