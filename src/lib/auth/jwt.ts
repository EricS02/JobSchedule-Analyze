import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function signJwtToken(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error signing JWT token:', error);
    throw error;
  }
}

export async function verifyJwtToken(token: string) {
  try {
    console.log('JWT: Attempting to verify token with secret length:', JWT_SECRET.length);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('JWT: Token verification successful, payload:', payload);
    return payload;
  } catch (error) {
    console.error('JWT: Error verifying JWT token:', error);
    return null;
  }
}

export async function createTestToken() {
  // First, ensure the test user exists
  let testUser;
  try {
    const prisma = (await import('@/lib/db')).default;
    
    testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password_placeholder',
          createdAt: new Date()
        }
      });
    }
    
    const payload = {
      userId: testUser.id, // Use the actual user ID from the database
      email: testUser.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    };
    
    return await signJwtToken(payload);
  } catch (error) {
    console.error("Error creating test token:", error);
    throw error;
  }
} 