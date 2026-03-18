import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// One-time endpoint to fix names - can be deleted after use
export async function GET() {
  try {
    await dbConnect();

    const result1 = await User.updateOne(
      { username: 'salama.ayman' },
      { $set: { name: 'Salma Ayman' } }
    );

    const result2 = await User.updateOne(
      { username: 'salama.osama' },
      { $set: { name: 'Salma Osama' } }
    );

    return NextResponse.json({
      message: 'Names updated successfully',
      salama_ayman: result1.modifiedCount > 0 ? 'Updated to Salma Ayman' : 'Not found or already updated',
      salama_osama: result2.modifiedCount > 0 ? 'Updated to Salma Osama' : 'Not found or already updated',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
