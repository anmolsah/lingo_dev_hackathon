# BabelChat

BabelChat is a real-time multilingual chat application that automatically translates messages between users speaking different languages. It enables seamless cross-language conversations powered by AI translation.

## Demo

[Watch the Demo Video](https://drive.google.com/file/d/1p3xTJj5ALK3NDkM2NJbdWhlDe7ljYITR/view?usp=sharing)

## Features

- **Real-Time Messaging** -- Messages appear instantly for all room members via WebSocket subscriptions.
- **Automatic Translation** -- Messages are translated on the fly based on each user's preferred language. Users can toggle between the original text and the translation.
- **Public and Private Rooms** -- Create public rooms that anyone can browse and join, or private rooms accessible only through a unique invite code.
- **Typing Indicators** -- See when other participants are composing a message.
- **Live Member Count** -- Room member counts update in real time as users join or leave.
- **User Profiles** -- Each user has a display name and a preferred language that determines how incoming messages are translated.
- **Internationalized Interface** -- The entire UI is available in all six supported languages.

## Supported Languages

| Language | Code |
| -------- | ---- |
| English  | en   |
| Spanish  | es   |
| French   | fr   |
| German   | de   |
| Japanese | ja   |
| Hindi    | hi   |

## Tech Stack

| Layer       | Technology                                            |
| ----------- | ----------------------------------------------------- |
| Frontend    | React 18, TypeScript, Tailwind CSS                    |
| Build Tool  | Vite                                                  |
| Backend     | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| Translation | Lingo.dev AI Engine                                   |
| Icons       | Lucide React                                          |

## Project Structure

```
src/
  components/       UI components (chat area, sidebar, modals, etc.)
  contexts/         React context providers (authentication)
  lib/              Supabase client, translation service, i18n strings, language definitions
  types/            TypeScript type definitions
supabase/
  functions/        Supabase Edge Functions (translate)
  migrations/       Database migration files
```

## How It Works

### Translation

When a message is sent, it is stored with the sender's preferred language. When another user views the message, the application checks whether a translation is needed. If the source language differs from the reader's preferred language, a translation request is sent to a Supabase Edge Function that calls the Lingo.dev API. Translated results are cached in the database to avoid redundant API calls.

### Rooms

- **Public rooms** are visible in the browse modal and can be joined by any authenticated user.
- **Private rooms** are hidden from the browse list. Users must enter the room's invite code to join.
- Every room is assigned a unique invite code at creation, which can be copied and shared from the room header.

### Real-Time Updates

The application subscribes to Supabase Realtime channels for each active room. This powers:

- Instant message delivery
- Typing indicators via broadcast events
- Live member count changes when users join or leave

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_LINGODOTDEV_API_KEY=<your-lingodotdev-api-key>
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up your `.env` file with the required environment variables listed above.

3. Run database migrations through the Supabase dashboard or CLI.

4. Start the development server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

The production build is output to the `dist/` directory.

## License

This project is provided as-is for evaluation purposes.
