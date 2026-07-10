import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('web/.env.local') });

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function main() {
  console.log("Starting...");
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        test: z.string()
      }),
      prompt: 'say hello',
    });
    console.log(object);
  } catch(e) {
    console.error(e);
  }
}
main();
