'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(pathname === '/priority' ? 1 : 0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
    }
    setValue(pathname === '/priority' ? 1 : 0);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    router.push('/');
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) router.push('/dashboard');
    else router.push('/priority');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Notify Hub
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Tabs value={value} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label="All Notifications" />
            <Tab label="Priority Board" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.12)', mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 Campus Hiring Evaluation - Frontend Track
        </Typography>
      </Box>
    </Box>
  );
}
