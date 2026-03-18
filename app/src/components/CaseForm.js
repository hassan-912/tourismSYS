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
  notes: '',
  nextStep: '',
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

export default function CaseForm({ caseData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (caseData) {
      setForm({
        ...DEFAULT_FORM,
        ...caseData,
        appointmentDate: caseData.appointmentDate
          ? new Date(caseData.appointmentDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [caseData]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const countryConfig = COUNTRY_FIELDS[form.country] || { checkboxes: [], toggle: null };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {/* Basic Information */}
        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Appointment Date *</label>
            <input
              type="date"
              className="form-input"
              value={form.appointmentDate}
              onChange={e => handleChange('appointmentDate', e.target.value)}
              required
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
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="Enter email"
              required
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

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Country *</label>
          <select
            className="form-select"
            value={form.country}
            onChange={e => handleChange('country', e.target.value)}
            required
          >
            <option value="Schengen">Schengen</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
          </select>
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
