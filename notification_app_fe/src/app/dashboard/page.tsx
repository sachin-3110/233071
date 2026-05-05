'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import NotificationCard from '@/components/NotificationCard';
import { ApiService } from '@/services/api';
import { Log } from '@/services/logger';
import { Notification } from '@/types';

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState('All');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    
    if (!token) return;

    try {
      await Log('info', 'api', `Fetching notifications: page=${page}, limit=${limit}, type=${type}`);
      const data = await ApiService.getNotifications({
        page,
        limit,
        notification_type: type,
        token
      });
      setNotifications(data);
      await Log('info', 'api', 'Notifications fetch success');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      await Log('error', 'api', `Fetch failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type]);

  useEffect(() => {
    fetchNotifications();
    
    // Load viewed IDs
    const stored = localStorage.getItem('viewed_ids');
    if (stored) {
      setViewedIds(new Set(JSON.parse(stored)));
    }
  }, [fetchNotifications]);

  const handleMarkAsViewed = (id: string) => {
    const newViewed = new Set(viewedIds);
    newViewed.add(id);
    setViewedIds(newViewed);
    localStorage.setItem('viewed_ids', JSON.stringify(Array.from(newViewed)));
    Log('info', 'component', `Notification ${id} marked as viewed`);
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    setType(e.target.value);
    setPage(1); // Reset to first page
    Log('info', 'page', `Filter changed to ${e.target.value}`);
  };

  const handleLimitChange = (e: SelectChangeEvent) => {
    setLimit(parseInt(e.target.value));
    setPage(1);
    Log('info', 'page', `Limit changed to ${e.target.value}`);
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Notifications
        </Typography>

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={handleTypeChange}>
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Event">Events</MenuItem>
              <MenuItem value="Result">Results</MenuItem>
              <MenuItem value="Placement">Placements</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Limit</InputLabel>
            <Select value={limit.toString()} label="Limit" onChange={handleLimitChange}>
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : notifications.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No notifications found.</Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.ID}
                notification={notif}
                isViewed={viewedIds.has(notif.ID)}
                onMarkAsViewed={handleMarkAsViewed}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={10} // Ideally based on total from API
              page={page} 
              onChange={(_, p) => {
                setPage(p);
                window.scrollTo(0, 0);
              }} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </DashboardLayout>
  );
}
