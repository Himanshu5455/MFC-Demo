import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const AlertItem = ({ type, message }) => {
  let IconComponent, styles;

  switch (type) {
    case 'info':
      IconComponent = DescriptionIcon;
      styles = {
        borderColor: '#03A9F4',
        backgroundColor: '#E3F2FD',
        iconColor: '#03A9F4',
      };
      break;
    case 'error':
      IconComponent = ErrorOutlineIcon;
      styles = {
        borderColor: '#F44336',
        backgroundColor: '#FDECEA',
        iconColor: '#F44336',
      };
      break;
    case 'warning':
      IconComponent = InfoOutlinedIcon;
      styles = {
        borderColor: '#F57C00',
        backgroundColor: '#FFF4E5',
        iconColor: '#F57C00',
      };
      break;
          case 'age':
      IconComponent = InfoOutlinedIcon;
      styles = {
        borderColor: '#F44336',
        backgroundColor: '#FDECEA',
        iconColor: '#F44336',
      };
      break;
    default:
      IconComponent = InfoOutlinedIcon;
      styles = {
        borderColor: '#03A9F4',
        backgroundColor: '#E3F2FD',
        iconColor: '#03A9F4',
      };
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 2,
        border: `2px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        mb: 1.5,
      }}
    >
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <IconComponent sx={{ fontSize: 22, color: styles.iconColor }} />
      </Box>
      <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};
export default AlertItem;
