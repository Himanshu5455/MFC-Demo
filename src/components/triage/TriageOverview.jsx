

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { statusColors } from '../../utils/constants';
import ProgressBar from '../ui/ProgressBar';

const TriageOverview = ({ patients = [] }) => {
const statusGroups = [
  { label: 'Awaiting Review', value: patients.filter(p => p.status === 'Awaiting Review').length },
  { label: 'Pending', value: patients.filter(p => p.status === 'Pending').length },
  { label: 'Urgent', value: patients.filter(p => p.priority === 'High').length }, 
  { label: 'Complete', value: patients.filter(p => p.status === 'Complete').length },
  { label: 'Rejected', value: patients.filter(p => p.status === 'Rejected').length },
];


  const total = statusGroups.reduce((acc, s) => acc + s.value, 0);

  const statusBreakdown = statusGroups.map(s => ({
    label: s.label,
    value: (s.value / total) * 100 || 0
  }));

  return (
    <div className="mb-6">
      <Box className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
   
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className='text-[#053C47]'>
            <div className="flex items-baseline gap-2">
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 500 }} className="sm:whitespace-nowrap">
                Patients in triage
              </Typography>
            </div>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 700 }}>
              {total}
            </Typography>
          </div>

 
<div class="flex flex-wrap justify-start sm:justify-evenly gap-6 sm:gap-4 mt-4 sm:mt-0 w-full">

            {statusGroups.map((status) => (
              <div key={status.label} className="text-left min-w-0 sm:min-w-[140px]">
                <Typography className="text-xs sm:text-sm text-gray-600 mb-1">{status.label}</Typography>
                <Typography 
                  className="text-xl sm:text-2xl font-semibold"
                  style={{ color: statusColors[status.label] || '#374151' }}
                >
                  {status.value}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        {/* ProgressBar */}
        <div className="mt-6">
          <ProgressBar breakdown={statusBreakdown} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {statusBreakdown.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: statusColors[s.label] }}></span>
              <span className="text-xs sm:text-sm text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
};

export default TriageOverview;

