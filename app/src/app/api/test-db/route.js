import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  const results = {
    step1_env_check: null,
    step2_db_connect: null,
    step3_user_count: null,
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_uri_preview: process.env.MONGODB_URI 
      ? process.env.MONGODB_URI.substring(0, 30) + '...' 
      : 'NOT SET',
    jwt_secret_exists: !!process.env.JWT_SECRET,
  };

  // Step 1: Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    results.step1_env_check = 'FAILED - MONGODB_URI is not set!';
    return NextResponse.json(results, { status: 500 });
  }
  results.step1_env_check = 'PASSED';

  // Step 2: Try connecting to MongoDB
  try {
    await dbConnect();
    results.step2_db_connect = 'PASSED - Connected to MongoDB!';
  } catch (error) {
    results.step2_db_connect = `FAILED - ${error.message}`;
    return NextResponse.json(results, { status: 500 });
  }

  // Step 3: Check if users exist
  try {
    const count = await User.countDocuments();
    results.step3_user_count = `Found ${count} users in database`;
    
    if (count === 0) {
      results.action_needed = 'Database is EMPTY! You need to seed it. Send a POST request to /api/seed';
    }
  } catch (error) {
    results.step3_user_count = `FAILED - ${error.message}`;
  }

  return NextResponse.json(results, { status: 200 });
}
