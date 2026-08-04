import { PrivyClient } from '@privy-io/server-auth';

// Initialize the Privy client. 
// Note: PRIVY_APP_SECRET must be set in your .env.local and Vercel.
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

/**
 * Extracts and verifies the Privy JWT token from the Authorization header.
 * @param req The incoming Request object
 * @returns The verified user ID (DID) if valid, or null if invalid/missing.
 */
export async function verifyUser(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT with Privy's public keys
    const verifiedClaims = await privy.verifyAuthToken(token);
    
    return verifiedClaims.userId;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
