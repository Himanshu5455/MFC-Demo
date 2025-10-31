import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Typography variant="body2" className="text-gray-600">
        View:
      </Typography>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(e, newView) => newView && onViewChange(newView)}
        aria-label="view toggle"
        size="small"
        sx={{
          '& .MuiToggleButtonGroup-grouped': {
            margin: 0,
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            color: '#6b7280',
            '&:not(:first-of-type)': {
              borderRadius: 0,
              borderLeft: 'none',
            },
            '&:first-of-type': {
              borderRadius: '6px 0 0 6px',
            },
            '&:last-of-type': {
              borderRadius: '0 6px 6px 0',
            },
            '&.Mui-selected': {
              backgroundColor: 'white',
              border: '2px solid #1976d2',
              color: '#1976d2',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'white',
              }
            },
            '&:hover': {
              backgroundColor: '#f9fafb',
            }
          }
        }}
      >
        <ToggleButton value="table" aria-label="table view">
          <MenuIcon sx={{ fontWeight: 300 }} />
        </ToggleButton>
        <ToggleButton value="grid" aria-label="grid view">
          <img src="/icons/view_grid.png" alt="Grid View" className="w-5 h-5" />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default ViewToggle;
