import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, requireAdmin, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all users
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();
    const users = await User.find().select('-password').sort({ name: 1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST create user (admin only)
export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    const normalizedRole = user.role.toLowerCase();
    const canCreateUser = ['admin', 'moderator', 'sub-admin'].includes(normalizedRole);

    if (!canCreateUser) {
      return NextResponse.json({ error: 'System restricted: Only admins and moderators can create new users.' }, { status: 403 });
    }

    await dbConnect();
    const { name, username, password, role, departments } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, username, and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Role restriction: Moderator cannot ASSIGN roles
    let assignedRole = role || 'Tourism';
    if (!['admin'].includes(normalizedRole)) {
      assignedRole = 'Tourism';
    }

    const newUser = await User.create({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
    });

    return NextResponse.json({
      id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
