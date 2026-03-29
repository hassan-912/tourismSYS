'use client';

import { useState, useEffect } from 'react';

const COUNTRY_FIELDS = {
  Schengen: {
    checkboxes: [
      { key: 'motivationLetter', label: 'Motivation Letter' },
      { key: 'travelPlan', label: 'Travel Plan' },
      { key: 'aman', label: 'Aman' },
      { key: 'schengenApplication', label: 'Schengen Application' },
      { key: 'translationSchengen', label: 'Translation' },
    ],
    toggle: { key: 'hrOrBusinessOwnerSchengen', label: 'HR / Business Owner' },
  },
  USA: {
    checkboxes: [
      { key: 'ds160', label: 'DS-160' },
      { key: 'coaching', label: 'Coaching' },
    ],
    toggle: { key: 'hrOrBusinessOwnerUSA', label: 'HR / Business Owner' },
  },
  UK: {
    checkboxes: [],
    toggle: null,
  },
  Canada: {
    checkboxes: [
      { key: 'application1', label: 'Application 1' },
      { key: 'application2', label: 'Application 2' },
      { key: 'application3', label: 'Application 3' },
      { key: 'translationCanada', label: 'Translation' },
    ],
    toggle: null,
  },
};

// Visa type options organized by country
const VISA_TYPE_OPTIONS = {
  Schengen: [
    'Spain Tour.', 'Spain T', 'Spain', 'Spain Abu Dhabi', 'Spain Dubai', 'Spain Riyadh', 'Spain Alex',
    'France Tour.', 'France T', 'France B', 'France', 'France Alex', 'France Hurghada', 'France Jeddah', 'France Door to Door',
    'Germany Tour.', 'Germany Tourism', 'Germany T', 'Germany B', 'Germany B.', 'Germany Bus.', 'Germany B Alex', 'Germany B UAE', 'Germany T Alex', 'Germany T KSA',
    'Italy B',
    'Netherlands T', 'Netherlands B', 'Netherlands Tour.', 'Netherland T', 'Netherland B', 'The Netherlands',
    'Belgium T', 'Belgium Tour.',
    'Austria T Alex',
    'Greece', 'Greece T', 'Greece Alex',
    'Poland', 'Poland B',
    'Romania Tour.',
    'Croatia T', 'Croatia Bus.',
    'Portugal T',
    'Hungary T',
    'Norway',
    'Malta',
    'Bulgaria',
    'Finland Tour.',
  ],
  USA: [
    'USA Tourist', 'USA Business', 'USA Student',
  ],
  UK: [
    'UK Tourist', 'UK Business', 'UK Student',
  ],
  Canada: [
    'Canada Tourist', 'Canada Business', 'Canada Student',
  ],
};

const COMMON_CHECKBOXES = [
  { key: 'whatsappGroup', label: 'WhatsApp Group' },
  { key: 'hotelReservation', label: 'Hotel Reservation' },
  { key: 'flightReservation', label: 'Flight Reservation' },
];

const DEFAULT_FORM = {
  appointmentDate: '',
  odooId: '',
  clientName: '',
  phone: '',
  email: '',
  password: '',
  country: 'Schengen',
  visaType: '',
  notes: '',
  nextStep: '',
  followUpName: '',
  whatsappGroup: false,
  hotelReservation: false,
  flightReservation: false,
  motivationLetter: false,
  travelPlan: false,
  aman: false,
  schengenApplication: false,
  translationSchengen: false,
  hrOrBusinessOwnerSchengen: '',
  ds160: false,
  coaching: false,
  hrOrBusinessOwnerUSA: '',
  application1: false,
  application2: false,
  application3: false,
  translationCanada: false,
};

// Helper: convert ISO date string to dd/mm/yy for display in text input
function toDisplayDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

// Helper: convert dd/mm/yy text to ISO date string for storage
function fromDisplayDate(text) {
  if (!text) return '';
  const match = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!match) return text;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return text;
  return d.toISOString().split('T')[0];
}

export default function CaseForm({ caseData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [dateText, setDateText] = useState('');

  useEffect(() => {
    if (caseData) {
      const newForm = {
        ...DEFAULT_FORM,
        ...caseData,
        appointmentDate: caseData.appointmentDate
          ? new Date(caseData.appointmentDate).toISOString().split('T')[0]
          : '',
      };
      setForm(newForm);
      setDateText(toDisplayDate(newForm.appointmentDate));
    } else {
      setForm(DEFAULT_FORM);
      setDateText('');
    }
  }, [caseData]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCountryChange = (value) => {
    setForm(prev => ({ ...prev, country: value, visaType: '' }));
  };

  const handleDateTextChange = (text) => {
    setDateText(text);
    const isoDate = fromDisplayDate(text);
    if (isoDate !== text) {
      handleChange('appointmentDate', isoDate);
    } else {
      handleChange('appointmentDate', '');
    }
  };

  const handleCheckbox = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const countryConfig = COUNTRY_FIELDS[form.country] || { checkboxes: [], toggle: null };
  const visaOptions = VISA_TYPE_OPTIONS[form.country] || [];

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {/* Basic Information */}
        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Appointment Date</label>
            <input
              type="text"
              className="form-input"
              value={dateText}
              onChange={e => handleDateTextChange(e.target.value)}
              placeholder="dd/mm/yy"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Odoo ID *</label>
            <input
              type="text"
              className="form-input"
              value={form.odooId}
              onChange={e => handleChange('odooId', e.target.value)}
              placeholder="Enter Odoo ID"
              required
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              className="form-input"
              value={form.clientName}
              onChange={e => handleChange('clientName', e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="text"
              className="form-input"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              placeholder="Enter password"
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Country *</label>
            <select
              className="form-select"
              value={form.country}
              onChange={e => handleCountryChange(e.target.value)}
              required
            >
              <option value="Schengen">Schengen</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">State / Visa Type</label>
            <select
              className="form-select"
              value={form.visaType}
              onChange={e => handleChange('visaType', e.target.value)}
            >
              <option value="">-- Select --</option>
              {visaOptions.map(vt => (
                <option key={vt} value={vt}>{vt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Common Checkboxes */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Common Requirements</label>
          <div className="checkbox-group">
            {COMMON_CHECKBOXES.map(field => (
              <div
                key={field.key}
                className={`checkbox-item ${form[field.key] ? 'checked' : ''}`}
                onClick={() => handleCheckbox(field.key)}
              >
                <input
                  type="checkbox"
                  checked={form[field.key]}
                  onChange={() => handleCheckbox(field.key)}
                />
                <label>{field.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Country-Specific Checkboxes */}
        {countryConfig.checkboxes.length > 0 && (
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">{form.country} Requirements</label>
            <div className="checkbox-group">
              {countryConfig.checkboxes.map(field => (
                <div
                  key={field.key}
                  className={`checkbox-item ${form[field.key] ? 'checked' : ''}`}
                  onClick={() => handleCheckbox(field.key)}
                >
                  <input
                    type="checkbox"
                    checked={form[field.key]}
                    onChange={() => handleCheckbox(field.key)}
                  />
                  <label>{field.label}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle */}
        {countryConfig.toggle && (
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">{countryConfig.toggle.label}</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-option ${form[countryConfig.toggle.key] === 'HR' ? 'active' : ''}`}
                onClick={() => handleChange(countryConfig.toggle.key, 'HR')}
              >
                HR
              </button>
              <button
                type="button"
                className={`toggle-option ${form[countryConfig.toggle.key] === 'Business Owner' ? 'active' : ''}`}
                onClick={() => handleChange(countryConfig.toggle.key, 'Business Owner')}
              >
                Business Owner
              </button>
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Add any notes..."
            rows={3}
          />
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Follow Up Name</label>
            <input
              type="text"
              className="form-input"
              value={form.followUpName}
              onChange={e => handleChange('followUpName', e.target.value)}
              placeholder="Who is following up?"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Next Step</label>
            <input
              type="text"
              className="form-input"
              value={form.nextStep}
              onChange={e => handleChange('nextStep', e.target.value)}
              placeholder="What's the next step?"
            />
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (caseData ? 'Update Case' : 'Create Case')}
        </button>
      </div>
    </form>
  );
}
