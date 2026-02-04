import React, { useState, useEffect } from 'react';
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
  Users,
  Loader2,
  Plus
} from 'lucide-react';
import { getProfile, updateProfile, getUserStats, getUserLanguages, addUserLanguage, removeUserLanguage } from '../services/profiles';
import { getUserBadges } from '../services/badges';
import { getQuestions } from '../services/questions';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { currentLanguage, changeLanguage, languages: supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ questionsAsked: 0, answersGiven: 0, reputation: 0 });
  const [userLanguages, setUserLanguages] = useState([]);
  const [badges, setBadges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch profile data
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      setLoading(true);
      try {
        const [profileData, statsData, languagesData, badgesData, questionsData] = await Promise.all([
          getProfile(user.id),
          getUserStats(user.id),
          getUserLanguages(user.id),
          getUserBadges(user.id),
          getQuestions('newest'),
        ]);

        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || user?.email?.split('@')[0] || 'User');
          setBio(profileData.bio || '');
        } else {
          setDisplayName(user?.email?.split('@')[0] || 'User');
        }

        setStats({
          questionsAsked: statsData?.questionsAsked || 0,
          answersGiven: statsData?.answersGiven || 0,
          reputation: statsData?.reputation || 0,
        });

        setUserLanguages(languagesData || []);
        setBadges(badgesData || []);

        // Filter user's questions and answers for recent activity
        const userQuestions = questionsData?.filter(q => q.author?.id === user.id) || [];
        setRecentActivity(userQuestions.slice(0, 5).map(q => ({
          type: 'question',
          title: q.title,
          preview: q.body.substring(0, 100) + '...',
          time: q.createdAt,
        })));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateProfile(user.id, {
        display_name: displayName,
        bio: bio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const proficiencyColors = {
    native: 'bg-green-500',
    fluent: 'bg-blue-500',
    intermediate: 'bg-yellow-500',
    beginner: 'bg-orange-500',
  };

  const statsDisplay = [
    { label: 'Reputation', value: stats.reputation.toLocaleString(), icon: Award },
    { label: 'Questions', value: stats.questionsAsked.toString(), icon: HelpCircle },
    { label: 'Answers', value: stats.answersGiven.toString(), icon: CheckCircle },
    { label: 'Helpful Votes', value: '0', icon: ThumbsUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif]">
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
              </div>

              <div className="flex-1 text-center sm:text-left sm:mb-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display Name"
                      className="text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 w-full max-w-xs"
                    />
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a short bio..."
                      rows={2}
                      className="w-full max-w-md text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)} 
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                      <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-[#137fec]">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-slate-500 text-sm">
                      @{displayName.toLowerCase().replace(/\s/g, '')} • Joined {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    {bio && (
                      <p className="text-slate-600 mt-2 max-w-xl">{bio}</p>
                    )}
                  </>
                )}
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
          {statsDisplay.map((stat, index) => (
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
                <Globe className="w-5 h-5 text-[#137fec]" />
                <h2 className="text-lg font-bold text-slate-900">Language Proficiency</h2>
              </div>
              
              <div className="space-y-3">
                {userLanguages.length > 0 ? (
                  userLanguages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{lang.language_code.toUpperCase()}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${proficiencyColors[lang.proficiency_level] || 'bg-gray-500'} text-white`}>
                        {lang.proficiency_level}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No languages added yet</p>
                )}
                <button className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-[#137fec] font-medium hover:underline">
                  <Plus className="w-4 h-4" /> Add Language
                </button>
              </div>
            </div>

            {/* Top Badges */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Badges</h2>
              
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge, index) => (
                    <div 
                      key={index}
                      className={`${badge.color || 'bg-blue-100'} rounded-xl p-3 text-center`}
                    >
                      <span className="text-2xl">{badge.icon || '🏅'}</span>
                      <p className="text-xs font-medium text-slate-700 mt-1">{badge.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No badges earned yet. Keep contributing!</p>
              )}
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
                    onChange={(e) => changeLanguage(e.target.value)}
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
              
              {recentActivity.length > 0 ? (
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
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No activity yet. Start by asking a question!
                </p>
              )}

              <Link 
                to="/my-questions"
                className="block w-full mt-6 py-3 text-center text-sm text-[#137fec] font-medium border border-[#137fec]/30 rounded-xl hover:bg-[#137fec]/5 transition-colors"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
