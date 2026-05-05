'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import NotificationCard from '@/components/NotificationCard';
import { ApiService } from '@/services/api';
import { Log } from '@/services/logger';
import { Notification } from '@/types';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

export default function PriorityPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topN, setTopN] = useState(10);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        await Log('info', 'page', 'Ranking start');
        // Fetch a large chunk to rank locally
        const data = await ApiService.getNotifications({ limit: 100, page: 1, token });
        setNotifications(data);
        await Log('info', 'page', 'Ranking success');
      } catch (err: any) {
        setError(err.message);
        await Log('error', 'page', `Ranking failure: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const stored = localStorage.getItem('viewed_ids');
    if (stored) setViewedIds(new Set(JSON.parse(stored)));
  }, []);

  const prioritizedData = useMemo(() => {
    const priorityMap = {
      Placement: 3,
      Result: 2,
      Event: 1,
    };

    return [...notifications]
      .sort((a, b) => {
        // First by type priority
        const pA = priorityMap[a.Type] || 0;
        const pB = priorityMap[b.Type] || 0;
        if (pA !== pB) return pB - pA;

        // Then by timestamp
        return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
      })
      .slice(0, topN);
  }, [notifications, topN]);

  const handleMarkAsViewed = (id: string) => {
    const newViewed = new Set(viewedIds);
    newViewed.add(id);
    setViewedIds(newViewed);
    localStorage.setItem('viewed_ids', JSON.stringify(Array.from(newViewed)));
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PriorityHighIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            Priority Board
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Show Top N</InputLabel>
          <Select 
            value={topN.toString()} 
            label="Show Top N" 
            onChange={(e) => {
              setTopN(parseInt(e.target.value));
              Log('info', 'page', `Top N changed to ${e.target.value}`);
            }}
          >
            <MenuItem value="5">Top 5</MenuItem>
            <MenuItem value="10">Top 10</MenuItem>
            <MenuItem value="15">Top 15</MenuItem>
            <MenuItem value="20">Top 20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(144, 202, 249, 0.05)', border: '1px solid rgba(144, 202, 249, 0.2)' }}>
        <Typography variant="body2" color="primary" gutterBottom>
          Ranking Algorithm Active:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          1. Placement &gt; 2. Result &gt; 3. Event | Sub-sort: Newest First
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : prioritizedData.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 10 }}>No priority data available.</Typography>
      ) : (
        <Box>
          {prioritizedData.map((notif, index) => (
            <React.Fragment key={notif.ID}>
              <NotificationCard
                notification={notif}
                isViewed={viewedIds.has(notif.ID)}
                onMarkAsViewed={handleMarkAsViewed}
              />
              {index < prioritizedData.length - 1 && <Divider sx={{ my: 1, opacity: 0.1 }} />}
            </React.Fragment>
          ))}
        </Box>
      )}
    </DashboardLayout>
  );
}
