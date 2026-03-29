import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Case from '@/lib/models/Case';

export const dynamic = 'force-dynamic';

// DELETE all cases with appointment date before 25/3/2026
export async function DELETE() {
  try {
    await dbConnect();

    const cutoffDate = new Date(2026, 2, 25); // March 25, 2026

    // Delete cases with appointmentDate before cutoff
    const result = await Case.deleteMany({
      appointmentDate: { $lt: cutoffDate }
    });

    // Also delete cases with no appointment date (old data)
    const noDateResult = await Case.deleteMany({
      appointmentDate: null
    });

    return NextResponse.json({
      message: 'Old cases deleted successfully',
      deletedWithDate: result.deletedCount,
      deletedWithoutDate: noDateResult.deletedCount,
      totalDeleted: result.deletedCount + noDateResult.deletedCount,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET to show how many would be deleted (preview)
export async function GET() {
  try {
    await dbConnect();

    const cutoffDate = new Date(2026, 2, 25);

    const countBefore = await Case.countDocuments({
      appointmentDate: { $lt: cutoffDate }
    });

    const countNoDate = await Case.countDocuments({
      appointmentDate: null
    });

    const countAfter = await Case.countDocuments({
      appointmentDate: { $gte: cutoffDate }
    });

    return NextResponse.json({
      message: 'Preview of cleanup (use DELETE method to execute)',
      casesBeforeCutoff: countBefore,
      casesWithNoDate: countNoDate,
      totalToDelete: countBefore + countNoDate,
      casesToKeep: countAfter,
    });
  } catch (error) {
    console.error('Cleanup preview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
