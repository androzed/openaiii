const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: "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",
});

app.use(express.json());

app.post('/chat', async (req, res) => {
  const { userMessage } = req.body;
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "" },
        { role: "user", content: userMessage }
      ],
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });
    res.json({ response: response.choices[0].message.content });
  } catch (err) {
    console.error("Error during API call:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
