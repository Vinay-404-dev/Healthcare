import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import create_app
from models import db, Patient, Appointment, MedicalRecord
from datetime import datetime, date


@pytest.fixture
def app():
    """Create and configure a test app."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_health_check(self, client):
        """Test basic health check endpoint."""
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'timestamp' in data
        assert data['service'] == 'healthcare-api'
    
    def test_readiness_check(self, client):
        """Test readiness check endpoint."""
        response = client.get('/ready')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ready'
        assert data['database'] == 'connected'


class TestPatientEndpoints:
    """Test patient CRUD operations."""
    
    def test_create_patient(self, client):
        """Test creating a new patient."""
        patient_data = {
            'name': 'John Doe',
            'date_of_birth': '1990-01-01',
            'email': 'john@example.com',
            'phone': '1234567890',
            'blood_group': 'O+'
        }
        response = client.post('/api/patients', json=patient_data)
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['name'] == 'John Doe'
        assert data['data']['email'] == 'john@example.com'
    
    def test_create_patient_missing_fields(self, client):
        """Test creating patient with missing required fields."""
        patient_data = {
            'name': 'Jane Doe'
            # Missing date_of_birth and email
        }
        response = client.post('/api/patients', json=patient_data)
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'error' in data
    
    def test_get_all_patients(self, client):
        """Test getting all patients."""
        # Create test patients
        patient1 = {
            'name': 'Patient One',
            'date_of_birth': '1990-01-01',
            'email': 'patient1@example.com'
        }
        patient2 = {
            'name': 'Patient Two',
            'date_of_birth': '1995-05-05',
            'email': 'patient2@example.com'
        }
        client.post('/api/patients', json=patient1)
        client.post('/api/patients', json=patient2)
        
        response = client.get('/api/patients')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['count'] == 2
    
    def test_get_single_patient(self, client):
        """Test getting a specific patient."""
        # Create a patient
        patient_data = {
            'name': 'Test Patient',
            'date_of_birth': '1990-01-01',
            'email': 'test@example.com'
        }
        create_response = client.post('/api/patients', json=patient_data)
        patient_id = create_response.get_json()['data']['id']
        
        # Get the patient
        response = client.get(f'/api/patients/{patient_id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['name'] == 'Test Patient'
    
    def test_update_patient(self, client):
        """Test updating a patient."""
        # Create a patient
        patient_data = {
            'name': 'Original Name',
            'date_of_birth': '1990-01-01',
            'email': 'original@example.com'
        }
        create_response = client.post('/api/patients', json=patient_data)
        patient_id = create_response.get_json()['data']['id']
        
        # Update the patient
        update_data = {
            'name': 'Updated Name',
            'phone': '9876543210'
        }
        response = client.put(f'/api/patients/{patient_id}', json=update_data)
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['name'] == 'Updated Name'
        assert data['data']['phone'] == '9876543210'
    
    def test_delete_patient(self, client):
        """Test deleting a patient."""
        # Create a patient
        patient_data = {
            'name': 'Delete Me',
            'date_of_birth': '1990-01-01',
            'email': 'delete@example.com'
        }
        create_response = client.post('/api/patients', json=patient_data)
        patient_id = create_response.get_json()['data']['id']
        
        # Delete the patient
        response = client.delete(f'/api/patients/{patient_id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        # Verify deletion
        get_response = client.get(f'/api/patients/{patient_id}')
        assert get_response.status_code == 404


class TestAppointmentEndpoints:
    """Test appointment management."""
    
    def test_create_appointment(self, client):
        """Test creating a new appointment."""
        # First create a patient
        patient_data = {
            'name': 'Appointment Patient',
            'date_of_birth': '1990-01-01',
            'email': 'appt@example.com'
        }
        patient_response = client.post('/api/patients', json=patient_data)
        patient_id = patient_response.get_json()['data']['id']
        
        # Create appointment
        appointment_data = {
            'patient_id': patient_id,
            'doctor_name': 'Dr. Smith',
            'appointment_datetime': '2024-12-01 10:00:00',
            'reason': 'Annual checkup'
        }
        response = client.post('/api/appointments', json=appointment_data)
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['doctor_name'] == 'Dr. Smith'
    
    def test_get_all_appointments(self, client):
        """Test getting all appointments."""
        response = client.get('/api/appointments')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'count' in data
    
    def test_update_appointment_status(self, client):
        """Test updating appointment status."""
        # Create patient and appointment
        patient_data = {
            'name': 'Status Patient',
            'date_of_birth': '1990-01-01',
            'email': 'status@example.com'
        }
        patient_response = client.post('/api/patients', json=patient_data)
        patient_id = patient_response.get_json()['data']['id']
        
        appointment_data = {
            'patient_id': patient_id,
            'doctor_name': 'Dr. Jones',
            'appointment_datetime': '2024-12-01 14:00:00'
        }
        appt_response = client.post('/api/appointments', json=appointment_data)
        appt_id = appt_response.get_json()['data']['id']
        
        # Update status
        update_data = {'status': 'completed'}
        response = client.put(f'/api/appointments/{appt_id}', json=update_data)
        assert response.status_code == 200
        data = response.get_json()
        assert data['data']['status'] == 'completed'


class TestMedicalRecordEndpoints:
    """Test medical record management."""
    
    def test_create_medical_record(self, client):
        """Test creating a medical record."""
        # Create patient
        patient_data = {
            'name': 'Record Patient',
            'date_of_birth': '1990-01-01',
            'email': 'record@example.com'
        }
        patient_response = client.post('/api/patients', json=patient_data)
        patient_id = patient_response.get_json()['data']['id']
        
        # Create medical record
        record_data = {
            'patient_id': patient_id,
            'diagnosis': 'Common cold',
            'prescription': 'Rest and fluids',
            'doctor_name': 'Dr. Wilson'
        }
        response = client.post('/api/records', json=record_data)
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['diagnosis'] == 'Common cold'
    
    def test_get_patient_records(self, client):
        """Test getting all records for a patient."""
        # Create patient
        patient_data = {
            'name': 'History Patient',
            'date_of_birth': '1990-01-01',
            'email': 'history@example.com'
        }
        patient_response = client.post('/api/patients', json=patient_data)
        patient_id = patient_response.get_json()['data']['id']
        
        # Create multiple records
        record1 = {
            'patient_id': patient_id,
            'diagnosis': 'Flu',
            'doctor_name': 'Dr. A'
        }
        record2 = {
            'patient_id': patient_id,
            'diagnosis': 'Allergy',
            'doctor_name': 'Dr. B'
        }
        client.post('/api/records', json=record1)
        client.post('/api/records', json=record2)
        
        # Get all records
        response = client.get(f'/api/patients/{patient_id}/records')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['count'] == 2
