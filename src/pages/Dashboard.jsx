import React, { useState, useEffect } from 'react';
import { Filter, Clock, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import TrendingTags from '../components/TrendingTags';
import { useLanguage } from '../context/LanguageContext';
import { getQuestions, subscribeToQuestions } from '../services/questions';
import lingoDevLogo from '../assets/image.png';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('newest');
  const [questions, setQuestions] = useState([]);
  const [translatedQuestions, setTranslatedQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { currentLanguage, translateQuestionContent } = useLanguage();

  // Fetch questions on mount and filter change
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const data = await getQuestions(activeFilter);
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [activeFilter]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToQuestions((payload) => {
      console.log('Realtime update:', payload);
      // Refresh questions on any change
      getQuestions(activeFilter).then(setQuestions);
    });

    return () => unsubscribe();
  }, [activeFilter]);

  // Translate questions when language changes
  useEffect(() => {
    async function translateAll() {
      const translations = {};
      
      for (const question of questions) {
        if (question.originalLanguage !== currentLanguage) {
          const translated = await translateQuestionContent(question);
          if (translated) {
            translations[question.id] = translated;
          }
        }
      }
      
      setTranslatedQuestions(translations);
    }

    if (questions.length > 0) {
      translateAll();
    }
  }, [questions, currentLanguage, translateQuestionContent]);

  const filters = [
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'unanswered', label: 'Unanswered', icon: Sparkles },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Discover questions from the global community</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex items-center gap-1 sm:gap-2 mb-4 p-1 bg-white rounded-xl border border-gray-200 w-full sm:w-fit overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Questions List */}
          {!loading && (
            <div className="space-y-3 sm:space-y-4">
              {questions.map((question) => (
                <QuestionCard 
                  key={question.id} 
                  question={question}
                  translatedText={translatedQuestions[question.id]}
                />
              ))}
              
              {questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No questions found. Be the first to ask!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - hidden on mobile, shown on lg and above */}
        <aside className="hidden lg:block w-80 space-y-4 flex-shrink-0">
          <TrendingTags />
          
          {/* Language Stats Widget */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
            <h3 className="font-semibold mb-3">🌍 Global Community</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-80">Active Languages</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Questions Today</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Translations</span>
                <span className="font-medium">{Object.keys(translatedQuestions).length}</span>
              </div>
            </div>
          </div>

          {/* Lingo.dev Powered Badge */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400 mb-3">Powered by</p>
            <div className="flex items-center justify-center">
              {/* Lingo.dev Logo Icon */}
              <img src={lingoDevLogo} alt="Lingo.dev" className="h-10" />
            </div>
            <p className="text-xs text-gray-500 mt-3">Real-time AI translations</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
