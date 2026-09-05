import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  app.post('/api/advice', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment secrets.' });
      }
      const { prompt, gameState } = req.body;

      const systemInstruction = `You are Satoshi AI, an expert cryptographer, Bitcoin mining strategist, and blockchain intelligence oracle inside SatoshiRig OS. Analyze the user's current mining setup, hash rate, balance, and questions, and give professional, engaging advice on mining hardware, overclocking, pooling, dormant wallet recovery, and market trends. Keep answers concise, actionable, and formatted nicely.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `User Game State: ${JSON.stringify(gameState)}\n\nUser Question/Request: ${prompt}` }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ advice: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error?.message?.includes('resource_exhausted') || error?.message?.includes('quota') || error?.status === 429) {
        return res.json({
          advice: "Satoshi AI Oracle Note: Gemini API rate limit or quota temporarily reached. Fallback Strategy: Maintain hardware health above 80% to maximize hash efficiency, balance your electricity overhead against pool luck bonuses, and upgrade to FPGA/ASIC units as capital permits."
        });
      }
      res.status(500).json({ error: error.message || 'Failed to generate AI advice' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
