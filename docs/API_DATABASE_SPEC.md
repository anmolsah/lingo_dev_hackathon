# Vaani - API & Database Specifications

## API Endpoints Documentation

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Authentication

Currently, the API is open for hackathon purposes. In production, implement JWT-based authentication.

---

## Schemes API

### GET /api/schemes

Get list of government schemes with translations.

**Query Parameters:**

- `category` (optional): Filter by category (health, education, agriculture, tribal_welfare)
- `lang` (optional): Language code (en, hi, bn, te, mr). Default: 'en'
- `limit` (optional): Number of results. Default: 20
- `offset` (optional): Pagination offset. Default: 0

**Example Request:**

```bash
GET /api/schemes?category=health&lang=hi&limit=10
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "scheme_code": "ANEMIA_MUKT_BHARAT",
      "category": "health",
      "ministry": "Ministry of Health",
      "is_active": true,
      "created_at": "2026-01-31T10:00:00Z",
      "scheme_translations": {
        "id": "uuid",
        "language_code": "hi",
        "title": "एनीमिया मुक्त भारत",
        "description": "भारत में एनीमिया को कम करने के लिए राष्ट्रीय कार्यक्रम",
        "eligibility": "सभी आयु वर्ग के नागरिक",
        "benefits": "मुफ्त आयरन की गोलियां और पोषण परामर्श"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

**Status Codes:**

- 200: Success
- 400: Bad request (invalid parameters)
- 500: Server error

---

### GET /api/schemes/:id

Get detailed information about a specific scheme.

**Path Parameters:**

- `id`: Scheme UUID

**Query Parameters:**

- `lang` (optional): Language code. Default: 'en'

**Example Request:**

```bash
GET /api/schemes/123e4567-e89b-12d3-a456-426614174000?lang=bn
```

**Example Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "scheme_code": "PM_JANMAN",
  "category": "tribal_welfare",
  "ministry": "Ministry of Tribal Affairs",
  "is_active": true,
  "translation": {
    "title": "প্রধানমন্ত্রী জনজাতি আদিবাসী ন্যায় মহা অভিযান",
    "description": "বিশেষভাবে দুর্বল উপজাতি গোষ্ঠীর কল্যাণের জন্য ব্যাপক উদ্যোগ",
    "eligibility": "স্বীকৃত PVTG-এর সদস্য",
    "benefits": "আবাসন সহায়তা, পরিষ্কার পানীয় জল, বিদ্যুৎ সংযোগ",
    "application_process": "আপনার স্থানীয় উপজাতি কল্যাণ অফিসে যান",
    "required_documents": "PVTG সদস্যপদের প্রমাণ, আধার কার্ড, ঠিকানার প্রমাণ"
  }
}
```

---

### POST /api/schemes/check-eligibility

Check if a user is eligible for a scheme.

**Request Body:**

```json
{
  "schemeId": "uuid",
  "userProfile": {
    "age": 25,
    "income": 50000,
    "category": "ST",
    "state": "West Bengal",
    "occupation": "farmer"
  },
  "language": "hi"
}
```

**Example Response:**

```json
{
  "eligible": true,
  "message": "आप इस योजना के लिए पात्र हैं क्योंकि आप अनुसूचित जनजाति श्रेणी से हैं और आपकी आय सीमा के भीतर है।",
  "matchedCriteria": [
    "category_match",
    "income_threshold"
  ],
  "nextSteps": [
    "अपने स्थानीय उपजाति कल्याण कार्यालय पर जाएं",
    "आवश्यक दस्तावेज़ जमा करें",
    "आवेदन पत्र भरें"
  ]
}
```

---

## Legal Summarization API

### POST /api/legal/summarize

Upload and summarize a legal document.

**Content-Type:** `multipart/form-data`

**Form Data:**

- `document`: File (PDF, max 10MB)
- `targetLanguage`: Language code (hi, bn, te, mr)
- `summaryLength`: Optional (short, medium, long). Default: 'medium'

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/legal/summarize \
  -F "document=@rental_agreement.pdf" \
  -F "targetLanguage=hi" \
  -F "summaryLength=medium"
```

**Example Response:**

```json
{
  "success": true,
  "summary": "यह किराया समझौता मकान मालिक और किरायेदार के बीच है। मुख्य बिंदु:\n\n1. किराया: ₹15,000 प्रति माह\n2. अवधि: 11 महीने\n3. सुरक्षा जमा: ₹45,000\n4. नोटिस अवधि: 1 महीना\n\nकिरायेदार को संपत्ति का रखरखाव करना होगा और समय पर किराया देना होगा।",
  "keyTerms": [
    {
      "term": "किराया",
      "definition": "मासिक भुगतान राशि"
    },
    {
      "term": "सुरक्षा जमा",
      "definition": "वापसी योग्य अग्रिम राशि"
    }
  ],
  "originalLength": 5420,
  "summaryLength": 245,
  "documentType": "rental_agreement",
  "processingTime": 3.2
}
```

**Status Codes:**

- 200: Success
- 400: Invalid file or parameters
- 413: File too large
- 500: Processing error

---

### GET /api/legal/history

Get user's legal document history.

**Query Parameters:**

- `userId`: User UUID (optional for hackathon)
- `limit`: Number of results. Default: 10
- `offset`: Pagination offset

**Example Response:**

```json
{
  "summaries": [
    {
      "id": "uuid",
      "document_name": "rental_agreement.pdf",
      "document_type": "rental_agreement",
      "language_code": "hi",
      "created_at": "2026-02-01T14:30:00Z",
      "summary_preview": "यह किराया समझौता..."
    }
  ],
  "total": 5
}
```

---

## Chat API

### POST /api/chat/session

Create a new chat session.

**Request Body:**

```json
{
  "languageCode": "hi",
  "userId": "uuid" // optional
}
```

**Example Response:**

```json
{
  "id": "session-uuid",
  "language_code": "hi",
  "created_at": "2026-02-02T10:00:00Z"
}
```

---

### POST /api/chat/message

Send a message in a chat session.

**Request Body:**

```json
{
  "sessionId": "session-uuid",
  "message": "मुझे किराया समझौते के बारे में जानकारी चाहिए"
}
```

**Example Response:**

```json
{
  "response": "किराया समझौता एक कानूनी दस्तावेज़ है जो मकान मालिक और किरायेदार के बीच शर्तों को परिभाषित करता है। इसमें किराया राशि, अवधि, और दोनों पक्षों की जिम्मेदारियां शामिल होती हैं। क्या आप किसी विशेष पहलू के बारे में जानना चाहते हैं?",
  "detectedLanguage": "hi",
  "messageId": "message-uuid",
  "timestamp": "2026-02-02T10:01:00Z"
}
```

---

### GET /api/chat/sessions

Get user's chat sessions.

**Query Parameters:**

- `userId`: User UUID
- `limit`: Number of results. Default: 20

**Example Response:**

```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "language_code": "hi",
      "session_name": "Rental Agreement Query",
      "last_message_at": "2026-02-02T10:05:00Z",
      "message_count": 8
    }
  ]
}
```

---

### GET /api/chat/messages/:sessionId

Get messages from a specific session.

**Path Parameters:**

- `sessionId`: Session UUID

**Example Response:**

```json
{
  "messages": [
    {
      "id": "message-uuid",
      "role": "user",
      "message_text": "मुझे किराया समझौते के बारे में जानकारी चाहिए",
      "original_language": "hi",
      "created_at": "2026-02-02T10:01:00Z"
    },
    {
      "id": "message-uuid-2",
      "role": "assistant",
      "message_text": "किराया समझौता एक कानूनी दस्तावेज़ है...",
      "original_language": "hi",
      "created_at": "2026-02-02T10:01:05Z"
    }
  ]
}
```

---

## Database Schema

### Tables Overview

```
schemes
├── id (UUID, PK)
├── scheme_code (VARCHAR, UNIQUE)
├── category (VARCHAR)
├── ministry (VARCHAR)
├── target_audience (VARCHAR)
├── budget_allocation (DECIMAL)
├── start_date (DATE)
├── end_date (DATE)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

scheme_translations
├── id (UUID, PK)
├── scheme_id (UUID, FK → schemes.id)
├── language_code (VARCHAR)
├── title (TEXT)
├── short_description (TEXT)
├── full_description (TEXT)
├── eligibility_criteria (TEXT)
├── benefits (TEXT)
├── application_process (TEXT)
├── required_documents (TEXT)
├── contact_info (TEXT)
└── created_at (TIMESTAMP)

chat_sessions
├── id (UUID, PK)
├── user_id (UUID)
├── language_code (VARCHAR)
├── session_name (VARCHAR)
├── created_at (TIMESTAMP)
└── last_message_at (TIMESTAMP)

chat_messages
├── id (UUID, PK)
├── session_id (UUID, FK → chat_sessions.id)
├── role (VARCHAR) CHECK IN ('user', 'assistant')
├── message_text (TEXT)
├── original_language (VARCHAR)
├── translated_text (TEXT)
└── created_at (TIMESTAMP)

legal_summaries
├── id (UUID, PK)
├── user_id (UUID)
├── document_name (VARCHAR)
├── document_type (VARCHAR)
├── original_text (TEXT)
├── plain_summary (TEXT)
├── translated_summary (TEXT)
├── language_code (VARCHAR)
├── key_terms (JSONB)
└── created_at (TIMESTAMP)
```

### Indexes

```sql
-- Scheme translations
CREATE INDEX idx_scheme_translations_lang ON scheme_translations(language_code);
CREATE INDEX idx_scheme_translations_scheme ON scheme_translations(scheme_id);

-- Schemes
CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_schemes_active ON schemes(is_active);
CREATE INDEX idx_schemes_code ON schemes(scheme_code);

-- Full-text search
CREATE INDEX idx_scheme_translations_search ON scheme_translations 
USING gin(to_tsvector('english', title || ' ' || short_description));

-- Chat
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);

-- Legal summaries
CREATE INDEX idx_legal_summaries_user ON legal_summaries(user_id);
CREATE INDEX idx_legal_summaries_type ON legal_summaries(document_type);
CREATE INDEX idx_legal_summaries_date ON legal_summaries(created_at DESC);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_summaries ENABLE ROW LEVEL SECURITY;

-- Schemes are public
CREATE POLICY "Anyone can view schemes"
  ON schemes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view scheme translations"
  ON scheme_translations FOR SELECT
  USING (true);

-- Users can only see their own chat data
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages from own sessions"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Users can only see their own legal summaries
CREATE POLICY "Users can view own legal summaries"
  ON legal_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legal summaries"
  ON legal_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Sample Data Insertion

```sql
-- Insert sample scheme
INSERT INTO schemes (scheme_code, category, ministry, is_active)
VALUES ('PM_JANMAN', 'tribal_welfare', 'Ministry of Tribal Affairs', true);

-- Get the scheme ID
WITH scheme AS (
  SELECT id FROM schemes WHERE scheme_code = 'PM_JANMAN'
)
-- Insert translations
INSERT INTO scheme_translations (scheme_id, language_code, title, description, eligibility, benefits)
SELECT 
  scheme.id,
  'en',
  'PM-JANMAN Scheme',
  'Comprehensive initiative for Particularly Vulnerable Tribal Groups',
  'Members of recognized PVTGs residing in designated tribal areas',
  'Housing assistance, clean drinking water, electricity, education support'
FROM scheme
UNION ALL
SELECT 
  scheme.id,
  'hi',
  'पीएम-जनमान योजना',
  'विशेष रूप से कमजोर जनजातीय समूहों के लिए व्यापक पहल',
  'निर्दिष्ट आदिवासी क्षेत्रों में रहने वाले मान्यता प्राप्त PVTG के सदस्य',
  'आवास सहायता, स्वच्छ पेयजल, बिजली, शिक्षा सहायता'
FROM scheme;
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Common Error Codes

- `INVALID_REQUEST`: Malformed request body or parameters
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `UNSUPPORTED_FORMAT`: File format not supported
- `TRANSLATION_FAILED`: Lingo.dev API error
- `DATABASE_ERROR`: Supabase query failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `UNAUTHORIZED`: Authentication required
- `NOT_FOUND`: Resource not found

---

## Rate Limiting

For production deployment, implement rate limiting:

```javascript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

// Stricter limit for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    error: {
      code: 'UPLOAD_LIMIT_EXCEEDED',
      message: 'Upload limit reached, please try again later'
    }
  }
});

app.use('/api/', apiLimiter);
app.use('/api/legal/summarize', uploadLimiter);
```

---

## API Testing

### Using cURL

**Test Schemes API:**

```bash
curl http://localhost:3000/api/schemes?category=health&lang=hi
```

**Test Legal Summarizer:**

```bash
curl -X POST http://localhost:3000/api/legal/summarize \
  -F "document=@test.pdf" \
  -F "targetLanguage=hi"
```

**Test Chat:**

```bash
# Create session
curl -X POST http://localhost:3000/api/chat/session \
  -H "Content-Type: application/json" \
  -d '{"languageCode":"hi"}'

# Send message
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"your-session-id","message":"नमस्ते"}'
```

### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "Vaani API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Schemes",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/schemes?category=health&lang=hi"
      }
    },
    {
      "name": "Summarize Document",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/legal/summarize",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "document",
              "type": "file"
            },
            {
              "key": "targetLanguage",
              "value": "hi"
            }
          ]
        }
      }
    }
  ]
}
```

---

## Performance Considerations

### Database Query Optimization

1. **Use Indexes:** All foreign keys and frequently queried columns are indexed
2. **Pagination:** Always use LIMIT and OFFSET for large result sets
3. **Select Specific Columns:** Avoid SELECT * in production
4. **Connection Pooling:** Supabase handles this automatically

### Caching Strategy

```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache scheme data
router.get('/schemes', async (req, res) => {
  const cacheKey = `schemes_${req.query.category}_${req.query.lang}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  const data = await fetchSchemes(req.query);
  cache.set(cacheKey, data);
  res.json(data);
});
```

### File Upload Optimization

```javascript
// Limit file size
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});
```

---

This API specification provides a complete reference for building and integrating with the Vaani backend.
