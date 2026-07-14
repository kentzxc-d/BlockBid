import { NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, type } = await request.json();

    if (!text || !type) {
      return NextResponse.json({ error: "Missing required fields: text or type" }, { status: 400 });
    }

    let prompt = "";
    if (type === "procurement") {
      prompt = `
        You are an expert procurement officer. Rewrite the following project description to make it highly professional, clear, and structured. 
        Fix any grammatical errors. Maintain all original requirements and constraints. Do not add fictitious information.
        Format it cleanly with brief bullet points if necessary.
        
        Original text:
        "${text}"
      `;
    } else if (type === "bid") {
      prompt = `
        You are an expert proposal writer for B2B contracts. Rewrite the following bid proposal to make it highly professional, persuasive, and structured.
        Fix any grammatical errors. Maintain all original capabilities, pricing, and timelines. Do not add fictitious information.
        Format it cleanly.
        
        Original text:
        "${text}"
      `;
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'procurement' or 'bid'." }, { status: 400 });
    }

    const { text: enhancedText } = await generateText({
      model: google('gemini-3.5-flash'),
      prompt: prompt,
    });

    return NextResponse.json({ success: true, enhancedText: enhancedText.trim() }, { status: 200 });

  } catch (err: any) {
    console.error("AI Enhance API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to enhance text" }, { status: 500 });
  }
}
