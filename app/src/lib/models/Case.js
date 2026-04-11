import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  appointmentDate: { type: Date },
  odooId: { type: String, required: true, trim: true },
  clientName: { type: String, required: true, trim: true },
  phone: { type: String, default: '', trim: true },
  email: { type: String, default: '', trim: true },
  visaType: { type: String, default: '', trim: true },
  password: { type: String, default: '' },
  country: {
    type: String,
    enum: ['Schengen', 'USA', 'UK', 'Canada'],
    required: true,
  },
  notes: { type: String, default: '' },
  nextStep: { type: String, default: '' },
  followUpName: { type: String, default: '' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: { type: String, default: 'Tourism' },
  reviewName: { type: String, default: '' },
  reviewedItems: { type: [String], default: [] },
  progress: { type: Number, default: 0 },
  mgTab: { type: String, enum: ['New Cases', 'After Rejection'], default: 'New Cases' },
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Common fields (ALL countries)
  whatsappGroup: { type: Boolean, default: false },
  hotelReservation: { type: Boolean, default: false },
  flightReservation: { type: Boolean, default: false },

  // Schengen-specific
  motivationLetter: { type: Boolean, default: false },
  travelPlan: { type: Boolean, default: false },
  aman: { type: Boolean, default: false },
  schengenApplication: { type: Boolean, default: false },
  translationSchengen: { type: Boolean, default: false },
  hrOrBusinessOwnerSchengen: { type: String, default: '' },

  // USA-specific
  ds160: { type: Boolean, default: false },
  coaching: { type: Boolean, default: false },
  hrOrBusinessOwnerUSA: { type: String, default: '' },

  // Canada-specific
  application1: { type: Boolean, default: false },
  application2: { type: Boolean, default: false },
  application3: { type: Boolean, default: false },
  translationCanada: { type: Boolean, default: false },

  // Custom Requirements added via UI
  customRequirements: {
    type: [{
      name: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }],
    default: []
  }
}, {
  timestamps: true,
});

// Pre hooks removed because they can cause issues with Next.js HMR and Mongoose cache

export function calculateProgress(caseData) {
  const common = [
    caseData.whatsappGroup,
    caseData.hotelReservation,
    caseData.flightReservation,
  ];

  let countrySpecific = [];

  switch (caseData.country) {
    case 'Schengen':
      countrySpecific = [
        caseData.motivationLetter,
        caseData.travelPlan,
        caseData.aman,
        caseData.schengenApplication,
        caseData.translationSchengen,
      ];
      break;
    case 'USA':
      countrySpecific = [
        caseData.ds160,
        caseData.coaching,
      ];
      break;
    case 'UK':
      countrySpecific = [];
      break;
    case 'Canada':
      countrySpecific = [
        caseData.application1,
        caseData.application2,
        caseData.application3,
        caseData.translationCanada,
      ];
      break;
    default:
      countrySpecific = [];
  }

  const customItems = (caseData.customRequirements || []).map(req => req.completed);
  const allItems = [...common, ...countrySpecific, ...customItems];
  const total = allItems.length;
  const completed = allItems.filter(Boolean).length;

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);
