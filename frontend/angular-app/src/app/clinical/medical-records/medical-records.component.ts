import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Medical Records</h1>
      <div class="card">
        <div class="card-header">
          <h2>Patient Medical History</h2>
          <input type="text" placeholder="Search patient MRN..." class="search">
        </div>
        <div class="card-content">
          <div class="record-sections">
            <div class="section">
              <h3>Allergies</h3>
              <p>No allergies recorded</p>
            </div>
            <div class="section">
              <h3>Diagnoses</h3>
              <p>No diagnoses on record</p>
            </div>
            <div class="section">
              <h3>Medications</h3>
              <p>No medications on record</p>
            </div>
            <div class="section">
              <h3>Documents</h3>
              <p>No documents uploaded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    h1 { margin-bottom: 1.5rem; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .card-header h2 { margin: 0; font-size: 1.2rem; }
    .search { flex: 1; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; }
    .card-content { padding: 1.5rem; }
    .record-sections { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .section { background: #f9fafb; padding: 1rem; border-radius: 6px; border-left: 4px solid #3b82f6; }
    .section h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #1f2937; }
    .section p { margin: 0; color: #6b7280; font-size: 0.875rem; }
  `]
})
export class MedicalRecordsComponent {}
