import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Case from '@/lib/models/Case';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();

    const totalCases = await Case.countDocuments();
    const countries = ['Schengen', 'USA', 'UK', 'Canada'];

    const countryStats = {};
    for (const country of countries) {
      const cases = await Case.find({ country });
      const count = cases.length;
      const avgProgress = count > 0 ? Math.round(cases.reduce((sum, c) => sum + c.progress, 0) / count) : 0;
      const completed = cases.filter(c => c.progress === 100).length;
      countryStats[country] = { count, avgProgress, completed };
    }

    const allCases = await Case.find();
    const overallAvgProgress = allCases.length > 0
      ? Math.round(allCases.reduce((sum, c) => sum + c.progress, 0) / allCases.length)
      : 0;

    const completedCases = allCases.filter(c => c.progress === 100).length;

    return NextResponse.json({
      totalCases,
      completedCases,
      overallAvgProgress,
      countryStats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
