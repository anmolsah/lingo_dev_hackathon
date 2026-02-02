import React, { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import TrendingTags from '../components/TrendingTags';
import { Filter, Clock, TrendingUp, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('newest');

  // Mock data - will be replaced with Supabase + Lingo.dev translations
  const questions = [
    {
      id: '1',
      title: 'How do I handle unicode strings effectively in Python 3 across different operating systems?',
      body: 'I\'m working on a cross-platform application that needs to handle text in multiple languages including Chinese, Arabic, and Hindi. What are the best practices?',
      author: { name: 'CodeMaster', avatar: '' },
      tags: ['python', 'unicode', 'cross-platform'],
      votes: 42,
      answers: 3,
      views: 156,
      createdAt: '2 hours ago',
      originalLanguage: 'en',
    },
    {
      id: '2',
      title: 'Best practices for managing state in large React applications when using Context API vs Redux?',
      body: 'I\'m building a dashboard that requires real-time updates and I\'m unsure if Context API will cause unnecessary re-renders compared to Redux Toolkit...',
      author: { name: 'ReactFan', avatar: '' },
      tags: ['react', 'redux', 'context-api', 'state-management'],
      votes: 38,
      answers: 5,
      views: 234,
      createdAt: '4 hours ago',
      originalLanguage: 'en',
    },
    {
      id: '3',
      title: 'Difference between "wissen" and "kennen" in daily conversation?',
      body: 'I keep getting these two mixed up. Can someone explain the nuance when talking about people versus facts?',
      author: { name: 'GermanLearner', avatar: '' },
      tags: ['deutsch', 'german-learning', 'vocabulary'],
      votes: 25,
      answers: 4,
      views: 189,
      createdAt: '6 hours ago',
      originalLanguage: 'de',
    },
    {
      id: '4',
      title: 'How to center a div horizontally and vertically using Grid vs Flexbox?',
      body: 'I know justify-content: center and align-items: center work for flex, but what is the equivalent shorthand for CSS Grid?',
      author: { name: 'CSSNinja', avatar: '' },
      tags: ['css', 'flexbox', 'css-grid', 'web-dev'],
      votes: 67,
      answers: 8,
      views: 445,
      createdAt: '1 day ago',
      originalLanguage: 'en',
    },
  ];

  const filters = [
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'unanswered', label: 'Unanswered', icon: Sparkles },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Discover questions from the global community</p>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 p-1 bg-white rounded-xl border border-gray-200 w-fit">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 space-y-4">
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
                <span className="font-medium">847</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Translations</span>
                <span className="font-medium">3.2k</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
