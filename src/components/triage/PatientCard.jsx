import { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import { statusColors } from '../../utils/constants';
import PatientDetailsModal from './PatientDetailsModal';
import { updateCustomerStatus } from '../../services/api';

const PatientCard = ({ patient, status, onStatusChange }) => {
  const borderColor = statusColors[status] || '#9CA3AF';
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePatientClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      x: rect.left + rect.width / 2, // Use center of the clicked element
      y: rect.bottom // Position below the clicked element for cards
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorPosition(null);
  };

  const checkboxState = useMemo(() => {
    // Default: Demographics and Prioritization checked
    const base = {
      demographics: true,
      prioritization: true,
      profiling: false,
      feedback: false,
    };

    // If status Rejected: all unchecked
    if (patient.status === 'Rejected') {
      return { demographics: false, prioritization: false, profiling: false, feedback: false };
    }

    // If status Pending: Profiling checked, Feedback unchecked
    if (patient.status === 'Pending') {
      return { ...base, profiling: true, feedback: false };
    }
    // If status Complete: Profiling and Feedback checked
    if (patient.status === 'Complete') {
      return { ...base, profiling: true, feedback: true };
    }
    // Other statuses keep defaults (e.g., Awaiting Review, Rejected)
    return base;
  }, [patient.status]);

  const handleActionChange = async (e) => {
    const value = e.target.value;
    if (!value) return;

    // Map dropdown to backend status and UI status
    const backendMap = {
      review: 'contacted', // goes to Pending column
      approve: 'completed', // goes to Complete column
      reject: 'disengaged', // goes to Rejected column
    };
    const uiMap = {
      review: 'Pending',
      approve: 'Complete',
      reject: 'Rejected',
    };

    const backendStatus = backendMap[value];
    const uiStatus = uiMap[value];
    if (!backendStatus || !uiStatus) return;

    try {
      setActionLoading(true);
      await updateCustomerStatus(patient.id, backendStatus);
      onStatusChange && onStatusChange(patient.id, uiStatus);
    } catch (err) {
      // Optionally, show a toast/snackbar in future
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  return (
    <Card 
      className="shadow-sm hover:shadow-md transition-shadow duration-200"
      sx={{ 
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        backgroundColor: 'white',
        borderLeft: `4px solid ${borderColor}`
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6B7280',
            fontSize: '0.875rem',
            mb: 1
          }}
        >
          Entry date: {patient.entryDate}
        </Typography>
        
        <Typography 
          variant="h6" 
          onClick={handlePatientClick}
          sx={{ 
            fontWeight: 700, 
            color: '#111827',
            fontSize: '1.1rem',
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              color: '#3B82F6'
            }
          }}
        >
          {patient.name}
        </Typography>
        
        <div className="space-y-2 mb-4">
          {(() => { const allUnchecked = !checkboxState.demographics && !checkboxState.prioritization && !checkboxState.profiling && !checkboxState.feedback; return (
          <div className="flex items-center gap-2">
            {allUnchecked ? (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
            ) : (
              <Checkbox size="small" disabled checked={checkboxState.demographics} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              Demographics
            </Typography>
          </div>
          ); })()}

          {(() => { const allUnchecked = !checkboxState.demographics && !checkboxState.prioritization && !checkboxState.profiling && !checkboxState.feedback; return (
          <div className="flex items-center gap-2">
            {allUnchecked ? (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
            ) : (
              <Checkbox size="small" disabled checked={checkboxState.prioritization} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              Prioritization
            </Typography>
          </div>
          ); })()}

          {(() => { const allUnchecked = !checkboxState.demographics && !checkboxState.prioritization && !checkboxState.profiling && !checkboxState.feedback; return (
          <div className="flex items-center gap-2">
            {allUnchecked ? (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
            ) : (
              <Checkbox size="small" disabled checked={checkboxState.profiling} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              Profiling
            </Typography>
          </div>
          ); })()}

          {(() => { const allUnchecked = !checkboxState.demographics && !checkboxState.prioritization && !checkboxState.profiling && !checkboxState.feedback; return (
          <div className="flex items-center gap-2">
            {allUnchecked ? (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
            ) : (
              <Checkbox size="small" disabled checked={checkboxState.feedback} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              Feedback
            </Typography>
          </div>
          ); })()}
        </div>
        
        <div className="flex gap-2">
          {/* <TextField 
            size="small" 
            placeholder="Input text"
            className="flex-1"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: '#D1D5DB',
                },
                '&:hover fieldset': {
                  borderColor: '#9CA3AF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3B82F6',
                  borderWidth: 1,
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
              },
            }}
          /> */}
          <FormControl size="small" className="min-w-24">
            <Select 
              defaultValue="" 
              displayEmpty
              onChange={handleActionChange}
              disabled={actionLoading}
              sx={{
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D1D5DB',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#9CA3AF',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3B82F6',
                  borderWidth: 1,
                },
              }}
            >
              <MenuItem value="">Action</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="approve">Approve</MenuItem>
              <MenuItem value="reject">Reject</MenuItem>
            </Select>
          </FormControl>
        </div>
      </CardContent>
      
      <PatientDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        patient={patient}
        anchorPosition={anchorPosition}
      />
    </Card>
  );
};

export default PatientCard;
