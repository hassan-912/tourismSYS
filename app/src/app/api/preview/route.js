import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PreviewLink from '@/lib/models/PreviewLink';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all preview links
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAdmin(user);
    if (authError) return authError;

    await dbConnect();
    const links = await PreviewLink.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Get preview links error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST create preview link
export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAdmin(user);
    if (authError) return authError;

    await dbConnect();
    const { label } = await request.json();

    const link = await PreviewLink.create({
      createdBy: user.id,
      label: label || 'Preview Link',
    });

    const populated = await PreviewLink.findById(link._id).populate('createdBy', 'name');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Create preview link error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
