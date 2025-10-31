import Chip from '@mui/material/Chip';
import { statusColors, priorityColors } from '../../utils/constants';

const StatusBadge = ({ status, priority, type = 'status' }) => {
  const colors = type === 'status' ? statusColors : priorityColors;
  const value = type === 'status' ? status : priority;
  const color = colors[value] || '#9CA3AF';
  
  // Function to create a light background version of the color
  const getLightBackground = (color) => {
    // Remove # if present
    const hex = color.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Create light version with low opacity
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <Chip
      label={value}
      size="small"
      style={{
        backgroundColor: getLightBackground(color),
        color: color,
        border: 'none',
        fontWeight: '600',
      }}
    />
  );
};

export default StatusBadge;
