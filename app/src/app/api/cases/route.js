import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Case, { calculateProgress } from '@/lib/models/Case';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // Fixes Vercel caching/refreshing issues

// GET all cases
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const search = searchParams.get('search');

    let filter = {};
    if (country && country !== 'all') {
      filter.country = country;
    }
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { odooId: { $regex: search, $options: 'i' } },
      ];
    }

    const cases = await Case.find(filter)
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST create new case
export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();
    const body = await request.json();

    const newCase = new Case({
      ...body,
      createdBy: user.id,
    });

    newCase.progress = calculateProgress(newCase);
    await newCase.save();

    const populated = await Case.findById(newCase._id).populate('createdBy', 'name username');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Create case error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
