import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/lib/models/Message';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET messages
export async function GET(request) {
  try {
    await dbConnect();
    const messages = await Message.find()
      .populate('replyTo', 'sender content')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST create message
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Check if this is from preview mode (manager)
    if (body.isPreview) {
      const message = await Message.create({
        sender: 'Manager',
        senderRole: 'manager',
        content: body.content,
        replyTo: body.replyTo || null,
      });
      const populated = await Message.findById(message._id).populate('replyTo', 'sender content');
      return NextResponse.json(populated, { status: 201 });
    }

    // Regular authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await Message.create({
      sender: user.name,
      senderRole: user.role,
      content: body.content,
      replyTo: body.replyTo || null,
    });

    const populated = await Message.findById(message._id).populate('replyTo', 'sender content');
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
