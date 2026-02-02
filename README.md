# 🌍 PolyConnect - Multilingual Community Q&A

> **Break language barriers. Connect globally.**

PolyConnect is a multilingual Q&A platform where users can ask and answer questions in their native language, and content is automatically translated for everyone using **Lingo.dev SDK**.

Built for the [Lingo.dev Hackathon](https://github.com/lingodotdev/lingo.dev) 🚀

![PolyConnect Screenshot](./screenshots/dashboard.png)

## ✨ Features

- 🌐 **Real-time Translation**: Questions and answers are translated on-the-fly using Lingo.dev SDK
- 🗣️ **Multi-language Support**: Write in your preferred language (English, Spanish, Hindi, German, French, Japanese, and more)
- 💬 **Community Q&A**: Ask questions, share knowledge, upvote helpful answers
- 🏷️ **Tags & Communities**: Organize content by topics and programming languages
- 🔔 **Translation Indicator**: Know when content has been translated from another language
- ⚡ **Live Updates**: Real-time question feed powered by Supabase

## 🛠️ Tech Stack

| Layer           | Technology            |
| --------------- | --------------------- |
| Frontend        | React 19, Vite        |
| Styling         | Tailwind CSS 4        |
| Icons           | Lucide React          |
| Routing         | React Router DOM      |
| **Translation** | **🔤 Lingo.dev SDK**  |
| Database        | Supabase (PostgreSQL) |
| Realtime        | Supabase Realtime     |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Lingo.dev API Key (get one at [lingo.dev](https://lingo.dev))
- Supabase account (optional, for persistence)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/polyconnect.git
cd polyconnect

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Configure Environment

Edit `.env` with your API keys:

```env
# Lingo.dev API Key (REQUIRED for translations)
VITE_LINGODOTDEV_API_KEY=your_lingo_dev_api_key

# Supabase (optional - app works with mock data if not set)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔤 Lingo.dev Integration

PolyConnect uses the **Lingo.dev SDK** for real-time translation of user-generated content:

### Translation Service (`src/services/translation.js`)

```javascript
import { LingoDotDevEngine } from "lingo.dev/sdk";

const lingoDotDev = new LingoDotDevEngine({
  apiKey: import.meta.env.VITE_LINGODOTDEV_API_KEY,
});

// Translate question content
export async function translateQuestion(question, targetLocale) {
  const translated = await lingoDotDev.localizeObject(
    { title: question.title, body: question.body },
    { sourceLocale: question.originalLanguage, targetLocale },
  );
  return translated;
}
```

### Language Context (`src/context/LanguageContext.jsx`)

- Manages current language state
- Caches translations for performance
- Provides `translate()` and `translateQuestionContent()` hooks

### How It Works

1. User selects their preferred language from the header dropdown
2. When language changes, questions are translated via Lingo.dev SDK
3. Translated content is displayed with a "Translated from 🇪🇸" indicator
4. Original language is preserved in the database

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx       # Navbar with language switcher
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── Layout.jsx       # Page layout wrapper
│   ├── QuestionCard.jsx # Question preview card
│   └── TrendingTags.jsx # Trending tags widget
├── pages/
│   ├── Dashboard.jsx    # Home page with question feed
│   ├── AskQuestion.jsx  # Create new question form
│   └── QuestionDetails.jsx # Question page with answers
├── context/
│   └── LanguageContext.jsx # Language state & translation
├── services/
│   ├── translation.js   # Lingo.dev SDK wrapper
│   └── questions.js     # Question CRUD operations
└── lib/
    └── supabase.js      # Supabase client
```

## 🗄️ Database Schema

Run `supabase/schema.sql` in your Supabase SQL Editor to set up the tables:

- `questions`: title, body, author, tags, original_language, votes
- `answers`: body, question_id, author, original_language, votes

## 🎯 Demo

### Watch the Demo Video

[▶️ Watch Demo Video](./demo/video.mp4)

### Features Demonstrated

1. **Language Switching**: Change language in header, see content translate
2. **Multi-language Questions**: Questions in English, Spanish, Hindi
3. **Ask a Question**: Create new question with language selection
4. **Translation Indicators**: Shows when content is translated

## 📜 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

- [Lingo.dev](https://lingo.dev) - AI-powered translation SDK
- [Supabase](https://supabase.com) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Lucide](https://lucide.dev) - Beautiful icons

---

**Built with ❤️ for the Lingo.dev Hackathon**
