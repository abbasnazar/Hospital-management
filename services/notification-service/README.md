# Notification Service

Manages user notifications, messaging, appointment reminders, and clinical alerts across the HMIS system.

## Features

- Doctor-patient secure messaging
- Email, SMS, push, and in-app notifications
- Appointment reminder scheduling
- Clinical alert notifications
- Notification read status tracking
- Inbox management with filtering

## Endpoints

```
POST   /api/v1/notifications/messages               — Send message
GET    /api/v1/notifications/messages               — Get message inbox
POST   /api/v1/notifications                        — Send notification
POST   /api/v1/notifications/appointment-reminders — Schedule reminder
GET    /api/v1/notifications/user                   — Get user notifications
PUT    /api/v1/notifications/{id}/read              — Mark as read
```

## Database Schema

### notification_message
- Doctor-patient secure messages
- Message type classification (CLINICAL, APPOINTMENT, BILLING, ALERT, GENERAL)
- Sender/recipient tracking

### notification_notification
- System notifications to users
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- Read/unread status tracking
- Delivery method (EMAIL, SMS, PUSH, IN_APP)

### notification_appointment_reminder
- Automated appointment reminders
- Configurable hours before appointment
- Reminder channel selection (EMAIL, SMS, BOTH)

## Environment Variables

```
PORT=3010
DB_HOST=mysql
DB_NAME=hmis
DB_USER=hmis
DB_PASS=hmis
JWT_SECRET=your-secret-key
REDIS_URL=redis://redis:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMS_API_KEY=your-sms-provider-key
PUSH_NOTIFICATION_KEY=your-firebase-key
```

## Build & Run

```bash
npm install
npm run dev          # Development with nodemon
npm run test         # Run tests
docker build -t notification-service .
docker run -p 3010:3010 notification-service
```

## RBAC

- **DOCTOR**: Can send messages, receive notifications
- **PATIENT**: Can receive notifications, view messages
- **NURSE**: Can receive notifications
- **ADMIN**: Can send system-wide notifications
- **SYSTEM**: Internal service for automated notifications

## Message Types

| Type | Purpose | Recipients |
|------|---------|-----------|
| CLINICAL | Medical information | Doctor/Patient |
| APPOINTMENT | Appointment updates | Patient/Doctor |
| BILLING | Invoice/payment | Patient |
| ALERT | Critical alerts | Staff |
| GENERAL | General information | Users |

## Notification Channels

- **EMAIL**: For critical and important notifications
- **SMS**: For urgent alerts and reminders
- **PUSH**: Real-time mobile notifications
- **IN_APP**: In-application notifications

## Integration Points

- **Patient Service**: Appointment reminders
- **Doctor Service**: Clinical alerts
- **Billing Service**: Invoice notifications
- **Lab Service**: Critical result alerts
- **IPD Service**: Admission/discharge notifications
