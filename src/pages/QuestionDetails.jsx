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
import { useAuth } from '../context/AuthContext';
import { getQuestionById } from '../services/questions';
import { getAnswersByQuestionId, createAnswer, subscribeToAnswers } from '../services/answers';
import { upvoteQuestion, downvoteQuestion, getQuestionVote, upvoteAnswer, downvoteAnswer, getAnswerVote } from '../services/votes';
import { isBookmarked, toggleBookmark } from '../services/bookmarks';

const QuestionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [questionVote, setQuestionVote] = useState(null);
  const [answerVotes, setAnswerVotes] = useState({});
  
  const { currentLanguage, translateQuestionContent } = useLanguage();

  const languageFlags = {
    en: '🇺🇸',
    es: '🇪🇸',
    hi: '🇮🇳',
    de: '🇩🇪',
    fr: '🇫🇷',
    ja: '🇯🇵',
  };

  // Fetch question and answers
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [questionData, answersData] = await Promise.all([
          getQuestionById(id),
          getAnswersByQuestionId(id),
        ]);
        setQuestion(questionData);
        setAnswers(answersData);

        // Check bookmark status
        if (user) {
          const isBookmarkedResult = await isBookmarked(id);
          setBookmarked(isBookmarkedResult);

          // Get user's vote on question
          const vote = await getQuestionVote(id);
          setQuestionVote(vote);

          // Get user's votes on answers
          const votes = {};
          for (const answer of answersData) {
            const answerVote = await getAnswerVote(answer.id);
            if (answerVote) votes[answer.id] = answerVote;
          }
          setAnswerVotes(votes);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Subscribe to realtime answer updates
    const unsubscribe = subscribeToAnswers(id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setAnswers(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'DELETE') {
        setAnswers(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => unsubscribe();
  }, [id, user]);

  // Translate question
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

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !user) return;

    setSubmitting(true);
    try {
      const newAnswer = await createAnswer({
        questionId: id,
        body: answerText,
        originalLanguage: currentLanguage,
      });
      setAnswers(prev => [...prev, newAnswer]);
      setAnswerText('');
    } catch (error) {
      console.error('Error posting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle question vote
  const handleQuestionVote = async (voteType) => {
    if (!user) return;
    try {
      const result = voteType === 1 
        ? await upvoteQuestion(id) 
        : await downvoteQuestion(id);
      setQuestionVote(result);
      // Refresh question to get updated vote count
      const updated = await getQuestionById(id);
      setQuestion(updated);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Handle answer vote
  const handleAnswerVote = async (answerId, voteType) => {
    if (!user) return;
    try {
      const result = voteType === 1 
        ? await upvoteAnswer(answerId) 
        : await downvoteAnswer(answerId);
      setAnswerVotes(prev => ({ ...prev, [answerId]: result }));
      // Refresh answers
      const updated = await getAnswersByQuestionId(id);
      setAnswers(updated);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Handle bookmark toggle
  const handleToggleBookmark = async () => {
    if (!user) return;
    try {
      const result = await toggleBookmark(id);
      setBookmarked(result);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

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
        <Link to="/dashboard" className="text-blue-500 hover:underline mt-2 inline-block">
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
        to="/dashboard" 
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
            <button 
              onClick={() => handleQuestionVote(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                questionVote === 1 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-medium">{question.votes}</span>
            </button>
            <button 
              onClick={() => handleQuestionVote(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                questionVote === -1 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl transition-colors ${
                bookmarked 
                  ? 'text-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
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
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
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
                  <button 
                    onClick={() => handleAnswerVote(answer.id, 1)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      answerVotes[answer.id] === 1 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{answer.votes}</span>
                  </button>
                  <button 
                    onClick={() => handleAnswerVote(answer.id, -1)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      answerVotes[answer.id] === -1 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
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
          {user ? (
            <>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your answer here..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
              <div className="flex justify-end mt-3">
                <button 
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">
              <Link to="/login" className="text-blue-500 hover:underline">Log in</Link> to post an answer
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuestionDetails;
