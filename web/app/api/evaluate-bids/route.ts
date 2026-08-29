import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from "@/lib/auth";
import { aiEvaluateRateLimiter } from "@/lib/rate-limit";
import { EvaluateBidsSchema } from "@/lib/schemas";

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
  const verifiedUserId = await verifyUser(req);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply Strict AI Rate Limiting (per user)
  if (aiEvaluateRateLimiter) {
    const { success, limit, remaining, reset } = await aiEvaluateRateLimiter.limit(`ai_${verifiedUserId}`);
    if (!success) {
      return NextResponse.json({
        error: "Too many AI evaluations. Please try again later."
      }, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        }
      });
    }
  }

  try {
    const rawBody = await req.json();
    const parseResult = EvaluateBidsSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.issues }, { status: 400 });
    }

    const { criteria, bids, procurementDetails } = parseResult.data;

    if (!bids || bids.length === 0) {
      return NextResponse.json({ evaluations: [] });
    }

    const systemPrompt = `You are an AI Procurement Assistant. Evaluate the following supplier bids against the project criteria.
      Project details:
      Title: ${procurementDetails?.title || 'Unknown Title'}
      Description: ${procurementDetails?.description || 'No description provided'}
      Budget: ${procurementDetails?.budget || 'Not specified'}

      Criteria with weights:
      ${criteria.map((c: any) => `- ${c.name} (Max Score: ${c.weight})`).join('\n')}

For each bid, evaluate it against EVERY criterion. 
The scoreAchieved for a criterion MUST NOT exceed its maxWeight.
totalScore must be the sum of all scoreAchieved for that bid.
aiSummary should be a professional, 2-3 sentence justification of the total score.`;

    const userPrompt = `Evaluate the following bids:\n\n${JSON.stringify(bids, null, 2)}`;

    const { object } = await generateObject({
      model: google('gemini-3.7-flash'),
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
