// Horizontal progress bar for status breakdown
import Box from '@mui/material/Box';
import { statusColors } from '../../utils/constants';

const ProgressBar = ({ breakdown }) => {
  const total = breakdown.reduce((acc, s) => acc + s.value, 0);
  
  // Function to create a lighter shade of the color
  const getLightShade = (color) => {
    // Remove # if present
    const hex = color.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Create much lighter version by mixing with white (adding 150 to each component, max 255)
    const lightR = Math.min(255, r + 150);
    const lightG = Math.min(255, g + 150);
    const lightB = Math.min(255, b + 150);
    // Convert back to hex
    return `rgb(${lightR}, ${lightG}, ${lightB})`;
  };

  return (
    <Box className="flex w-full h-3 rounded-full overflow-hidden shadow-sm gap-[2px]">
      {breakdown.map((s, index) => (
        <div
          key={s.label}
          style={{
            width: `${(s.value / total) * 100}%`,
            background: index === 0 
              ? statusColors[s.label] || '#eee'
              : `linear-gradient(to right, ${getLightShade(statusColors[s.label])} 2%, ${statusColors[s.label] || '#eee'})`,
          }}
          className="h-full rounded-sm"
        />
      ))}
    </Box>
  );
};

export default ProgressBar;
