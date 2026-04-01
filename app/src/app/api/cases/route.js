import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Case, { calculateProgress } from '@/lib/models/Case';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // Fixes Vercel caching/refreshing issues

// GET all cases
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    const department = searchParams.get('department') || 'Tourism';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const mgTab = searchParams.get('mgTab');

    let filter = {};
    if (department === 'Reviewer' || department === 'Review') {
      filter.department = { $in: ['Tourism', 'MG+'] };
    } else {
      filter.department = department;
    }
    if (country && country !== 'all') {
      filter.country = country;
    }
    if (userId && userId !== 'all') {
      filter.createdBy = userId;
    }
    if (mgTab && mgTab !== 'all') {
      filter.mgTab = mgTab;
    }
    
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) {
        filter.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDay = new Date(endDate);
        endDay.setHours(23, 59, 59, 999);
        filter.appointmentDate.$lte = endDay;
      }
    }
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { odooId: { $regex: search, $options: 'i' } },
        { visaType: { $regex: search, $options: 'i' } },
      ];
    }

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: filter },
      { 
        $addFields: { 
          // Check if current user._id is in the pinnedBy array
          isPinned: { 
            $in: [new mongoose.Types.ObjectId(user.id), { $ifNull: ["$pinnedBy", []] }] 
          } 
        } 
      },
      { $sort: { isPinned: -1, updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [caseDocs, totalCases] = await Promise.all([
      import('mongoose').then(mongoose => Case.aggregate(pipeline)),
      Case.countDocuments(filter)
    ]);

    const cases = await Case.populate(caseDocs, { path: 'createdBy', select: 'name username' });

    return NextResponse.json({
      cases,
      totalCases,
      totalPages: Math.ceil(totalCases / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST create new case
export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    const authError = requireAuth(user);
    if (authError) return authError;

    const normalizedRole = user.role.toLowerCase();
    const isReviewTeam = normalizedRole === 'review team' || normalizedRole === 'reviewer' || normalizedRole === 'review';
    if (isReviewTeam) {
      return NextResponse.json({ error: 'Review Team cannot create cases' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    const targetDept = (body.department || 'tourism').toLowerCase();
    const isAdmin = ['admin', 'moderator', 'sub-admin'].includes(normalizedRole);
    const assignedDept = normalizedRole === 'employee' ? 'tourism' : normalizedRole;
    
    // Only employees within their specific category can create a case there
    if (!isAdmin && assignedDept !== targetDept) {
      return NextResponse.json({ 
        error: `Action Denied: You are assigned to the '${user.role}' department. You cannot create cases in '${body.department || 'Tourism'}'.` 
      }, { status: 403 });
    }

    const caseData = { ...body };
    const canAssignCreator = ['admin', 'moderator', 'sub-admin'].includes(normalizedRole);
    if (canAssignCreator && body.createdBy) {
      caseData.createdBy = body.createdBy;
    } else {
      caseData.createdBy = user.id;
    }

    // Fix: Prevent Mongoose CastError by converting empty string Date to null
    if (caseData.appointmentDate === '') {
      caseData.appointmentDate = null;
    }

    const newCase = new Case(caseData);

    newCase.progress = calculateProgress(newCase);
    await newCase.save();

    const populated = await Case.findById(newCase._id).populate('createdBy', 'name username');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Create case error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
