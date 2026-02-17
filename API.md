# Healthcare Service API Documentation

Base URL: `http://localhost:5000` (development) or `https://healthcare.example.com` (production)

## Table of Contents

- [Authentication](#authentication)
- [Health Checks](#health-checks)
- [Patients](#patients)
- [Appointments](#appointments)
- [Medical Records](#medical-records)
- [Error Handling](#error-handling)

## Authentication

Currently, the API does not require authentication. In production, implement JWT or OAuth2 authentication.

## Health Checks

### Basic Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000",
  "service": "healthcare-api"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

### Readiness Check

Check if the service is ready to handle requests (includes database connectivity).

**Endpoint:** `GET /ready`

**Response (Success):**
```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

**Response (Failure):**
```json
{
  "status": "not ready",
  "database": "disconnected",
  "error": "connection refused"
}
```

**Status Codes:**
- `200 OK` - Service is ready
- `503 Service Unavailable` - Service is not ready

## Patients

### List All Patients

Retrieve a list of all patients in the system.

**Endpoint:** `GET /api/patients`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "date_of_birth": "1990-01-01",
      "email": "john@example.com",
      "phone": "1234567890",
      "address": "123 Main St",
      "blood_group": "O+",
      "created_at": "2024-01-01T10:00:00.000000",
      "updated_at": "2024-01-01T10:00:00.000000"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Success

### Get Single Patient

Retrieve details of a specific patient.

**Endpoint:** `GET /api/patients/{id}`

**Path Parameters:**
- `id` (integer) - Patient ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "date_of_birth": "1990-01-01",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "blood_group": "O+",
    "created_at": "2024-01-01T10:00:00.000000",
    "updated_at": "2024-01-01T10:00:00.000000"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Patient not found

### Create Patient

Create a new patient record.

**Endpoint:** `POST /api/patients`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "date_of_birth": "1995-05-15",
  "email": "jane@example.com",
  "phone": "0987654321",
  "address": "456 Oak Ave",
  "blood_group": "A+"
}
```

**Required Fields:**
- `name` (string) - Patient's full name
- `date_of_birth` (string) - Format: YYYY-MM-DD
- `email` (string) - Valid email address (unique)

**Optional Fields:**
- `phone` (string) - Contact number
- `address` (string) - Residential address
- `blood_group` (string) - Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Jane Doe",
    "date_of_birth": "1995-05-15",
    "email": "jane@example.com",
    "phone": "0987654321",
    "address": "456 Oak Ave",
    "blood_group": "A+",
    "created_at": "2024-01-01T11:00:00.000000",
    "updated_at": "2024-01-01T11:00:00.000000"
  },
  "message": "Patient created successfully"
}
```

**Status Codes:**
- `201 Created` - Patient created successfully
- `400 Bad Request` - Missing required fields or invalid data
- `500 Internal Server Error` - Server error (e.g., duplicate email)

### Update Patient

Update an existing patient's information.

**Endpoint:** `PUT /api/patients/{id}`

**Path Parameters:**
- `id` (integer) - Patient ID

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "1111111111",
  "address": "789 Elm St"
}
```

**All fields are optional. Only provided fields will be updated.**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "date_of_birth": "1995-05-15",
    "email": "jane@example.com",
    "phone": "1111111111",
    "address": "789 Elm St",
    "blood_group": "A+",
    "created_at": "2024-01-01T11:00:00.000000",
    "updated_at": "2024-01-01T12:00:00.000000"
  },
  "message": "Patient updated successfully"
}
```

**Status Codes:**
- `200 OK` - Patient updated successfully
- `404 Not Found` - Patient not found
- `500 Internal Server Error` - Server error

### Delete Patient

Delete a patient and all associated records (appointments and medical records).

**Endpoint:** `DELETE /api/patients/{id}`

**Path Parameters:**
- `id` (integer) - Patient ID

**Response:**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Patient deleted successfully
- `404 Not Found` - Patient not found
- `500 Internal Server Error` - Server error

## Appointments

### List All Appointments

Retrieve all appointments in the system.

**Endpoint:** `GET /api/appointments`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": 1,
      "doctor_name": "Dr. Smith",
      "appointment_datetime": "2024-01-15T10:00:00",
      "status": "scheduled",
      "reason": "Annual checkup",
      "notes": null,
      "created_at": "2024-01-01T10:00:00.000000",
      "updated_at": "2024-01-01T10:00:00.000000"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Success

### Create Appointment

Schedule a new appointment for a patient.

**Endpoint:** `POST /api/appointments`

**Request Body:**
```json
{
  "patient_id": 1,
  "doctor_name": "Dr. Jane Wilson",
  "appointment_datetime": "2024-02-01 14:30:00",
  "status": "scheduled",
  "reason": "Follow-up consultation",
  "notes": "Patient requested afternoon slot"
}
```

**Required Fields:**
- `patient_id` (integer) - Must reference existing patient
- `doctor_name` (string) - Doctor's name
- `appointment_datetime` (string) - Format: YYYY-MM-DD HH:MM:SS

**Optional Fields:**
- `status` (string) - Default: "scheduled" (options: scheduled, completed, cancelled)
- `reason` (string) - Reason for appointment
- `notes` (string) - Additional notes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "patient_id": 1,
    "doctor_name": "Dr. Jane Wilson",
    "appointment_datetime": "2024-02-01T14:30:00",
    "status": "scheduled",
    "reason": "Follow-up consultation",
    "notes": "Patient requested afternoon slot",
    "created_at": "2024-01-01T11:00:00.000000",
    "updated_at": "2024-01-01T11:00:00.000000"
  },
  "message": "Appointment created successfully"
}
```

**Status Codes:**
- `201 Created` - Appointment created successfully
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Patient not found
- `500 Internal Server Error` - Server error

### Update Appointment

Update appointment details or status.

**Endpoint:** `PUT /api/appointments/{id}`

**Path Parameters:**
- `id` (integer) - Appointment ID

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Patient completed checkup. All normal."
}
```

**All fields are optional. Common use case: updating status.**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "patient_id": 1,
    "doctor_name": "Dr. Jane Wilson",
    "appointment_datetime": "2024-02-01T14:30:00",
    "status": "completed",
    "reason": "Follow-up consultation",
    "notes": "Patient completed checkup. All normal.",
    "created_at": "2024-01-01T11:00:00.000000",
    "updated_at": "2024-02-01T15:00:00.000000"
  },
  "message": "Appointment updated successfully"
}
```

**Status Codes:**
- `200 OK` - Appointment updated successfully
- `404 Not Found` - Appointment not found
- `500 Internal Server Error` - Server error

## Medical Records

### Get Patient Medical Records

Retrieve all medical records for a specific patient.

**Endpoint:** `GET /api/patients/{patient_id}/records`

**Path Parameters:**
- `patient_id` (integer) - Patient ID

**Response:**
```json
{
  "success": true,
  "patient": "John Doe",
  "data": [
    {
      "id": 1,
      "patient_id": 1,
      "diagnosis": "Common cold",
      "prescription": "Rest and fluids, Paracetamol 500mg",
      "doctor_name": "Dr. Smith",
      "record_date": "2024-01-10",
      "notes": "Patient should return if symptoms worsen",
      "created_at": "2024-01-10T10:00:00.000000",
      "updated_at": "2024-01-10T10:00:00.000000"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Patient not found

### Create Medical Record

Add a new medical record for a patient.

**Endpoint:** `POST /api/records`

**Request Body:**
```json
{
  "patient_id": 1,
  "diagnosis": "Seasonal allergies",
  "prescription": "Antihistamine 10mg once daily",
  "doctor_name": "Dr. Wilson",
  "record_date": "2024-01-15",
  "notes": "Advised to avoid pollen exposure"
}
```

**Required Fields:**
- `patient_id` (integer) - Must reference existing patient
- `diagnosis` (string) - Medical diagnosis
- `doctor_name` (string) - Doctor's name

**Optional Fields:**
- `prescription` (string) - Prescribed medication
- `record_date` (string) - Format: YYYY-MM-DD (defaults to today)
- `notes` (string) - Additional medical notes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "patient_id": 1,
    "diagnosis": "Seasonal allergies",
    "prescription": "Antihistamine 10mg once daily",
    "doctor_name": "Dr. Wilson",
    "record_date": "2024-01-15",
    "notes": "Advised to avoid pollen exposure",
    "created_at": "2024-01-15T14:00:00.000000",
    "updated_at": "2024-01-15T14:00:00.000000"
  },
  "message": "Medical record created successfully"
}
```

**Status Codes:**
- `201 Created` - Record created successfully
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Patient not found
- `500 Internal Server Error` - Server error

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request (missing fields, invalid data)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service not ready (readiness check failed)

### Example Error Responses

**Missing Required Field:**
```json
{
  "success": false,
  "error": "Missing required field: email"
}
```

**Resource Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**Database Error:**
```json
{
  "success": false,
  "error": "UNIQUE constraint failed: patient.email"
}
```

## Rate Limiting

When deployed with the Kubernetes Ingress, rate limiting is enforced:
- **Limit:** 100 requests per second per IP
- **Response on limit exceeded:** HTTP 429 Too Many Requests

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins. In production, restrict to specific domains.
