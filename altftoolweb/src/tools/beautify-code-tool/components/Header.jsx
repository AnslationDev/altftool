"use client";


import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme } from '@mui/material';
import { Code as CodeIcon, FlashOn as FlashOnIcon } from '@mui/icons-material';

const Header = ({ currentView, setView }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: '64px',
        zIndex: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Matching the Slate-900 style
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: '1280px', width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Logo Section */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 2 }}
          onClick={() => setView('landing')}
        >
          <Box
            sx={{
              p: 1,
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
            }}
          >
            <CodeIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Beautify<span style={{ color: theme.palette.primary.main }}>.io</span>
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={() => setView('landing')}
            color="inherit"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: currentView === 'landing' ? 'text.primary' : 'text.secondary',
              bgcolor: currentView === 'landing' ? 'rgba(255,255,255,0.05)' : 'transparent',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Overview
          </Button>

          <Button
            onClick={() => setView('editor')}
            variant={currentView === 'editor' ? 'contained' : 'text'}
            startIcon={<FlashOnIcon fontSize="small" />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: currentView === 'editor' ? '0 4px 14px 0 rgba(0,118,255,0.39)' : 'none',
              color: currentView === 'editor' ? '#fff' : 'text.secondary',
            }}
          >
            Editor
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
