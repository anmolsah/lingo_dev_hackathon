import { Link } from "react-router-dom";
import { FileText, Search, MessageCircle } from "lucide-react";

export function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to Vaani</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your voice in civic matters - Making legal and government information
          accessible in every language
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">46M+</div>
            <div className="text-sm text-gray-600">Pending Cases</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">22</div>
            <div className="text-sm text-gray-600">Official Languages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">80%</div>
            <div className="text-sm text-gray-600">Prefer Vernacular</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Link to="/legal" className="card group">
          <FileText
            className="mb-4 text-blue-600 group-hover:scale-110 transition"
            size={48}
          />
          <h2 className="text-2xl font-bold mb-2">Legal Summarizer</h2>
          <p className="text-gray-600">
            Upload legal documents and get plain language summaries in your
            language
          </p>
          <div className="mt-4 text-blue-600 font-semibold">Get Started →</div>
        </Link>

        <Link to="/schemes" className="card group">
          <Search
            className="mb-4 text-blue-600 group-hover:scale-110 transition"
            size={48}
          />
          <h2 className="text-2xl font-bold mb-2">Scheme Navigator</h2>
          <p className="text-gray-600">
            Discover government schemes and check your eligibility
          </p>
          <div className="mt-4 text-blue-600 font-semibold">
            Explore Schemes →
          </div>
        </Link>

        <Link to="/chat" className="card group">
          <MessageCircle
            className="mb-4 text-blue-600 group-hover:scale-110 transition"
            size={48}
          />
          <h2 className="text-2xl font-bold mb-2">Legal Aid Chat</h2>
          <p className="text-gray-600">
            Get instant legal guidance in your native language
          </p>
          <div className="mt-4 text-blue-600 font-semibold">Start Chat →</div>
        </Link>
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Powered by Lingo.dev</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Using AI-driven localization to break language barriers and make civic
          information accessible to everyone
        </p>
      </div>
    </div>
  );
}
