import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Footer from '../components/layout/Footer';
import TriageOverview from '../components/triage/TriageOverview';
import PatientList from '../components/triage/PatientList';
import { getTriageBoard } from '../services/api';

// Constants for status and priority mapping
const STATUS_MAP = {
  awaiting: 'Awaiting Review',
  contacted: 'Pending',
  disengaged: 'Rejected',
  completed: 'Complete',
  ready_for_scheduling: 'Pending',
};

const PRIORITY_MAP = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
  Decline: 'Low',
};

// Normalize patient data from API response
const normalizePatient = (patient) => ({
  id: patient.id,
  name: patient.name,
  age: patient.age && patient.age !== 'None' ? String(patient.age) : '-',
  ageNumber: !isNaN(Number(patient.age)) ? Number(patient.age) : null,
  status: STATUS_MAP[patient.status] || 'Pending',
  priority: PRIORITY_MAP[patient.priority] || 'Low',
  referrer: patient.partner ? 'Partner' : 'Self',
  entryDate: patient.referral_date ? new Date(patient.referral_date).toLocaleDateString() : '',
  phone: patient.phone || patient.mobile || patient.contact || null,
  email: patient.email || patient.username || null,
  partner: patient.partner || false,
  answers: patient.answers || {},
  referral_date: patient.referral_date || null,
});

// Extract unique ages for filter options
const getUniqueAges = (patients) => {
  const rawAges = patients.map((p) => p.age).filter(Boolean);
  return [...new Set(rawAges)].sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    return !isNaN(numA) && !isNaN(numB) ? numA - numB : String(a).localeCompare(String(b));
  });
};

const TriageManagement = () => {
  const [patientsList, setPatientsList] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch and process triage data
  useEffect(() => {
    const fetchTriageData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getTriageBoard();
        const normalizedPatients = (result?.new ?? []).map(normalizePatient);
        const uniqueAges = getUniqueAges(result?.new ?? []);
        console.log("Fetched triage data:", normalizedPatients);
        console.log("uniqueAges:", uniqueAges);

        setPatientsList(normalizedPatients.sort(
          (a, b) => new Date(b.referral_date) - new Date(a.referral_date)
        ));
        setAgeOptions(uniqueAges);
      } catch (err) {
        console.error('Failed to fetch triage data:', err);
        setError('Unable to load patient data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTriageData();
  }, []);

  const handleStatusChange = (patientId, newUiStatus) => {
    setPatientsList((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: newUiStatus } : p))
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading patient data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 px-2 py-2">Patient Triage Management</h1>
        <TriageOverview patients={patientsList} />
        <PatientList patients={patientsList} ageOptions={ageOptions} onStatusChange={handleStatusChange} />
      </main>
      <Footer />
    </div>
  );
};

// PropTypes for type checking
TriageManagement.propTypes = {
  patients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      age: PropTypes.string,
      ageNumber: PropTypes.number,
      status: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      referrer: PropTypes.string.isRequired,
      entryDate: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
      partner: PropTypes.bool,
      answers: PropTypes.object,
      referral_date: PropTypes.string,
    })
  ),
};

export default TriageManagement;  