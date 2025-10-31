import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { statusColors } from '../../utils/constants';
import PatientDetailsModal from './PatientDetailsModal';

const PatientCard = ({ patient, status }) => {
  const borderColor = statusColors[status] || '#9CA3AF';
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);

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
          <div className="flex items-center gap-2">
            {patient.demographics ? (
              <CheckIcon sx={{ color: '#10B981', fontSize: '1rem' }} />
            ) : (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
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
          
          <div className="flex items-center gap-2">
            {patient.prioritization ? (
              <CheckIcon sx={{ color: '#10B981', fontSize: '1rem' }} />
            ) : (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
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
          
          <div className="flex items-center gap-2">
            {patient.profiling ? (
              <CheckIcon sx={{ color: '#10B981', fontSize: '1rem' }} />
            ) : (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
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
          
          <div className="flex items-center gap-2">
            {patient.feedback ? (
              <CheckIcon sx={{ color: '#10B981', fontSize: '1rem' }} />
            ) : (
              <CloseIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />
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
        </div>
        
        <div className="flex gap-2">
          <TextField 
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
          />
          <FormControl size="small" className="min-w-24">
            <Select 
              defaultValue="" 
              displayEmpty
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
