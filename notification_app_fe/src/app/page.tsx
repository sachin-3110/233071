'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ApiService } from '@/services/api';
import { Log } from '@/services/logger';

export default function SetupPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    mobileNo: '',
    githubUsername: '',
    rollNo: '',
    accessCode: '',
    clientID: '',
    clientSecret: '',
  });

  useEffect(() => {
    // If token already exists, skip setup
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/dashboard');
      return;
    }

    // Auto-fill credentials if they exist
    const savedClientID = localStorage.getItem('client_id');
    const savedClientSecret = localStorage.getItem('client_secret');
    const savedUserInfo = localStorage.getItem('user_info');

    if (savedClientID || savedClientSecret || savedUserInfo) {
      const userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : {};
      setFormData(prev => ({
        ...prev,
        clientID: savedClientID || '',
        clientSecret: savedClientSecret || '',
        email: userInfo.email || '',
        name: userInfo.name || '',
        rollNo: userInfo.rollNo || '',
      }));
      // If we have credentials, default to Auth mode instead of Register
      if (savedClientID && savedClientSecret) {
        setIsRegistering(false);
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let clientID = formData.clientID;
      let clientSecret = formData.clientSecret;

      if (isRegistering) {
        // Mobile Number Validation (len tag fix)
        if (formData.mobileNo.length !== 10 || !/^\d+$/.test(formData.mobileNo)) {
          setError('Mobile number must be exactly 10 digits.');
          setLoading(false);
          return;
        }

        try {
          const regRes = await ApiService.register({
            email: formData.email,
            name: formData.name,
            mobileNo: formData.mobileNo,
            githubUsername: formData.githubUsername,
            rollNo: formData.rollNo,
            accessCode: formData.accessCode,
          });
          clientID = regRes.clientID;
          clientSecret = regRes.clientSecret;
          
          // Persist credentials for auto-fill
          localStorage.setItem('client_id', clientID);
          localStorage.setItem('client_secret', clientSecret);
          
          await Log('info', 'auth', `Registration successful for ${formData.email}`);
        } catch (err: any) {
          if (err.message.toLowerCase().includes('already registered')) {
            setError('User already registered. Please use the "Already Registered" option below.');
            setIsRegistering(false);
            setLoading(false);
            return;
          }
          throw err;
        }
      }

      // Step 2: Auth
      const authRes = await ApiService.auth({
        email: formData.email,
        name: formData.name,
        rollNo: formData.rollNo,
        accessCode: formData.accessCode,
        clientID,
        clientSecret,
      });

      // Step 3: Store and Navigate
      localStorage.setItem('access_token', authRes.access_token);
      localStorage.setItem('user_info', JSON.stringify({
        email: formData.email,
        name: formData.name,
        rollNo: formData.rollNo,
      }));

      await Log('info', 'page', 'Setup flow completed successfully');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please check your details.');
      await Log('error', 'auth', `Setup failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            {isRegistering ? 'Register' : 'Authenticate'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Evaluation Service Setup Flow
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSetup}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Full Name"
                name="name"
                required
                fullWidth
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                required
                fullWidth
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                label="Roll Number"
                name="rollNo"
                required
                fullWidth
                value={formData.rollNo}
                onChange={handleChange}
              />
              <TextField
                label="Access Code"
                name="accessCode"
                type="password"
                required
                fullWidth
                value={formData.accessCode}
                onChange={handleChange}
              />

              {isRegistering && (
                <>
                  <TextField
                    label="Mobile Number"
                    name="mobileNo"
                    required
                    fullWidth
                    value={formData.mobileNo}
                    onChange={handleChange}
                    inputProps={{ maxLength: 10 }}
                    helperText="Must be exactly 10 digits"
                  />
                  <TextField
                    label="GitHub Username"
                    name="githubUsername"
                    required
                    fullWidth
                    value={formData.githubUsername}
                    onChange={handleChange}
                  />
                </>
              )}

              {!isRegistering && (
                <>
                  <Divider sx={{ my: 1 }}>Client Credentials</Divider>
                  <TextField
                    label="Client ID"
                    name="clientID"
                    required
                    fullWidth
                    value={formData.clientID}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Client Secret"
                    name="clientSecret"
                    type="password"
                    required
                    fullWidth
                    value={formData.clientSecret}
                    onChange={handleChange}
                  />
                </>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : (isRegistering ? 'Register & Enter' : 'Authenticate & Enter')}
              </Button>

              <Button
                variant="text"
                onClick={() => setIsRegistering(!isRegistering)}
                sx={{ mt: 1 }}
              >
                {isRegistering ? 'Already Registered? Click here' : 'Need to Register? Click here'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
