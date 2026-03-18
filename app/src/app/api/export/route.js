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

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    let filter = {};
    if (country && country !== 'all') filter.country = country;

    const cases = await Case.find(filter).populate('createdBy', 'name username').sort({ createdAt: -1 });

    // Build CSV
    const headers = [
      'Appointment Date', 'Odoo ID', 'Client Name', 'Phone', 'Email',
      'Country', 'Progress %', 'Notes', 'Next Step', 'Created By',
      'WhatsApp Group', 'Hotel Reservation', 'Flight Reservation',
      'Motivation Letter', 'Travel Plan', 'Aman', 'Schengen Application',
      'Translation', 'DS-160', 'Coaching', 'Application 1', 'Application 2',
      'Application 3', 'HR/Business Owner',
    ];

    const rows = cases.map(c => [
      c.appointmentDate ? new Date(c.appointmentDate).toLocaleDateString() : '',
      c.odooId || '',
      c.clientName || '',
      c.phone || '',
      c.email || '',
      c.country || '',
      c.progress || 0,
      (c.notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
      (c.nextStep || '').replace(/,/g, ';').replace(/\n/g, ' '),
      c.createdBy?.name || '',
      c.whatsappGroup ? 'Yes' : 'No',
      c.hotelReservation ? 'Yes' : 'No',
      c.flightReservation ? 'Yes' : 'No',
      c.motivationLetter ? 'Yes' : 'No',
      c.travelPlan ? 'Yes' : 'No',
      c.aman ? 'Yes' : 'No',
      c.schengenApplication ? 'Yes' : 'No',
      c.translationSchengen || c.translationCanada ? 'Yes' : 'No',
      c.ds160 ? 'Yes' : 'No',
      c.coaching ? 'Yes' : 'No',
      c.application1 ? 'Yes' : 'No',
      c.application2 ? 'Yes' : 'No',
      c.application3 ? 'Yes' : 'No',
      c.hrOrBusinessOwnerSchengen || c.hrOrBusinessOwnerUSA || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=cases-export.csv',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
