import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark, 
  Share2, 
  Globe,
  MessageCircle,
  Clock,
  CheckCircle,
  Loader2,
  Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getQuestionById } from '../services/questions';

const QuestionDetails = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  
  const { currentLanguage, translateQuestionContent } = useLanguage();

  // Mock answers for demo
  const [answers] = useState([
    {
      id: '1',
      body: 'Great question! For handling async/await with multiple API calls, you have several options. The most common approaches are using Promise.all() for parallel execution or awaiting each call sequentially.',
      author: { name: 'JSExpert' },
      votes: 15,
      isAccepted: true,
      createdAt: '1 day ago',
      originalLanguage: 'en',
    },
    {
      id: '2',
      body: 'I would add that error handling is crucial. Wrap your async calls in try-catch blocks and consider using Promise.allSettled() if you want all promises to complete regardless of failures.',
      author: { name: 'AsyncMaster' },
      votes: 8,
      isAccepted: false,
      createdAt: '12 hours ago',
      originalLanguage: 'en',
    },
  ]);

  const languageFlags = {
    en: '🇺🇸',
    es: '🇪🇸',
    hi: '🇮🇳',
    de: '🇩🇪',
    fr: '🇫🇷',
    ja: '🇯🇵',
  };

  useEffect(() => {
    async function fetchQuestion() {
      setLoading(true);
      try {
        const data = await getQuestionById(id);
        setQuestion(data);
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestion();
  }, [id]);

  useEffect(() => {
    async function translate() {
      if (question && question.originalLanguage !== currentLanguage) {
        const translated = await translateQuestionContent(question);
        setTranslatedContent(translated);
      } else {
        setTranslatedContent(null);
      }
    }

    translate();
  }, [question, currentLanguage, translateQuestionContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Question not found</h2>
        <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const displayTitle = translatedContent?.title || question.title;
  const displayBody = translatedContent?.body || question.body;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Question */}
      <article className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{displayTitle}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {question.createdAt}
          </span>
          <span>•</span>
          <span>{question.views} views</span>
          {translatedContent && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-500">
                <Globe className="w-4 h-4" />
                Translated from {languageFlags[question.originalLanguage]}
              </span>
            </>
          )}
        </div>

        {/* Body */}
        <div className="prose max-w-none text-gray-700 mb-6">
          <p>{displayBody}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span className="font-medium">{question.votes}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full" />
          <div>
            <p className="font-medium text-gray-900">{question.author.name}</p>
            <p className="text-sm text-gray-500">Asked {question.createdAt}</p>
          </div>
        </div>
      </article>

      {/* Answers Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {answers.length} Answers
        </h2>

        <div className="space-y-4">
          {answers.map((answer) => (
            <article 
              key={answer.id} 
              className={`bg-white rounded-2xl border p-5 ${answer.isAccepted ? 'border-green-300 bg-green-50/50' : 'border-gray-200'}`}
            >
              {answer.isAccepted && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
                  <CheckCircle className="w-4 h-4" />
                  Accepted Answer
                </div>
              )}

              <p className="text-gray-700 mb-4">{answer.body}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{answer.votes}</span>
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full" />
                  <span>{answer.author.name}</span>
                  <span>•</span>
                  <span>{answer.createdAt}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Your Answer */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Your Answer</h3>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write your answer here..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
          <div className="flex justify-end mt-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
              <Send className="w-4 h-4" />
              Post Answer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuestionDetails;
