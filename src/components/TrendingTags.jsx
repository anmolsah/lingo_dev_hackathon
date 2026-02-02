import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const TrendingTags = () => {
  const tags = [
    { name: 'javascript', count: 2345 },
    { name: 'python', count: 1892 },
    { name: 'english-learning', count: 1456 },
    { name: 'web-dev', count: 1234 },
    { name: 'react', count: 987 },
    { name: 'español', count: 756 },
    { name: 'deutsch', count: 543 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          Trending Tags
        </h3>
        <Link to="/tags" className="text-xs text-blue-500 hover:underline">
          View all
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            to={`/tags/${tag.name}`}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span className="text-sm text-gray-700 group-hover:text-blue-600">#{tag.name}</span>
            <span className="text-xs text-gray-400">{tag.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingTags;
