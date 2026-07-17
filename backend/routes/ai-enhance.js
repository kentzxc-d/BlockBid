const express = require('express');
const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text || !type) {
      return res.status(400).json({ error: "Missing required fields: text or type" });
    }

    let prompt = "";
    if (type === "procurement") {
      prompt = `
        You are an expert procurement officer. Rewrite the following project description to make it highly professional, clear, and structured. 
        Fix any grammatical errors. Maintain all original requirements and constraints. Do not add fictitious information.
        DO NOT use any markdown formatting (like ** for bolding). Output plain text only, though you may use standard dashes (-) for bullet points.
        
        Original text:
        "${text}"
      `;
    } else if (type === "bid") {
      prompt = `
        You are an expert proposal writer for B2B contracts. Rewrite the following bid proposal to make it highly professional, persuasive, and structured.
        Fix any grammatical errors. Maintain all original capabilities, pricing, and timelines. Do not add fictitious information.
        DO NOT use any markdown formatting (like ** for bolding). Output plain text only, though you may use standard dashes (-) for bullet points.
        
        Original text:
        "${text}"
      `;
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'procurement' or 'bid'." });
    }

    const { text: enhancedText } = await generateText({
      model: google('gemini-3.5-flash'),
      prompt: prompt,
    });

    // Strip any lingering double asterisks just in case the model ignores the prompt
    const cleanedText = enhancedText.replace(/\*\*/g, '').trim();

    return res.status(200).json({ success: true, enhancedText: cleanedText });

  } catch (err) {
    console.error("AI Enhance API Error:", err);
    return res.status(500).json({ error: err.message || "Failed to enhance text" });
  }
});

module.exports = router;
