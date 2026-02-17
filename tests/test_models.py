import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from models import db, Patient, Appointment, MedicalRecord
from app import create_app
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


class TestPatientModel:
    """Test Patient model."""
    
    def test_patient_creation(self, app):
        """Test creating a patient."""
        with app.app_context():
            patient = Patient(
                name='Test Patient',
                date_of_birth=date(1990, 1, 1),
                email='test@example.com',
                phone='1234567890',
                blood_group='A+'
            )
            db.session.add(patient)
            db.session.commit()
            
            assert patient.id is not None
            assert patient.name == 'Test Patient'
            assert patient.email == 'test@example.com'
    
    def test_patient_to_dict(self, app):
        """Test patient serialization."""
        with app.app_context():
            patient = Patient(
                name='Dict Test',
                date_of_birth=date(1995, 5, 5),
                email='dict@example.com'
            )
            db.session.add(patient)
            db.session.commit()
            
            patient_dict = patient.to_dict()
            assert patient_dict['name'] == 'Dict Test'
            assert patient_dict['email'] == 'dict@example.com'
            assert 'id' in patient_dict
            assert 'created_at' in patient_dict
    
    def test_patient_unique_email(self, app):
        """Test that email must be unique."""
        with app.app_context():
            patient1 = Patient(
                name='Patient 1',
                date_of_birth=date(1990, 1, 1),
                email='unique@example.com'
            )
            patient2 = Patient(
                name='Patient 2',
                date_of_birth=date(1992, 2, 2),
                email='unique@example.com'
            )
            db.session.add(patient1)
            db.session.commit()
            
            db.session.add(patient2)
            with pytest.raises(Exception):  # IntegrityError
                db.session.commit()


class TestAppointmentModel:
    """Test Appointment model."""
    
    def test_appointment_creation(self, app):
        """Test creating an appointment."""
        with app.app_context():
            patient = Patient(
                name='Appt Patient',
                date_of_birth=date(1990, 1, 1),
                email='appt@example.com'
            )
            db.session.add(patient)
            db.session.commit()
            
            appointment = Appointment(
                patient_id=patient.id,
                doctor_name='Dr. Test',
                appointment_datetime=datetime(2024, 12, 1, 10, 0),
                status='scheduled',
                reason='Checkup'
            )
            db.session.add(appointment)
            db.session.commit()
            
            assert appointment.id is not None
            assert appointment.doctor_name == 'Dr. Test'
            assert appointment.status == 'scheduled'
    
    def test_appointment_patient_relationship(self, app):
        """Test appointment-patient relationship."""
        with app.app_context():
            patient = Patient(
                name='Rel Patient',
                date_of_birth=date(1990, 1, 1),
                email='rel@example.com'
            )
            db.session.add(patient)
            db.session.commit()
            
            appointment = Appointment(
                patient_id=patient.id,
                doctor_name='Dr. Relation',
                appointment_datetime=datetime(2024, 12, 1, 10, 0)
            )
            db.session.add(appointment)
            db.session.commit()
            
            # Test relationship
            assert appointment.patient.name == 'Rel Patient'
            assert len(patient.appointments) == 1


class TestMedicalRecordModel:
    """Test MedicalRecord model."""
    
    def test_medical_record_creation(self, app):
        """Test creating a medical record."""
        with app.app_context():
            patient = Patient(
                name='Record Patient',
                date_of_birth=date(1990, 1, 1),
                email='record@example.com'
            )
            db.session.add(patient)
            db.session.commit()
            
            record = MedicalRecord(
                patient_id=patient.id,
                diagnosis='Test diagnosis',
                prescription='Test prescription',
                doctor_name='Dr. Record',
                record_date=date.today()
            )
            db.session.add(record)
            db.session.commit()
            
            assert record.id is not None
            assert record.diagnosis == 'Test diagnosis'
            assert record.doctor_name == 'Dr. Record'
    
    def test_medical_record_patient_relationship(self, app):
        """Test medical record-patient relationship."""
        with app.app_context():
            patient = Patient(
                name='History Patient',
                date_of_birth=date(1990, 1, 1),
                email='history@example.com'
            )
            db.session.add(patient)
            db.session.commit()
            
            record1 = MedicalRecord(
                patient_id=patient.id,
                diagnosis='Diagnosis 1',
                doctor_name='Dr. A',
                record_date=date.today()
            )
            record2 = MedicalRecord(
                patient_id=patient.id,
                diagnosis='Diagnosis 2',
                doctor_name='Dr. B',
                record_date=date.today()
            )
            db.session.add(record1)
            db.session.add(record2)
            db.session.commit()
            
            # Test relationship
            assert len(patient.medical_records) == 2
            assert record1.patient.name == 'History Patient'
