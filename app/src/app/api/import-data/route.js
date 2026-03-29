import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';
import seedData from '@/lib/seedData.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return importData();
}

export async function POST() {
  return importData();
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle "2025-07-06 00:00:00" format
  if (dateStr.includes('-') && dateStr.length >= 10) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  
  // Handle "dd/mm/yyyy" or "dd / mm / yyyy" format
  const cleaned = dateStr.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    let year = parseInt(match[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, parseInt(match[2], 10) - 1, parseInt(match[1], 10));
    if (!isNaN(d.getTime())) return d;
  }
  
  return null;
}

async function importData() {
  try {
    await dbConnect();

    // Check if data already imported
    const existingCount = await Case.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Data already exists in database', 
        existingCount,
        info: 'To re-import, delete existing cases first.'
      });
    }

    // Find or create a system user to assign as createdBy
    let systemUser = await User.findOne({ username: 'hassan' });
    if (!systemUser) {
      return NextResponse.json({ 
        error: 'No admin user found. Please seed users first by visiting /api/seed' 
      }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of seedData) {
      try {
        const appointmentDate = parseDate(row.appointmentDate);
        
        const caseDoc = new Case({
          appointmentDate: appointmentDate || undefined,
          odooId: row.odooId || `AUTO-${imported + 1}`,
          clientName: row.clientName,
          phone: '',
          email: row.email || '',
          password: row.password || '',
          country: 'Schengen',
          visaType: row.visaType || '',
          notes: row.note || '',
          nextStep: '',
          createdBy: systemUser._id,
          progress: 0,
        });

        await caseDoc.save();
        imported++;
      } catch (err) {
        skipped++;
        errors.push({ name: row.clientName, error: err.message });
      }
    }

    return NextResponse.json({
      message: `Import complete: ${imported} imported, ${skipped} skipped`,
      imported,
      skipped,
      errors: errors.slice(0, 10),
    }, { status: 201 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
