import React from 'react';
import { Card, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import { Notification } from '@/types';
import CircleIcon from '@mui/icons-material/Circle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface Props {
  notification: Notification;
  isViewed: boolean;
  onMarkAsViewed: (id: string) => void;
}

const typeColors: Record<string, "info" | "success" | "warning" | "default"> = {
  Event: 'info',
  Result: 'warning',
  Placement: 'success',
};

export default function NotificationCard({ notification, isViewed, onMarkAsViewed }: Props) {
  const date = new Date(notification.Timestamp);

  return (
    <Card 
      onClick={() => onMarkAsViewed(notification.ID)}
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
        opacity: isViewed ? 0.7 : 1,
        borderLeft: (theme) => `4px solid ${theme.palette[typeColors[notification.Type] || 'default'].main}`
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip 
              label={notification.Type} 
              size="small" 
              color={typeColors[notification.Type]} 
              variant={isViewed ? "outlined" : "filled"}
            />
            {!isViewed && (
              <Chip 
                icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
                label="New" 
                size="small" 
                color="secondary" 
                sx={{ height: 20 }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={isViewed ? 'normal' : 'bold'}>
            {notification.Message}
          </Typography>
        </Box>
        <IconButton size="small">
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
}
