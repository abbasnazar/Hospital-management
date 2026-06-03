import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Notifications</h1>
      <div class="tabs">
        <button class="tab-btn active">Messages</button>
        <button class="tab-btn">Alerts</button>
        <button class="tab-btn">Reminders</button>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Messages</h2>
          <button class="btn primary">New Message</button>
        </div>
        <div class="card-content">
          <div class="message-list">
            <p style="color: #6b7280; text-align: center;">No messages</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    h1 { margin-bottom: 1.5rem; }
    .tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; }
    .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; cursor: pointer; font-weight: 500; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .card-header h2 { margin: 0; font-size: 1.2rem; }
    .card-content { padding: 1.5rem; min-height: 200px; }
    .message-list { }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
    .btn.primary { background: #3b82f6; color: white; }
    .btn.primary:hover { background: #2563eb; }
  `]
})
export class NotificationsComponent {}
