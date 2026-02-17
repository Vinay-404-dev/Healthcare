import os
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
from models import db, Patient, Appointment, MedicalRecord

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    Migrate(app, db)
    
    # Create tables
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")
    
    # Health check endpoints
    @app.route('/health', methods=['GET'])
    def health_check():
        """Basic health check endpoint."""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'healthcare-api'
        }), 200
    
    @app.route('/ready', methods=['GET'])
    def readiness_check():
        """Readiness check with database connectivity."""
        try:
            # Check database connection
            db.session.execute(db.text('SELECT 1'))
            return jsonify({
                'status': 'ready',
                'database': 'connected',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        except Exception as e:
            logger.error(f"Readiness check failed: {str(e)}")
            return jsonify({
                'status': 'not ready',
                'database': 'disconnected',
                'error': str(e)
            }), 503
    
    # Patient endpoints
    @app.route('/api/patients', methods=['GET'])
    def get_patients():
        """Get all patients."""
        try:
            patients = Patient.query.all()
            return jsonify({
                'success': True,
                'data': [p.to_dict() for p in patients],
                'count': len(patients)
            }), 200
        except Exception as e:
            logger.error(f"Error fetching patients: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/patients/<int:patient_id>', methods=['GET'])
    def get_patient(patient_id):
        """Get a specific patient by ID."""
        try:
            patient = Patient.query.get_or_404(patient_id)
            return jsonify({
                'success': True,
                'data': patient.to_dict()
            }), 200
        except Exception as e:
            logger.error(f"Error fetching patient {patient_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 404
    
    @app.route('/api/patients', methods=['POST'])
    def create_patient():
        """Create a new patient."""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'date_of_birth', 'email']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            # Convert date string to date object
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
            patient = Patient(
                name=data['name'],
                date_of_birth=dob,
                email=data['email'],
                phone=data.get('phone'),
                address=data.get('address'),
                blood_group=data.get('blood_group')
            )
            
            db.session.add(patient)
            db.session.commit()
            
            logger.info(f"Created patient: {patient.name} (ID: {patient.id})")
            return jsonify({
                'success': True,
                'data': patient.to_dict(),
                'message': 'Patient created successfully'
            }), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating patient: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/patients/<int:patient_id>', methods=['PUT'])
    def update_patient(patient_id):
        """Update an existing patient."""
        try:
            patient = Patient.query.get_or_404(patient_id)
            data = request.get_json()
            
            # Update fields if provided
            if 'name' in data:
                patient.name = data['name']
            if 'email' in data:
                patient.email = data['email']
            if 'phone' in data:
                patient.phone = data['phone']
            if 'address' in data:
                patient.address = data['address']
            if 'blood_group' in data:
                patient.blood_group = data['blood_group']
            if 'date_of_birth' in data:
                patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
            db.session.commit()
            
            logger.info(f"Updated patient ID: {patient_id}")
            return jsonify({
                'success': True,
                'data': patient.to_dict(),
                'message': 'Patient updated successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating patient {patient_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
    def delete_patient(patient_id):
        """Delete a patient."""
        try:
            patient = Patient.query.get_or_404(patient_id)
            db.session.delete(patient)
            db.session.commit()
            
            logger.info(f"Deleted patient ID: {patient_id}")
            return jsonify({
                'success': True,
                'message': 'Patient deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting patient {patient_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # Appointment endpoints
    @app.route('/api/appointments', methods=['GET'])
    def get_appointments():
        """Get all appointments."""
        try:
            appointments = Appointment.query.all()
            return jsonify({
                'success': True,
                'data': [a.to_dict() for a in appointments],
                'count': len(appointments)
            }), 200
        except Exception as e:
            logger.error(f"Error fetching appointments: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/appointments', methods=['POST'])
    def create_appointment():
        """Create a new appointment."""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['patient_id', 'doctor_name', 'appointment_datetime']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            # Verify patient exists
            patient = Patient.query.get_or_404(data['patient_id'])
            
            # Convert datetime string
            appt_datetime = datetime.strptime(data['appointment_datetime'], '%Y-%m-%d %H:%M:%S')
            
            appointment = Appointment(
                patient_id=data['patient_id'],
                doctor_name=data['doctor_name'],
                appointment_datetime=appt_datetime,
                status=data.get('status', 'scheduled'),
                reason=data.get('reason'),
                notes=data.get('notes')
            )
            
            db.session.add(appointment)
            db.session.commit()
            
            logger.info(f"Created appointment ID: {appointment.id} for patient {patient.name}")
            return jsonify({
                'success': True,
                'data': appointment.to_dict(),
                'message': 'Appointment created successfully'
            }), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating appointment: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
    def update_appointment(appointment_id):
        """Update appointment status."""
        try:
            appointment = Appointment.query.get_or_404(appointment_id)
            data = request.get_json()
            
            if 'status' in data:
                appointment.status = data['status']
            if 'notes' in data:
                appointment.notes = data['notes']
            if 'appointment_datetime' in data:
                appointment.appointment_datetime = datetime.strptime(
                    data['appointment_datetime'], '%Y-%m-%d %H:%M:%S'
                )
            
            db.session.commit()
            
            logger.info(f"Updated appointment ID: {appointment_id}")
            return jsonify({
                'success': True,
                'data': appointment.to_dict(),
                'message': 'Appointment updated successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating appointment {appointment_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
    def delete_appointment(appointment_id):
        """Delete an appointment."""
        try:
            appointment = Appointment.query.get_or_404(appointment_id)
            db.session.delete(appointment)
            db.session.commit()
            
            logger.info(f"Deleted appointment ID: {appointment_id}")
            return jsonify({
                'success': True,
                'message': 'Appointment deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting appointment {appointment_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # Medical Records endpoints
    @app.route('/api/patients/<int:patient_id>/records', methods=['GET'])
    def get_patient_records(patient_id):
        """Get all medical records for a patient."""
        try:
            patient = Patient.query.get_or_404(patient_id)
            records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
            return jsonify({
                'success': True,
                'patient': patient.name,
                'data': [r.to_dict() for r in records],
                'count': len(records)
            }), 200
        except Exception as e:
            logger.error(f"Error fetching records for patient {patient_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/records', methods=['POST'])
    def create_medical_record():
        """Create a new medical record."""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['patient_id', 'diagnosis', 'doctor_name']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            # Verify patient exists
            patient = Patient.query.get_or_404(data['patient_id'])
            
            # Convert date if provided
            record_date = datetime.strptime(data['record_date'], '%Y-%m-%d').date() if 'record_date' in data else datetime.utcnow().date()
            
            record = MedicalRecord(
                patient_id=data['patient_id'],
                diagnosis=data['diagnosis'],
                prescription=data.get('prescription'),
                doctor_name=data['doctor_name'],
                record_date=record_date,
                notes=data.get('notes')
            )
            
            db.session.add(record)
            db.session.commit()
            
            logger.info(f"Created medical record ID: {record.id} for patient {patient.name}")
            return jsonify({
                'success': True,
                'data': record.to_dict(),
                'message': 'Medical record created successfully'
            }), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating medical record: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/api/records/<int:record_id>', methods=['DELETE'])
    def delete_medical_record(record_id):
        """Delete a medical record."""
        try:
            record = MedicalRecord.query.get_or_404(record_id)
            db.session.delete(record)
            db.session.commit()
            
            logger.info(f"Deleted medical record ID: {record_id}")
            return jsonify({
                'success': True,
                'message': 'Medical record deleted successfully'
            }), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting medical record {record_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
