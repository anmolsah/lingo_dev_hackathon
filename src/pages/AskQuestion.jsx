import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb, 
  ArrowRight, 
  Globe, 
  Tag, 
  Code,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image,
  Loader2
} from 'lucide-react';
import { createQuestion } from '../services/questions';
import { useAuth } from '../context/AuthContext';

const AskQuestion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    language: 'en',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() && formData.tags.length < 5) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim().toLowerCase())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim().toLowerCase()],
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Create question in Supabase
      const newQuestion = await createQuestion({
        title: formData.title,
        body: formData.body,
        tags: formData.tags,
        original_language: formData.language,
        author_name: user?.email?.split('@')[0] || user?.user_metadata?.full_name || 'Anonymous',
      });

      console.log('Question created:', newQuestion);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err.message || 'Failed to post question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const guidelines = [
    {
      step: 1,
      title: 'Summarize the problem',
      description: 'Include details about what you\'ve tried and exactly what you are trying to achieve.',
    },
    {
      step: 2,
      title: 'Describe what you\'ve tried',
      description: 'Show what you\'ve tried and tell us what you found (on this site or elsewhere).',
    },
    {
      step: 3,
      title: 'Show some code',
      description: 'When appropriate, share the minimum amount of code others need to reproduce your problem.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Get help from the multilingual community. Be specific and clear.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 sm:space-y-6">
          {/* Language Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Globe className="w-4 h-4 text-blue-500" />
              What language are you writing in?
            </label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: lang.code })}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all text-sm ${
                    formData.language === lang.code
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Be specific and imagine you're asking a question to another person.
            </p>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. How do I handle async/await in JavaScript?"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm sm:text-base"
              required
            />
          </div>

          {/* Body */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are the details of your problem?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Include all the information someone would need to answer your question.
            </p>
            
            {/* Editor Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-t-xl border border-gray-200 border-b-0 overflow-x-auto">
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <Code className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <LinkIcon className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <List className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <Image className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={6}
              placeholder="Describe your question in detail..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm sm:text-base"
              required
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-blue-500" />
              Tags
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Add up to 5 tags to describe what your question is about.
            </p>
            
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs sm:text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={formData.tags.length < 5 ? 'Add a tag...' : 'Max 5 tags'}
                disabled={formData.tags.length >= 5}
                className="flex-1 min-w-[100px] outline-none text-sm"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post Question
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 text-center"
            >
              Discard
            </button>
          </div>
        </form>

        {/* Guidelines Sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 sticky top-24">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Writing a good question
            </h3>
            <ol className="space-y-4">
              {guidelines.map((guide) => (
                <li key={guide.step} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {guide.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{guide.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{guide.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button className="mt-4 text-sm text-amber-600 hover:underline flex items-center gap-1">
              See full guidelines
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AskQuestion;
