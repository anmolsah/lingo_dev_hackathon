import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Eye, Bookmark, Globe } from 'lucide-react';
import { isBookmarked, toggleBookmark } from '../services/bookmarks';
import { useAuth } from '../context/AuthContext';

const QuestionCard = ({ question, translatedText }) => {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  
  const {
    id,
    title,
    body,
    author,
    tags,
    votes,
    answers,
    views,
    createdAt,
    originalLanguage,
  } = question;

  // Check if bookmarked on mount
  useEffect(() => {
    async function checkBookmark() {
      if (!user || !id) return;
      const result = await isBookmarked(id);
      setBookmarked(result);
    }
    checkBookmark();
  }, [user, id]);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    try {
      const result = await toggleBookmark(id);
      setBookmarked(result);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Use translated text if available, otherwise use original
  const displayTitle = translatedText?.title || title;
  const displayBody = translatedText?.body || body;

  const languageFlags = {
    en: '🇺🇸',
    es: '🇪🇸',
    hi: '🇮🇳',
    de: '🇩🇪',
    fr: '🇫🇷',
    ja: '🇯🇵',
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group">
      <div className="flex gap-3 sm:gap-4">
        {/* Stats Column - hidden on mobile */}
        <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[60px]">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">{votes}</span>
            <span className="text-xs text-gray-500">votes</span>
          </div>
          <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${answers > 0 ? 'bg-green-50 text-green-600' : ''}`}>
            <span className="text-lg font-bold">{answers}</span>
            <span className="text-xs">answers</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-sm font-medium">{views}</span>
            <span className="text-xs">views</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link 
            to={`/question/${id}`}
            className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600"
          >
            {displayTitle}
          </Link>

          {/* Body Preview */}
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {displayBody}
          </p>

          {/* Mobile Stats Row */}
          <div className="flex sm:hidden items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> {votes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {answers}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {views}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/tags/${tag}`}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-100 gap-2 sm:gap-0">
            {/* Author & Language */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full" />
                <span className="text-xs sm:text-sm text-gray-600">{author.name}</span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{createdAt}</span>
              {translatedText && (
                <>
                  <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span className="hidden sm:inline">Translated from</span> {languageFlags[originalLanguage]}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleBookmark}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  bookmarked 
                    ? 'text-blue-500 bg-blue-50' 
                    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuestionCard;
