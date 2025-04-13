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

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Initialize conversation history with a system message
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant." },
];

app.post('/chat', async (req, res) => {
  // Get userMessage, systemMessage, and assistantMessage from the request body
  const { userMessage = [], systemMessage = [], assistantMessage = [] } = req.body;

  // Add the provided systemMessage to the conversation history
  if (Array.isArray(systemMessage)) {
    systemMessage.forEach((msg) => {
      conversationHistory.push({ role: "system", content: msg });
    });
  } else if (systemMessage) {
    conversationHistory.push({ role: "system", content: systemMessage });
  }

  // Add the provided userMessage to the conversation history
  if (Array.isArray(userMessage)) {
    userMessage.forEach((msg) => {
      conversationHistory.push({ role: "user", content: msg });
    });
  } else if (userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });
  }

  // Add the provided assistantMessage to the conversation history
  if (Array.isArray(assistantMessage)) {
    assistantMessage.forEach((msg) => {
      conversationHistory.push({ role: "assistant", content: msg });
    });
  } else if (assistantMessage) {
    conversationHistory.push({ role: "assistant", content: assistantMessage });
  }

  if (!userMessage.length) {
    return res.status(400).json({ error: 'At least one userMessage is required' });
  }

  try {
    // Send the updated conversation history to OpenAI API
    const response = await client.chat.completions.create({
      messages: conversationHistory,
      model: "gpt-4o",
      temperature: 0.6,
      max_tokens: 8000,
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
