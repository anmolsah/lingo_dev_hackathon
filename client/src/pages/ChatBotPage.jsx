import { ChatInterface } from "../components/ChatBot/ChatInterface";

export function ChatBotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Legal Aid Chat</h1>
      <p className="text-gray-600 mb-8">
        Ask legal questions in your native language and get instant guidance.
      </p>

      <div className="max-w-4xl mx-auto">
        <ChatInterface />
      </div>

      <div className="mt-8 text-sm text-gray-500 text-center max-w-2xl mx-auto">
        <p className="mb-2">
          <strong>Disclaimer:</strong> This bot provides general information
          only. For specific legal advice, consult a qualified attorney.
        </p>
        <p>
          The chat automatically detects your language and responds accordingly.
        </p>
      </div>
    </div>
  );
}
