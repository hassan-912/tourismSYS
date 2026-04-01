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
    const users = await User.find().select('-password').sort({ order: 1, name: 1 });

    const stats = await import('@/lib/models/Case').then(m => m.default).then(Case => 
      Case.aggregate([
        {
          $group: {
            _id: { createdBy: "$createdBy", country: "$country" },
            count: { $sum: 1 }
          }
        }
      ])
    );

    const usersWithStats = users.map(u => {
      const uObj = u.toObject();
      uObj.caseStats = { Schengen: 0, USA: 0, UK: 0, Canada: 0 };
      
      stats.forEach(stat => {
        if (stat._id.createdBy && stat._id.createdBy.toString() === u._id.toString()) {
           if (['Schengen', 'USA', 'UK', 'Canada'].includes(stat._id.country)) {
             uObj.caseStats[stat._id.country] = stat.count;
           }
        }
      });
      return uObj;
    });

    return NextResponse.json(usersWithStats);
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

// PUT update users order
export async function PUT(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    if (!['admin', 'moderator', 'sub-admin'].includes(user.role?.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds array required' }, { status: 400 });
    }

    await dbConnect();
    
    const updates = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } }
      }
    }));
    
    await User.bulkWrite(updates);

    return NextResponse.json({ success: true, message: 'Users reordered' });
  } catch (error) {
    console.error('Reorder users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
