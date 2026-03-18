'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

export default function Sidebar() {
  const { authFetch } = useAuth();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await authFetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Team Members</div>
      <div className="employee-list">
        {employees.map((emp, index) => (
          <div key={emp._id} className="employee-item">
            <div
              className="employee-avatar"
              style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
            >
              {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="employee-info">
              <span className="employee-name">{emp.name}</span>
              <span className="employee-role">{emp.role}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
