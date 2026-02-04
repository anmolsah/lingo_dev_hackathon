import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getQuestions } from '../services/questions';
import QuestionCard from '../components/QuestionCard';

const MyQuestions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyQuestions() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allQuestions = await getQuestions('newest');
        // Filter to only show user's questions
        const myQuestions = allQuestions.filter(q => q.author?.id === user.id);
        setQuestions(myQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyQuestions();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Questions</h1>
        <p className="text-gray-500 mb-4">Please log in to see your questions</p>
        <Link to="/login" className="text-blue-500 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">My Questions</h1>
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
            {questions.length}
          </span>
        </div>
        <Link 
          to="/ask"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          Ask New Question
        </Link>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h2>
          <p className="text-gray-500 mb-4">
            Start by asking your first question to the community
          </p>
          <Link 
            to="/ask"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ask Question
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyQuestions;
