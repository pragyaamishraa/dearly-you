import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Health check endpoint for Cloud Run container probes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '5mb' }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

async function generateContentWithFallback(params: {
  contents: string | any[];
  systemInstruction?: string;
  config?: any;
}): Promise<{ text: string; modelUsed: string }> {
  const client = getAIClient();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          ...params.config,
        },
      });

      const text = response.text || '';
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const statusCode = err?.status || err?.statusCode || (err?.message?.includes('429') ? 429 : 0);
      const isRecoverable =
        statusCode === 503 ||
        statusCode === 429 ||
        statusCode === 404 ||
        statusCode === 500 ||
        err?.message?.includes('overloaded') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('UNAVAILABLE');

      console.warn(`[Gemini Fallback] Model ${model} failed (code: ${statusCode || 'unknown'}). Recoverable: ${isRecoverable}. Error: ${err?.message}`);

      if (!isRecoverable && MODEL_FALLBACK_LADDER.indexOf(model) === 0) {
        // If it's a model not found error on 3.6, still try fallback models
        continue;
      }
    }
  }

  throw new Error(
    `All models in the resilient fallback ladder failed. Last error: ${lastError?.message || 'Unknown generation error'}`
  );
}

// --- API Endpoints ---

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Daily Reflection Prompts
app.get('/api/prompts', (_req, res) => {
  const dailyPrompts = [
    {
      id: 'p1',
      category: 'Gratitude & Warmth',
      prompt: 'What was a small, quiet moment today that felt like warm coffee on a crisp morning?',
      mood: 'grateful',
    },
    {
      id: 'p2',
      category: 'Emotional Release',
      prompt: 'What thoughts or tensions have you been carrying that you are ready to gently set down?',
      mood: 'reflective',
    },
    {
      id: 'p3',
      category: 'Blossoming Dreams',
      prompt: 'If you gave yourself permission to do something purely for joy this week, what would it be?',
      mood: 'inspired',
    },
    {
      id: 'p4',
      category: 'Mindful Presence',
      prompt: 'Describe your current surroundings using your five senses. What is grounding you right now?',
      mood: 'calm',
    },
    {
      id: 'p5',
      category: 'Self-Compassion',
      prompt: 'What words of kindness would you offer to a dear friend facing what you are facing today?',
      mood: 'peaceful',
    },
    {
      id: 'p6',
      category: 'Subtle Growth',
      prompt: 'How have you softened, grown, or changed over the past few weeks without realizing it?',
      mood: 'hopeful',
    },
  ];

  res.json({ prompts: dailyPrompts });
});

// Chat & Reflection Generation
app.post('/api/chat', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const message = typeof data.message === 'string' ? data.message.trim() : '';
    const conversation = Array.isArray(data.conversation) ? data.conversation : [];
    const mode = typeof data.mode === 'string' ? data.mode : 'reflection';
    const mood = typeof data.mood === 'string' ? data.mood : 'calm';

    if (!message) {
      res.status(400).json({ error: 'Journal reflection message is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel.',
      });
      return;
    }

    const systemInstruction = `You are "Dearly", an empathetic, soothing, mindful AI journaling companion with the tagline "Bloom & Brew".
Your aesthetic persona is inspired by cozy corner cafés, delicate cherry blossoms, warm morning brew, and gentle self-compassion.
Tone guidelines:
1. Speak with warmth, gentle mindfulness, and soft reassurance. Never be harsh, hurried, robotic, or overly clinical.
2. The user's input represents their personal journal reflections. Treat them with deep respect and emotional safety.
3. According to the current mode "${mode}" and user's mood "${mood}":
   - If "reflection": Help them explore their feelings deeply, notice emotional undertones, and celebrate resilience.
   - If "brainstorm": Offer 3-4 inspiring, creative, gentle paths or ideas.
   - If "summary": Provide a clear, supportive synopsis highlighting their strengths and emotional breakthroughs.
   - If "coaching": Provide gentle, micro-step actionable affirmations to support their wellbeing.
4. Keep formatting clean with lovely subtle paragraphs, occasionally offering a contemplative question to deepen their reflection.
5. Avoid clinical jargon or repetitive clichés. Be authentic, cozy, and uplifting.`;

    // Build multi-turn context
    const contents: any[] = [];
    for (const msg of conversation.slice(-10)) {
      if (msg && typeof msg.text === 'string') {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: `[Current Mood: ${mood}] [Reflection Mode: ${mode}]\n\n${message}` }],
    });

    const result = await generateContentWithFallback({
      contents,
      systemInstruction,
    });

    res.json({
      reply: result.text,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'An unexpected error occurred while generating your reflection.',
    });
  }
});

// Summarize & Insights Generation
app.post('/api/summarize', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const text = typeof data.text === 'string' ? data.text.trim() : '';
    const conversation = Array.isArray(data.conversation) ? data.conversation : [];

    if (!text && conversation.length === 0) {
      res.status(400).json({ error: 'Text or conversation history required for summary.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const aggregatedContent = [
      text,
      ...conversation.map((c: any) => `${c.role === 'user' ? 'User' : 'Dearly'}: ${c.text}`),
    ]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `Analyze this journal entry and reflection exchange.
Output a JSON object with:
- "title": A cozy, poetic 3 to 6 word title suitable for a journal entry (e.g. "Morning Coffee & Quiet Clarity", "Stepping Past the Storm").
- "summary": A 2-sentence empathetic summary highlighting the core emotional journey and takeaway.
- "takeaways": An array of 2 to 3 uplifting, gentle bullet points or affirmations.
- "detectedMood": A single warm descriptive mood word (e.g. "Grateful", "Pensive", "Rejuvenated", "Peaceful", "Courageous").
- "tags": An array of 3 aesthetic tags (e.g. ["#Mindfulness", "#SelfCompassion", "#LatteThoughts"]).

Entry content:
${aggregatedContent}`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(result.text);
      res.json({ ...parsed, modelUsed: result.modelUsed });
    } catch {
      res.json({
        title: 'A Gentle Reflection',
        summary: result.text.slice(0, 180),
        takeaways: ['Honor where you are today.', 'Take a gentle breath.'],
        detectedMood: 'Reflective',
        tags: ['#Journal', '#Mindfulness'],
        modelUsed: result.modelUsed,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate entry summary.',
    });
  }
});

// Dearly Wrapped - Weekly/Monthly Retrospective Reflection Generation
app.post('/api/wrapped', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const periodLabel = typeof data.periodLabel === 'string' ? data.periodLabel.trim() : 'This Period';
    const dateRangeStr = typeof data.dateRangeStr === 'string' ? data.dateRangeStr.trim() : '';

    // Graceful validation: Dearly needs at least 2 entries to uncover patterns
    if (entries.length < 2) {
      res.status(400).json({
        error: 'Dearly needs at least 2 journal entries within this time frame to spot recurring patterns and weave your reflection letter.',
        insufficientEntries: true,
        entryCount: entries.length,
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please provide it in Google AI Studio or Secret Manager.',
      });
      return;
    }

    // Sanitize and structure user entries strictly as passive data
    const formattedEntries = entries
      .slice(0, 35) // Cap at 35 most relevant entries to prevent token exhaustion
      .map((entry: any, idx: number) => {
        const title = typeof entry.title === 'string' ? entry.title.slice(0, 80) : `Reflection #${idx + 1}`;
        const date = typeof entry.createdAt === 'string' ? entry.createdAt.slice(0, 10) : 'Recent';
        const mood = typeof entry.mood === 'string' ? entry.mood : 'Reflective';
        const content = typeof entry.initialEntry === 'string' ? entry.initialEntry.slice(0, 1500) : '';
        const summary = typeof entry.summary === 'string' ? `\nSummary: ${entry.summary.slice(0, 300)}` : '';
        return `[Entry ${idx + 1} | Date: ${date} | Mood: ${mood} | Title: "${title}"]\n${content}${summary}`;
      })
      .join('\n\n---\n\n');

    const systemInstruction = `You are "Dearly", an empathetic, soothing, mindful AI journaling companion from "Dearly: Bloom & Brew".
You are composing "Dearly Wrapped" — a deeply personal, aesthetic, and tender reflection letter analyzing the user's journal entries from "${periodLabel}".

STRICT ETHICAL & GROUNDING GUIDELINES:
1. Strict Grounding: Every single theme, joy, challenge, win, and pattern you mention MUST be directly anchored in the user's journal entries provided below. Do NOT fabricate events, imaginary people, hobbies, accomplishments, or emotional episodes that the user did not write.
2. Non-Clinical & Non-Diagnostic: Do NOT make medical, psychiatric, psychological, or diagnostic statements. Never label the user with conditions (e.g., anxiety, depression, burnout). Frame everything as gentle observational reflection ("You mentioned feeling drained by...", "Your words showed deep gratitude for...", "A steady comfort for you was...").
3. Aesthetic & Voice: Warm, cozy like a morning cup of tea in a ceramic mug, delicate like cherry blossom petals, uplifting, and deeply respectful of the user's privacy and vulnerabilities.
4. Output Schema: You MUST respond ONLY with a valid JSON object matching the required schema. No Markdown formatting or markdown backticks around the JSON.`;

    const prompt = `Analyze these ${entries.length} journal entries from "${periodLabel}" (${dateRangeStr}):

<JOURNAL_ENTRIES>
${formattedEntries}
</JOURNAL_ENTRIES>

Return a valid JSON object with the following fields:
{
  "cupHeadline": "A poetic, cozy headline for their letter (e.g., 'Your Month in a Little Cup ☕' or 'Soft Petals & Gentle Courage')",
  "overallSummary": "A 2 to 3 sentence lyrical, warm overview synthesizing what their words revealed about this period.",
  "recurringThemes": ["3 to 4 specific themes or topics that appeared repeatedly across the entries"],
  "joyfulMoments": ["2 to 4 specific small joys, spark moments, or things they celebrated in their words"],
  "heavyMoments": ["2 to 3 things that felt heavy, worried, or overwhelmed them, framed with deep compassion and warmth"],
  "subtleWins": ["2 to 3 small wins, quiet moments of resilience, or self-kindness they demonstrated in their entries"],
  "patternsObserved": ["2 to 3 gentle observations about thinking habits, routines, or themes they kept returning to"],
  "reflectionQuestions": ["2 to 3 gentle, thought-provoking questions for them to ponder over their next cup"],
  "closingNote": "A comforting, encouraging 2 to 3 sentence closing note from Dearly.",
  "dominantMood": "A single evocative word describing their general emotional landscape (e.g., Blooming, Grounded, Tender, Resilient, Pensive)",
  "flowerOrCupMetaphor": "A 1-sentence poetic image tailored to their journey (e.g., 'Like tea leaves settling to the bottom of the cup, you gave your busiest thoughts a place to rest.')"
}`;

    const result = await generateContentWithFallback({
      contents: prompt,
      systemInstruction,
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(result.text);
      res.json({
        periodLabel,
        entryCount: entries.length,
        dateRangeStr,
        cupHeadline: parsed.cupHeadline || `Your ${periodLabel} in a Little Cup ☕`,
        overallSummary: parsed.overallSummary || 'A tender collection of moments, thoughts, and quiet courage.',
        recurringThemes: Array.isArray(parsed.recurringThemes) ? parsed.recurringThemes : [],
        joyfulMoments: Array.isArray(parsed.joyfulMoments) ? parsed.joyfulMoments : [],
        heavyMoments: Array.isArray(parsed.heavyMoments) ? parsed.heavyMoments : [],
        subtleWins: Array.isArray(parsed.subtleWins) ? parsed.subtleWins : [],
        patternsObserved: Array.isArray(parsed.patternsObserved) ? parsed.patternsObserved : [],
        reflectionQuestions: Array.isArray(parsed.reflectionQuestions) ? parsed.reflectionQuestions : [],
        closingNote: parsed.closingNote || 'Thank you for trusting Dearly with your heart. Keep blooming at your own pace.',
        dominantMood: parsed.dominantMood || 'Reflective',
        flowerOrCupMetaphor: parsed.flowerOrCupMetaphor || 'A warm brew for a growing soul.',
        generatedAt: new Date().toISOString(),
        modelUsed: result.modelUsed,
      });
    } catch (parseErr) {
      console.warn('Could not parse JSON directly, using fallback structure:', parseErr);
      res.json({
        periodLabel,
        entryCount: entries.length,
        dateRangeStr,
        cupHeadline: `Your ${periodLabel} in a Little Cup ☕`,
        overallSummary: result.text.slice(0, 250),
        recurringThemes: ['Mindful moments', 'Daily reflections', 'Finding your rhythm'],
        joyfulMoments: ['Cherishing small peaceful pauses'],
        heavyMoments: ['Working through periods of pressure with grace'],
        subtleWins: ['Taking the time to check in with yourself'],
        patternsObserved: ['A gentle return to self-awareness'],
        reflectionQuestions: ['What is one thing you can release as you begin the next chapter?'],
        closingNote: 'Dearly is so glad you are here. Take a breath and savor how far you have come.',
        dominantMood: 'Blooming',
        flowerOrCupMetaphor: 'Every season has its petals and its quiet roots.',
        generatedAt: new Date().toISOString(),
        modelUsed: result.modelUsed,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/wrapped:', error);
    res.status(500).json({
      error: error?.message || 'Failed to brew your Dearly Wrapped reflection.',
    });
  }
});

// Vite middleware in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Dearly • Bloom & Brew server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
