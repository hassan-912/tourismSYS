import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, requireAdmin } from '@/lib/auth';

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAdmin(user);
    if (authError) return authError;

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'System restricted: Only the main admin can delete users' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAdmin(user);
    if (authError) return authError;

    await dbConnect();
    const { id } = await params;
    const { name, username, password, role } = await request.json();

    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username.toLowerCase();
    
    // Check if trying to change role to admin
    if (role) {
       const targetUser = await User.findById(id);
       
       // Only main admin can grant admin role
       if (targetUser && targetUser.role !== 'admin' && role.toLowerCase() === 'admin') {
          if (user.role !== 'admin') {
             return NextResponse.json({ error: 'Only main admin can grant Admin permissions' }, { status: 403 });
          }
       }
       updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
