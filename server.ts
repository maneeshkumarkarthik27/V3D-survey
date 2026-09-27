import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

// Support large image payloads (e.g. high-res phone captures or photo uploads)
app.use(express.json({ limit: '35mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// POST /api/analyze-house
// Performs multimodal Gemini Vision analysis on the uploaded house photograph
// returning fine-grained architectural parameters to construct an accurate 3D model
app.post('/api/analyze-house', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallback: true
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const prompt = `You are an expert Cadastral Architectural Surveyor and 3D Photogrammetry Engineer.
Analyze this uploaded photograph of a house or building. Your mission is to extract the exact real-world architectural geometry and colors so that our 3D engine generates a 3D digital twin that matches this specific house.

Return a JSON object with EXACTLY the following structure:
{
  "detectedFloors": <number, count of visible above-ground floors, e.g. 1 for single-story cottage/bungalow, 2 for two-story villa/duplex, 3 for 3-story, 4 for 4-story>,
  "approxHeightMeters": <number, estimated total building height in meters including roof, e.g. 5.5 for 1-floor, 8.5 for 2-floor, 12 for 3-floor>,
  "widthMeters": <number, estimated front facade width in meters, between 12 and 26>,
  "lengthMeters": <number, estimated building depth in meters, between 10 and 22>,
  "roofType": <"pitched" | "hipped" | "flat" | "mansard" | "shed">,
  "roofColor": <hex color string representing the actual roof in the photo, e.g. terracotta "#B45309", slate grey "#475569", brown tile "#78350F", charcoal "#1E293B", red tile "#991B1B">,
  "wallColor": <hex color string representing the primary exterior wall/facade color in the photo, e.g. crisp white "#F8FAFC", warm cream "#FEF3C7", beige "#F5F5DC", pale grey "#E2E8F0", brick red "#B91C1C", yellow stucco "#FEF08A">,
  "trimColor": <hex color string for window frames and corner columns, e.g. "#FFFFFF", "#1E293B", "#78350F">,
  "buildingUsage": <"House" | "Apartment" | "Office">,
  "architecturalStyle": <descriptive phrase, e.g. "Modern Two-Story Gabled Villa", "Traditional Sloped-Roof Cottage", "Contemporary Flat-Roof Terrace House", "Colonial Style Bungalow">,
  "hasBalconies": <boolean, true if upper-level balconies, verandas, or railings are visible>,
  "hasPorch": <boolean, true if front entrance portico, covered porch, or veranda pillars are visible on ground floor>,
  "hasGarage": <boolean, true if attached garage, carport, or vehicle bay is visible>,
  "hasChimney": <boolean, true if chimney stack is visible on the roof>,
  "windowColumns": <number, count of window columns across the front facade, e.g. 2, 3, or 4>,
  "doorPosition": <"left" | "center" | "right">,
  "dominantColors": {
    "primaryWall": <hex string>,
    "roof": <hex string>,
    "trim": <hex string>,
    "windowGlass": <hex string>
  },
  "detectedFeaturesSummary": [
    <4 to 6 concise bullet strings describing specific visual features from this photo, e.g. "Pitched terracotta gabled roof with distinct ridge line", "Crisp white masonry facade with two above-ground stories", "Ground-level covered entrance porch supported by twin pillars", "Three symmetric multi-pane window bays across the upper level">
  ]
}

Ensure the JSON is strictly valid with no Markdown code fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text?.trim() || '{}';
    const analysis = JSON.parse(responseText);

    return res.json({
      success: true,
      analysis,
      modelUsed: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    console.error('Server Gemini analysis error:', err);
    return res.status(500).json({
      error: err.message || 'AI Analysis failed',
      fallback: true
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`V3D Survey Server listening on port ${PORT}`);
  });
}

startServer();
