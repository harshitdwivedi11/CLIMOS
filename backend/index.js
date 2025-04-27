import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
app.use(express.json());

// Load from .env
const token    = process.env.GITHUB_TOKEN;
const endpoint = process.env.AZURE_ENDPOINT;
const model    = 'openai/gpt-4.1';

// Initialize Azure AI client (GitHub models)
const client = ModelClient(endpoint, new AzureKeyCredential(token));

app.post('/api/analyze', async (req, res) => {
  const { sessionUrl, metadata } = req.body;
  if (!sessionUrl || !metadata) {
    return res.status(400).json({ error: 'sessionUrl and metadata required' });
  }

  // Build your JSON-output prompt
  const prompt = `
You are an expert debugger.
Session URL: ${sessionUrl}
Metadata: ${JSON.stringify(metadata, null, 2)}

Reply ONLY with valid JSON:
{
  "summary": "...",
  "rootCause": "...",
  "fixSuggestion": "..."
}
  `.trim();

  try {
    const response = await client
      .path('/chat/completions')
      .post({
        body: {
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user',   content: prompt }
          ],
          temperature: 0.7,
          top_p: 1.0
        }
      });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const text = response.body.choices[0].message.content;
    let ai;
    try {
      ai = JSON.parse(text);
    } catch {
      ai = { raw: text };
    }

    res.json({ sessionUrl, metadata, ai });
  } catch (err) {
    console.error('AzureAI error:', err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
