import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Grid,
  TextField,
  Alert,
  Fade,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import {
  FlashOn as FlashOnIcon,
  Compress as CompressIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import { formatters, detectLanguage } from '../formatter';

const EditorPage = () => {
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [language, setLanguage] = useState('json');
  const [copySuccess, setCopySuccess] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: 'info' });

  useEffect(() => {
    if (!inputCode) return;
    setLanguage(detectLanguage(inputCode));
  }, [inputCode]);

  const handleAction = (type) => {
    if (!inputCode.trim()) {
      setStatus({ msg: 'Please paste some code first!', type: 'error' });
      return;
    }

    try {
      const result = formatters[language][type](inputCode);
      if (result.startsWith('Error')) {
        setStatus({ msg: result, type: 'error' });
        setOutputCode('');
      } else {
        setOutputCode(result);
        setStatus({
          msg: type === 'beautify' ? 'Beautified successfully!' : 'Minified successfully!',
          type: 'success',
        });
      }
    } catch {
      setStatus({ msg: 'An error occurred.', type: 'error' });
    }
  };

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReset = () => {
    setInputCode('');
    setOutputCode('');
    setStatus({ msg: '', type: 'info' });
    navigate('/LandingPage');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Auto-detecting: <b>{language.toUpperCase()}</b>
        </Typography>
      </Box>

      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Toolbar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={(_, v) => v && setLanguage(v)}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            {['json', 'html', 'xml', 'css', 'js', 'sql'].map((lang) => (
              <ToggleButton key={lang} value={lang}>
                {lang.toUpperCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<FlashOnIcon />}
              onClick={() => handleAction('beautify')}
            >
              Beautify
            </Button>
            <Button
              variant="outlined"
              startIcon={<CompressIcon />}
              onClick={() => handleAction('minify')}
            >
              Minify
            </Button>

            <Divider orientation="vertical" flexItem />

            <IconButton onClick={handleCopy} color={copySuccess ? 'success' : 'default'}>
              {copySuccess ? <CheckIcon /> : <CopyIcon />}
            </IconButton>

            <IconButton onClick={handleReset} color="error">
              <ResetIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Status */}
        {status.msg && (
          <Fade in>
            <Alert severity={status.type}>{status.msg}</Alert>
          </Fade>
        )}

        {/* Editors */}
        <Grid container minHeight={{ xs: 'auto', md: 550 }}>
          <Grid item xs={12} md={6} sx={{ borderRight: { md: 1 }, borderColor: 'divider' }}>
            <Typography px={2} py={1} fontSize={12} fontWeight="bold">
              INPUT
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="standard"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste ${language.toUpperCase()} code...`}
              InputProps={{
                disableUnderline: true,
                sx: { fontFamily: 'monospace', p: 2 },
              }}
              sx={{ height: '100%' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography px={2} py={1} fontSize={12} fontWeight="bold" color="primary.main">
              OUTPUT
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="standard"
              value={outputCode}
              placeholder="Formatted result..."
              InputProps={{
                readOnly: true,
                disableUnderline: true,
                sx: { fontFamily: 'monospace', p: 2 },
              }}
              sx={{ height: '100%' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EditorPage;
