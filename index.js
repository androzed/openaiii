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

// Initialize conversation history with a system message
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant." },
];

app.post('/chat', async (req, res) => {
  // Get userMessage, systemMessage, and assistantMessage from the request body
  const { userMessage = [], systemMessage = [], assistantMessage = [] } = req.body;

  // Add the provided systemMessage to the conversation history
  systemMessage.forEach((msg) => {
    conversationHistory.push({ role: "system", content: msg });
  });

  // Add the provided userMessage to the conversation history
  userMessage.forEach((msg) => {
    conversationHistory.push({ role: "user", content: msg });
  });

  // Add the provided assistantMessage to the conversation history
  assistantMessage.forEach((msg) => {
    conversationHistory.push({ role: "assistant", content: msg });
  });

  if (!userMessage.length) {
    return res.status(400).json({ error: 'At least one userMessage is required' });
  }

  try {
    // Send the updated conversation history to OpenAI API
    const response = await client.chat.completions.create({
      messages: conversationHistory,
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });

    // Get the assistant's response
    const assistantMessageResponse = response.choices[0].message.content;

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: "assistant", content: assistantMessageResponse });

    // Return the assistant's response
    res.json({ response: assistantMessageResponse });

  } catch (err) {
    console.error("Error during API call:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
