export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, systemInstruction } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const geminiApiKey = process.env.SMART_BHARAT_GEMINI_API_KEY;
  const groqApiKey = process.env.SMART_BHARAT_GROQ_API_KEY;
  const provider = (process.env.SMART_BHARAT_AI_PROVIDER || "gemini").toLowerCase().trim();

  if (!geminiApiKey && !groqApiKey) {
    console.error("Vercel API error: Missing both API keys.");
    return res.status(500).json({ error: "API keys are not configured on Vercel." });
  }

  async function callGemini(prompt, systemInstruction) {
    if (!geminiApiKey) throw new Error("Gemini API key is not set.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };
    if (systemInstruction) {
      requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("");
    if (!replyText) throw new Error("Gemini returned an empty response.");
    return replyText;
  }

  async function callGroq(prompt, systemInstruction) {
    if (!groqApiKey) throw new Error("Groq API key is not set.");
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const messages = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
    messages.push({ role: "user", content: prompt });
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const replyText = data?.choices?.[0]?.message?.content;
    if (!replyText) throw new Error("Groq returned an empty response.");
    return replyText;
  }

  const primaryCall = provider === "groq" ? callGroq : callGemini;
  const fallbackCall = provider === "groq" ? callGemini : callGroq;
  
  try {
    const reply = await primaryCall(prompt, systemInstruction);
    return res.status(200).json({ reply });
  } catch (primaryError) {
    try {
      const reply = await fallbackCall(prompt, systemInstruction);
      return res.status(200).json({ reply });
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: `Both providers failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}` 
      });
    }
  }
}
