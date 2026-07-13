import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define the expected output structure using Zod
const evaluationSchema = z.object({
  evaluations: z.array(
    z.object({
      bidId: z.string(),
      scores: z.array(
        z.object({
          criterionName: z.string(),
          scoreAchieved: z.number().describe("The score this bid achieved for this specific criterion based on its weight. Max score is the weight itself."),
          maxWeight: z.number(),
          reasoning: z.string().describe("Brief 1-sentence reason for this specific score.")
        })
      ),
      totalScore: z.number().describe("Sum of all criteria scores out of 100"),
      aiSummary: z.string().describe("A 2-3 sentence overall summary of this bid's strengths and weaknesses.")
    })
  )
});

export const runtime = 'edge'; // Use Edge runtime to avoid 10s Node serverless timeout

export async function POST(req: Request) {
  try {
    const { criteria, bids, procurementDetails } = await req.json();

    if (!criteria || !bids || !procurementDetails) {
      return NextResponse.json({ error: "Missing required fields: criteria, bids, or procurementDetails" }, { status: 400 });
    }

    const prompt = `
      You are an expert procurement evaluator acting as an unbiased judge. 
      You are evaluating bids for a project titled: "${procurementDetails.title}".
      Description: "${procurementDetails.description}".
      Estimated Budget: ${procurementDetails.budget}.

      Here are the dynamic criteria and their weights (Total 100%):
      ${JSON.stringify(criteria, null, 2)}

      Here are the anonymous bids submitted by suppliers:
      ${JSON.stringify(bids, null, 2)}

      Evaluate each bid strictly against the provided criteria.
      For each bid, assign a score for each criterion up to its maximum weight.
      For example, if "Price" is weighted at 40%, the maximum score is 40. A highly competitive price should score close to 40.
      Calculate the total score.
      Provide a brief reasoning for each score, and an overall summary for the bid.
    `;

    // Use gemini-1.5-flash for maximum speed to avoid Vercel 504 Timeouts
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: evaluationSchema,
      prompt: prompt,
    });

    // Save the evaluations back to Supabase
    const updatePromises = object.evaluations.map(async (evaluation) => {
      // Find the bid in the DB by id. 
      // The frontend should pass the bid.id as the bidId.
      const { error } = await supabase
        .from('bids')
        .update({
          ai_score: evaluation.totalScore,
          ai_reasoning: JSON.stringify(evaluation),
          status: 'evaluated'
        })
        .eq('id', evaluation.bidId);
      
      if (error) {
        console.error(`Failed to update bid ${evaluation.bidId}:`, error);
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("AI Evaluation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate bids." }, { status: 500 });
  }
}
