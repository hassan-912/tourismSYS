import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  return seed();
}

export async function POST() {
  return seed();
}

async function seed() {
  try {
    await dbConnect();

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existingUsers });
    }

    const users = [
      { name: 'Hassan', username: 'hassan', password: 'admin123', role: 'admin' },
      { name: 'Salama Ayman', username: 'salama.ayman', password: 'emp123', role: 'employee' },
      { name: 'Salama Osama', username: 'salama.osama', password: 'emp123', role: 'employee' },
      { name: 'Salma Yousry', username: 'salma.yousry', password: 'emp123', role: 'employee' },
      { name: 'Nasser', username: 'nasser', password: 'emp123', role: 'employee' },
      { name: 'Moataz', username: 'moataz', password: 'emp123', role: 'employee' },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        username: user.username,
        password: hashedPassword,
        role: user.role,
      });
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      users: users.map(u => ({ name: u.name, username: u.username, role: u.role, password: u.password })),
    }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
