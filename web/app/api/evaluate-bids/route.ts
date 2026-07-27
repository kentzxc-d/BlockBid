import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // Allow longer execution time for Vercel functions

const EvaluationSchema = z.object({
  evaluations: z.array(
    z.object({
      bidId: z.string(),
      scores: z.array(
        z.object({
          criterionName: z.string(),
          scoreAchieved: z.number(),
          maxWeight: z.number(),
          reasoning: z.string()
        })
      ),
      totalScore: z.number(),
      aiSummary: z.string()
    })
  )
});

export async function POST(req: Request) {
  try {
    const { criteria, bids, procurementDetails } = await req.json();

    if (!bids || bids.length === 0) {
      return NextResponse.json({ evaluations: [] });
    }

    const systemPrompt = `You are an expert government procurement evaluator.
Your job is to evaluate supplier bids against the project requirements and criteria.
Be extremely objective and rigorous.

Project Details:
Title: ${procurementDetails.title}
Description: ${procurementDetails.description}
Budget: ${procurementDetails.budget}

Evaluation Criteria:
${criteria.map((c: any) => `- ${c.name} (Max Score: ${c.weight})`).join('\n')}

For each bid, evaluate it against EVERY criterion. 
The scoreAchieved for a criterion MUST NOT exceed its maxWeight.
totalScore must be the sum of all scoreAchieved for that bid.
aiSummary should be a professional, 2-3 sentence justification of the total score.`;

    const userPrompt = `Evaluate the following bids:\n\n${JSON.stringify(bids, null, 2)}`;

    const { object } = await generateObject({
      model: google('models/gemini-1.5-pro-latest'),
      schema: EvaluationSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      for (const ev of object.evaluations) {
        await supabase
          .from('bids')
          .update({
            ai_score: ev.totalScore,
            ai_reasoning: JSON.stringify(ev)
          })
          .eq('id', ev.bidId);
      }
    }

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("AI Evaluation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate bids" }, { status: 500 });
  }
}
