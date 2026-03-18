import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PreviewLink from '@/lib/models/PreviewLink';
import Case from '@/lib/models/Case';

export const dynamic = 'force-dynamic';

// GET validate preview token and return data
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { token } = await params;

    const link = await PreviewLink.findOne({ token, isActive: true });
    if (!link) {
      return NextResponse.json({ error: 'Invalid or expired preview link' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'cases';

    if (view === 'dashboard') {
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
        valid: true,
        dashboard: { totalCases, completedCases, overallAvgProgress, countryStats },
      });
    }

    // Default: return cases
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    let filter = {};
    if (country && country !== 'all') filter.country = country;
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

    return NextResponse.json({ valid: true, cases });
  } catch (error) {
    console.error('Preview token error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
