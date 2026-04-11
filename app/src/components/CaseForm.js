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
  department: 'Tourism',
  reviewName: '',
  reviewedItems: [],
  mgTab: 'New Cases',
  customRequirements: [],
};

// Helper: convert ISO date string to dd/mm/yy for display in text input
function toDisplayDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

// Helper: convert dd/mm/yy text to YYYY-MM-DD date string for storage
function fromDisplayDate(text) {
  if (!text) return '';
  const match = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!match) return text;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  let year = parseInt(match[3], 10);
  if (year < 100) year += 2000;
  return `${year}-${month}-${day}`;
}

export default function CaseForm({ caseData, onSubmit, onCancel, loading, users = [], currentUser = null, department = 'Tourism' }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, createdBy: '', department: department || 'Tourism' });
  const [dateText, setDateText] = useState('');
  const [newReqName, setNewReqName] = useState('');
  const [showAddReq, setShowAddReq] = useState(false);

  useEffect(() => {
    if (caseData) {
      const newForm = {
        ...DEFAULT_FORM,
        ...caseData,
        department: department || 'Tourism',
        appointmentDate: caseData.appointmentDate
          ? new Date(caseData.appointmentDate).toISOString().split('T')[0]
          : '',
        createdBy: caseData.createdBy?._id || caseData.createdBy || '',
        reviewedItems: caseData.reviewedItems || [],
        mgTab: caseData.mgTab || 'New Cases',
        customRequirements: caseData.customRequirements || [],
      };
      setForm(newForm);
      setDateText(toDisplayDate(newForm.appointmentDate));
    } else {
      setForm({ ...DEFAULT_FORM, createdBy: '', department: department || 'Tourism' });
      setDateText('');
    }
  }, [caseData, department]);

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

  const handleCustomCheckbox = (idx) => {
    setForm(prev => {
      const newReqs = [...(prev.customRequirements || [])];
      newReqs[idx] = { ...newReqs[idx], completed: !newReqs[idx].completed };
      return { ...prev, customRequirements: newReqs };
    });
  };

  const handleAddCustomReq = () => {
    if (newReqName.trim()) {
      setForm(prev => ({
        ...prev,
        customRequirements: [
          ...(prev.customRequirements || []),
          { name: newReqName.trim(), completed: false }
        ]
      }));
      setNewReqName('');
      setShowAddReq(false);
    }
  };

  const handleRemoveCustomReq = (idx) => {
    setForm(prev => {
      const newReqs = [...(prev.customRequirements || [])];
      newReqs.splice(idx, 1);
      return { ...prev, customRequirements: newReqs };
    });
  };

  const handleReviewCheckbox = (key) => {
    setForm(prev => {
      const isChecked = prev.reviewedItems.includes(key);
      const newItems = isChecked
        ? prev.reviewedItems.filter(item => item !== key)
        : [...prev.reviewedItems, key];
      return { ...prev, reviewedItems: newItems };
    });
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
          {department === 'MG+' && (
            <div className="form-group">
              <label className="form-label">MG+ Tab State</label>
              <select
                className="form-select"
                value={form.mgTab}
                onChange={e => handleChange('mgTab', e.target.value)}
              >
                <option value="New Cases">New Cases</option>
                <option value="After Rejection">After Rejection</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
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

        {/* Custom Requirements */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Custom Requirements</label>
            {['admin', 'moderator', 'sub-admin'].includes(currentUser?.role?.toLowerCase()) && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddReq(!showAddReq)}
                style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              >
                + Add Requirement
              </button>
            )}
          </div>
          
          {showAddReq && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Requirement Name" 
                value={newReqName}
                onChange={e => setNewReqName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomReq())}
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddCustomReq}>Add</button>
            </div>
          )}

          {form.customRequirements && form.customRequirements.length > 0 ? (
            <div className="checkbox-group">
              {form.customRequirements.map((req, idx) => (
                <div key={'custom_' + idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div
                    className={`checkbox-item ${req.completed ? 'checked' : ''}`}
                    onClick={() => handleCustomCheckbox(idx)}
                    style={{ flex: 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={req.completed}
                      onChange={() => handleCustomCheckbox(idx)}
                    />
                    <label>{req.name}</label>
                  </div>
                  {['admin', 'moderator', 'sub-admin'].includes(currentUser?.role?.toLowerCase()) && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveCustomReq(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                      title="Remove Requirement"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No custom requirements added.</div>
          )}
        </div>

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

        {['admin', 'moderator', 'sub-admin'].includes(currentUser?.role?.toLowerCase()) && (
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Created By (File Holder) *</label>
            <select
              className="form-select"
              value={form.createdBy}
              onChange={e => handleChange('createdBy', e.target.value)}
              required
            >
              <option value="">-- Select File Holder --</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Review Category */}
        <div style={{ padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: 'var(--primary)' }}>Review Team Action</h3>
          <div className="form-group" style={{ marginBottom: 15 }}>
            <label className="form-label">Reviewer Name</label>
            <input
              type="text"
              className="form-input"
              value={form.reviewName}
              onChange={e => handleChange('reviewName', e.target.value)}
              placeholder="Who reviewed this?"
            />
          </div>
          
          {countryConfig.checkboxes.length > 0 && (
            <div className="form-group">
              <label className="form-label">Reviewed Requirements ({form.country})</label>
              <div className="checkbox-group">
                {countryConfig.checkboxes.map(field => {
                  const isChecked = form.reviewedItems.includes(field.key);
                  return (
                    <div
                      key={'review_' + field.key}
                      className={`checkbox-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleReviewCheckbox(field.key)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleReviewCheckbox(field.key)}
                      />
                      <label>{field.label}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
