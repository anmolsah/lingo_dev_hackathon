import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { LegalSummarizerPage } from "./pages/LegalSummarizerPage";
import { SchemeNavigatorPage } from "./pages/SchemeNavigatorPage";
import { ChatBotPage } from "./pages/ChatBotPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                  Vaani
                </Link>
                <div className="flex gap-6">
                  <Link to="/legal" className="hover:text-blue-600 transition">
                    Legal Summarizer
                  </Link>
                  <Link
                    to="/schemes"
                    className="hover:text-blue-600 transition"
                  >
                    Government Schemes
                  </Link>
                  <Link to="/chat" className="hover:text-blue-600 transition">
                    Legal Aid Chat
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/legal" element={<LegalSummarizerPage />} />
            <Route path="/schemes" element={<SchemeNavigatorPage />} />
            <Route path="/chat" element={<ChatBotPage />} />
          </Routes>

          <footer className="bg-white border-t mt-16">
            <div className="container mx-auto px-4 py-8 text-center text-gray-600">
              <p>Built with ❤️ for the Lingo.dev Multilingual Hackathon 2026</p>
              <p className="text-sm mt-2">
                Making justice accessible in every language
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
