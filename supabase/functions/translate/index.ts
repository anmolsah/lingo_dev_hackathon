import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranslateRequest {
  text: string;
  sourceLocale: string;
  targetLocale: string;
  apiKey?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text, sourceLocale, targetLocale, apiKey: clientKey }: TranslateRequest = await req.json();
    const apiKey = Deno.env.get("LINGODOTDEV_API_KEY") || clientKey;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Translation API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!text || !sourceLocale || !targetLocale) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, sourceLocale, targetLocale" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sourceLocale === targetLocale) {
      return new Response(
        JSON.stringify({ translatedText: text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://engine.lingo.dev/i18n", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        params: {
          workflowId: `babelchat-${Date.now()}`,
          fast: false,
        },
        locale: {
          source: sourceLocale,
          target: targetLocale,
        },
        data: { text },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(
        JSON.stringify({ error: `Translation API error: ${response.status}`, details: errorBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const translatedText = result.data?.text ?? text;

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
