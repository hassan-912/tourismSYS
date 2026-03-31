import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Case, { calculateProgress } from '@/lib/models/Case';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET single case
export async function GET(request, { params }) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();
    const { id } = await params;
    const caseDoc = await Case.findById(id).populate('createdBy', 'name username');

    if (!caseDoc) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(caseDoc);
  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT update case
export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();
    const { id } = await params;
    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check permissions: admin/moderator/reviewer can edit all, employees can only edit their own
    const normalizedRole = user.role.toLowerCase();
    const canEditAll = ['admin', 'moderator', 'sub-admin', 'review team', 'reviewer', 'review'].includes(normalizedRole);
    if (!canEditAll && caseDoc.createdBy?.toString() !== user.id) {
      return NextResponse.json({ error: 'You can only edit cases you created' }, { status: 403 });
    }

    const body = await request.json();

    // Update case fields
    Object.keys(body).forEach((key) => {
      if (key !== '_id') {
        if (key === 'createdBy' && !['admin', 'moderator', 'sub-admin'].includes(normalizedRole)) {
          // Skip letting non-admins alter createdBy
          return;
        }
        caseDoc[key] = body[key];
      }
    });

    // Recalculate progress
    caseDoc.progress = calculateProgress(caseDoc);
    await caseDoc.save();

    const populated = await Case.findById(caseDoc._id).populate('createdBy', 'name username');
    return NextResponse.json(populated);
  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE case
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    const normalizedRole = user.role.toLowerCase();
    // Only admin/moderator/sub-admin can delete
    if (!['admin', 'moderator', 'sub-admin'].includes(normalizedRole)) {
      return NextResponse.json({ error: 'Only administrators and moderators can delete cases' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const caseDoc = await Case.findByIdAndDelete(id);

    if (!caseDoc) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
