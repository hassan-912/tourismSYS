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
      { name: 'Salma Ayman', username: 'salma.ayman', password: 'emp123', role: 'employee' },
      { name: 'Salma Osama', username: 'salma.osama', password: 'emp123', role: 'employee' },
      { name: 'Salma Yousry', username: 'salma.yousry', password: 'emp123', role: 'employee' },
      { name: 'Salma Moawad', username: 'salma.moawad', password: 'emp123', role: 'employee' },
      { name: 'Salma Ibrahim', username: 'salma.ibrahim', password: 'emp123', role: 'employee' },
      { name: 'Nasser', username: 'nasser', password: 'emp123', role: 'employee' },
      { name: 'Moataz', username: 'moataz', password: 'emp123', role: 'employee' },
      { name: 'Yara', username: 'yara', password: 'emp123', role: 'employee' },
      { name: 'Passant', username: 'passant', password: 'emp123', role: 'employee' },
      { name: 'Nermin', username: 'nermin', password: 'emp123', role: 'employee' },
      { name: 'Huda', username: 'huda', password: 'emp123', role: 'employee' },
      { name: 'Alaa', username: 'alaa', password: 'emp123', role: 'employee' },
      { name: 'Basant', username: 'basant', password: 'emp123', role: 'employee' },
      { name: 'Abir', username: 'abir', password: 'emp123', role: 'employee' },
      { name: 'Menna', username: 'menna', password: 'emp123', role: 'employee' },
      { name: 'Rahma', username: 'rahma', password: 'emp123', role: 'employee' },
      { name: 'Noha', username: 'noha', password: 'emp123', role: 'employee' },
      { name: 'Zayed', username: 'zayed', password: 'emp123', role: 'employee' },
      { name: 'Safaa', username: 'safaa', password: 'emp123', role: 'employee' },
      { name: 'Nayera', username: 'nayera', password: 'emp123', role: 'employee' },
      { name: 'Ali', username: 'ali', password: 'emp123', role: 'employee' },
      { name: 'Ismail', username: 'ismail', password: 'emp123', role: 'employee' },
      { name: 'Mostafa', username: 'mostafa', password: 'emp123', role: 'employee' },
      { name: 'Alaa Karam', username: 'alaa.karam', password: 'emp123', role: 'employee' },
      { name: 'Aly', username: 'aly', password: 'emp123', role: 'employee' },
      { name: 'Moustafa', username: 'moustafa', password: 'emp123', role: 'employee' },
      { name: 'Hussein', username: 'hussein', password: 'emp123', role: 'employee' },
      { name: 'Hamza', username: 'hamza', password: 'emp123', role: 'employee' },
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
