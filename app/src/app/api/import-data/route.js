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

// Map file holder names from the Excel to a normalized user name
function normalizeFileHolder(holder) {
  if (!holder) return 'hassan';
  const h = holder.trim().toLowerCase();
  
  // Moataz variants
  if (h.includes('mo') && (h.includes('taz') || h.includes('عt'))) return 'moataz';
  if (h === 'mo3taz') return 'moataz';
  
  // Salma variants
  if (h === 'salma ayman') return 'salma ayman';
  if (h === 'salma yousry' || h === 'salma youssry' || h === 'salma yossry') return 'salma yousry';
  if (h.includes('salma') && h.includes('moaw') || h.includes('salma') && h.includes('moad')) return 'salma moawad';
  if (h === 'salma ibrahim' || h === 'salma ibrahim') return 'salma ibrahim';
  if (h === 'salma' || h === 'salma' || h.startsWith('salma')) return 'salma ayman'; // default salma
  
  // Direct matches
  if (h === 'hassan') return 'hassan';
  if (h === 'nasser') return 'nasser';
  if (h === 'yara') return 'yara';
  if (h === 'passant') return 'passant';
  if (h === 'nermin' || h === 'nermen') return 'nermin';
  if (h === 'huda') return 'huda';
  if (h === 'alaa') return 'alaa';
  if (h === 'alaa karam') return 'alaa karam';
  if (h === 'basant') return 'basant';
  if (h === 'abir') return 'abir';
  if (h === 'menna') return 'menna';
  if (h === 'rahma') return 'rahma';
  if (h === 'noha') return 'noha';
  if (h === 'zayed') return 'zayed';
  if (h === 'safaa') return 'safaa';
  if (h === 'nayera') return 'nayera';
  if (h === 'ali') return 'ali';
  if (h === 'ismail') return 'ismail';
  if (h === 'mostafa') return 'mostafa';
  if (h === 'aly') return 'aly';
  if (h === 'mg+') return 'hassan';
  
  // Combined holders - use first name
  if (h.includes('&') || h.includes('+')) {
    const first = h.split(/[&+]/)[0].trim();
    return normalizeFileHolder(first);
  }
  
  return 'hassan'; // fallback
}

// Cutoff date: only import cases from 25/3/2026 onwards
const CUTOFF_DATE = new Date(2026, 2, 25); // March 25, 2026

async function importData() {
  try {
    await dbConnect();

    // Check if import already done
    const existingCount = await Case.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Data already exists in database', 
        existingCount,
        info: 'To re-import, delete existing cases first.'
      });
    }

    // Load all users into a map by name (lowercase)
    const allUsers = await User.find({});
    if (allUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No users found. Please seed users first by visiting /api/seed' 
      }, { status: 400 });
    }
    
    const userMap = {};
    for (const u of allUsers) {
      userMap[u.name.toLowerCase()] = u._id;
    }
    
    // Fallback to admin
    const adminUser = allUsers.find(u => u.role === 'admin');

    let imported = 0;
    let skipped = 0;
    let filtered = 0;
    const errors = [];

    for (const row of seedData) {
      try {
        const appointmentDate = parseDate(row.appointmentDate);
        
        // Skip cases before 25/3/2026
        if (appointmentDate && appointmentDate < CUTOFF_DATE) {
          filtered++;
          continue;
        }
        
        // If no date, skip too (old data without dates)
        if (!appointmentDate) {
          filtered++;
          continue;
        }
        
        // Map file holder to user
        const holderName = normalizeFileHolder(row.fileHolder);
        const createdById = userMap[holderName] || adminUser._id;
        
        const caseDoc = new Case({
          appointmentDate: appointmentDate,
          odooId: row.odooId || `AUTO-${imported + 1}`,
          clientName: row.clientName,
          phone: '',
          email: row.email || '',
          password: row.password || '',
          country: 'Schengen',
          visaType: row.visaType || '',
          notes: row.note || '',
          nextStep: '',
          followUpName: row.followUp || '',
          createdBy: createdById,
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
      message: `Import complete: ${imported} imported, ${filtered} filtered (before 25/3/2026), ${skipped} skipped`,
      imported,
      filtered,
      skipped,
      errors: errors.slice(0, 10),
    }, { status: 201 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
