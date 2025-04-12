const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

// Initialize conversation history as an empty array
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant." },
];

app.post('/chat', async (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Add the user's message to the conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    // Send the conversation history to the OpenAI API
    const response = await client.chat.completions.create({
      messages: conversationHistory,
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });

    // Get the assistant's reply
    const assistantMessage = response.choices[0].message.content;

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    // Return the assistant's response
    res.json({ response: assistantMessage });

  } catch (err) {
    console.error("Error during API call:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
