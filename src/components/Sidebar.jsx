import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, HelpCircle, Bookmark, Plus, Users } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Globe, label: 'Languages', path: '/languages' },
    { icon: HelpCircle, label: 'My Questions', path: '/my-questions' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  ];

  const communities = [
    { code: 'JS', name: 'JavaScript', color: 'bg-yellow-500' },
    { code: 'PY', name: 'Python', color: 'bg-blue-500' },
    { code: 'ES', name: 'Español', color: 'bg-red-500' },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PolyConnect
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Communities Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              My Communities
            </h3>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {communities.map((community) => (
              <li key={community.code}>
                <Link
                  to={`/community/${community.code.toLowerCase()}`}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${community.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                    {community.code}
                  </div>
                  <span className="text-sm">{community.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Ask Question Button */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/ask"
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Ask Question
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
