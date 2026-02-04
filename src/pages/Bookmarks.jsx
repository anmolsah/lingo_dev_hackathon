import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, removeBookmark } from '../services/bookmarks';

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getBookmarks();
        setBookmarks(data || []);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, [user]);

  const handleRemoveBookmark = async (questionId) => {
    try {
      await removeBookmark(questionId);
      setBookmarks(prev => prev.filter(b => b.question?.id !== questionId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bookmarks</h1>
        <p className="text-gray-500 mb-4">Please log in to see your bookmarks</p>
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
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
          {bookmarks.length}
        </span>
      </div>

      {bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <article 
              key={bookmark.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/question/${bookmark.question?.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {bookmark.question?.title}
                  </Link>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {bookmark.question?.body}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{bookmark.question?.votes || 0} votes</span>
                    <span>{bookmark.question?.answers_count || 0} answers</span>
                    <span>{bookmark.question?.views || 0} views</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {bookmark.question?.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveBookmark(bookmark.question?.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h2>
          <p className="text-gray-500 mb-4">
            Save questions you want to revisit later by clicking the bookmark icon
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Questions
          </Link>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
