import { supabase } from './supabase';

const TRANSLATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`;

async function callLingoApi(
  text: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string> {
  const response = await fetch(TRANSLATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      text,
      sourceLocale,
      targetLocale,
      apiKey: import.meta.env.VITE_LINGODOTDEV_API_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const result = await response.json();
  return result.translatedText ?? text;
}

export async function translateMessage(
  messageId: string,
  content: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (sourceLanguage === targetLanguage) {
    return content;
  }

  const { data: cached } = await supabase
    .from('message_translations')
    .select('translated_content')
    .eq('message_id', messageId)
    .eq('target_language', targetLanguage)
    .maybeSingle();

  if (cached) {
    return cached.translated_content;
  }

  try {
    const translated = await callLingoApi(content, sourceLanguage, targetLanguage);

    await supabase.from('message_translations').insert({
      message_id: messageId,
      target_language: targetLanguage,
      translated_content: translated,
    });

    return translated;
  } catch {
    return content;
  }
}

export async function batchTranslateMessages(
  messages: { id: string; content: string; sourceLanguage: string }[],
  targetLanguage: string
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  const { data: cached } = await supabase
    .from('message_translations')
    .select('message_id, translated_content')
    .in(
      'message_id',
      messages.map((m) => m.id)
    )
    .eq('target_language', targetLanguage);

  const cachedMap = new Map(
    (cached ?? []).map((t) => [t.message_id, t.translated_content])
  );

  const toTranslate = messages.filter((m) => {
    if (m.sourceLanguage === targetLanguage) {
      results.set(m.id, m.content);
      return false;
    }
    if (cachedMap.has(m.id)) {
      results.set(m.id, cachedMap.get(m.id)!);
      return false;
    }
    return true;
  });

  await Promise.all(
    toTranslate.map(async (msg) => {
      try {
        const translated = await callLingoApi(
          msg.content,
          msg.sourceLanguage,
          targetLanguage
        );

        results.set(msg.id, translated);

        await supabase.from('message_translations').insert({
          message_id: msg.id,
          target_language: targetLanguage,
          translated_content: translated,
        });
      } catch {
        results.set(msg.id, msg.content);
      }
    })
  );

  return results;
}
