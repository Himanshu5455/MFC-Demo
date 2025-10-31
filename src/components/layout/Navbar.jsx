import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from '@mui/material/IconButton';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const onStorage = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogin = () => {
    navigate('/admin/login');
  };

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: '#ffffff', color: '#374151' }}>
      <div className="container mx-auto">
        <Toolbar className="flex justify-between px-0" sx={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MFC Logo" className="w-[40px] h-[40px]" />
            <Typography variant="h6" className="text-lg text-[#121417]">
              <span className="font-bold">MFC</span>
              <span className="font-medium"> . Triage assistant</span>
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            {/* <Badge badgeContent={99} color="error" className='bg-[#f3f3f3]'>
              <NotificationsIcon className="text-gray-600" />
            </Badge> */}
            <div className="relative p-2 rounded-xl bg-gray-200 hover:bg-gray-200">
              <NotificationsIcon className="text-gray-600 w-10 h-10" />
              <span className="absolute [top:-4px] [right:-14px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                99
              </span>
            </div>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-xl bg-gray-200 hover:bg-gray-200">
              <SettingsIcon className="text-gray-600" />
            </button>
            <Avatar alt="User" className="w-[40px] h-[40px] bg-blue-500">
              U
            </Avatar>
            {!isAuthenticated && (
              <button onClick={handleLogin} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-medium">
                LogIn
              </button>
            )}
          </div>
        </Toolbar>
      </div>
    </AppBar>
  );
};

export default Navbar;
