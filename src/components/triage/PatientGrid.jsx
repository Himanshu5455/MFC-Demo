import Typography from '@mui/material/Typography';
import PatientCard from './PatientCard';
import { statusColors } from '../../utils/constants';

const PatientGrid = ({ patients =[] }) => {
  const statusGroups = {
    'Awaiting Review': patients.filter(p => p.status === 'Awaiting Review'),
    'Pending': patients.filter(p => p.status === 'Pending'),
    'Complete': patients.filter(p => p.status === 'Complete'),
    'Rejected': patients.filter(p => p.status === 'Rejected'),
  };

  // Function to get light background color
  const getLightBackground = (status) => {
    const color = statusColors[status] || '#9CA3AF';
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(statusGroups).map(([status, statusPatients]) => {
        const displayStatus = status === 'Awaiting Review' ? 'Awaiting review' : status;
        return (
          <div 
            key={status} 
            className="space-y-4 p-4 rounded-lg"
            style={{ backgroundColor: getLightBackground(displayStatus) }}
          >
            <Typography 
              variant="h6" 
              className="font-semibold"
              style={{ color: statusColors[displayStatus] || '#374151' }}
            >
              {displayStatus} ({statusPatients.length} cards)
            </Typography>
            
            <div className="space-y-4">
              {statusPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  status={displayStatus}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PatientGrid;
