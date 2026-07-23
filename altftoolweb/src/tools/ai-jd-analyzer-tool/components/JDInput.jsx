"use client";

import React, { useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Divider,
    useMediaQuery,
    useTheme,
    Fade,
    Chip,
    Stack
} from '@mui/material';
import { Upload, Refresh, Analytics, Description, AutoAwesome } from '@mui/icons-material';

const JDInput = ({ onAnalyze, onReset, loading }) => {
    const [jdText, setJdText] = useState('');
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            setJdText(text);
        };

        if (file.type === 'text/plain') {
            reader.readAsText(file);
        } else if (file.type === 'application/pdf') {
            alert('PDF parsing requires additional library. Please paste text for now.');
        } else {
            alert('Please upload .txt files for now');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/plain') {
            handleFileUpload({ target: { files: [file] } });
        }
    };

    const handleAnalyze = () => {
        if (jdText.trim()) {
            onAnalyze(jdText);
        }
    };

    const handleReset = () => {
        setJdText('');
        setFileName('');
        onReset();
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: isMobile ? 2 : 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Fade in={true} timeout={800}>
                <Paper
                    elevation={24}
                    sx={{
                        maxWidth: 900,
                        width: '100%',
                        p: isMobile ? 3 : 5,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px 0 rgba(255, 87, 34, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 48px 0 rgba(255, 87, 34, 0.4)',
                        },
                    }}
                >
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ff5722 0%, #7c3aed 100%)',
                                mb: 2,
                                boxShadow: '0 8px 24px rgba(255, 87, 34, 0.5)',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': {
                                        transform: 'scale(1)',
                                    },
                                    '50%': {
                                        transform: 'scale(1.05)',
                                    },
                                },
                            }}
                        >
                            <Analytics sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant={isMobile ? 'h5' : 'h3'}
                            fontWeight="800"
                            sx={{
                                background: 'linear-gradient(135deg, #ff5722 0%, #7c3aed 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                            }}
                        >
                            Job Description Analyzer
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            Analyze job descriptions with AI-powered insights
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }}>
                        <Chip
                            icon={<AutoAwesome sx={{ fontSize: 18 }} />}
                            label="Smart Analysis"
                            size="small"
                            sx={{
                                background: 'linear-gradient(135deg, #ff5722 0%, #7c3aed 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        />
                    </Divider>

                    {/* File Upload Section */}
                    <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                            mb: 3,
                            p: 3,
                            border: isDragging ? '2px dashed #ff5722' : '2px dashed #e0e0e0',
                            borderRadius: 3,
                            background: isDragging
                                ? 'linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                                : 'rgba(248, 249, 250, 0.8)',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                        }}
                    >
                        <input
                            accept=".txt"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="file-upload">
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <Upload
                                    sx={{
                                        fontSize: 48,
                                        color: isDragging ? '#ff5722' : '#9e9e9e',
                                        mb: 1,
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                                <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                                    Drop your file here or click to upload
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Supports .txt files
                                </Typography>
                            </Box>
                        </label>
                        {fileName && (
                            <Fade in={true}>
                                <Chip
                                    icon={<Description />}
                                    label={fileName}
                                    color="success"
                                    onDelete={handleReset}
                                    sx={{
                                        mt: 2,
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                    }}
                                />
                            </Fade>
                        )}
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                            OR PASTE BELOW
                        </Typography>
                        <Divider sx={{ flex: 1 }} />
                    </Stack>

                    {/* Text Input Section */}
                    <TextField
                        multiline
                        rows={isMobile ? 10 : 12}
                        fullWidth
                        variant="outlined"
                        placeholder="Paste your job description here..."
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: 'rgba(248, 249, 250, 0.8)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'white',
                                },
                                '&.Mui-focused': {
                                    background: 'white',
                                    boxShadow: '0 4px 20px rgba(255, 87, 34, 0.2)',
                                },
                            },
                        }}
                    />

                    {/* Action Buttons */}
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleAnalyze}
                            disabled={!jdText.trim() || loading}
                            startIcon={<Analytics />}
                            size="large"
                            sx={{
                                py: 2,
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ff5722 0%, #7c3aed 100%)',
                                color: 'white',
                                boxShadow: '0 4px 20px rgba(255, 87, 34, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #e64a19 0%, #6d28d9 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 24px rgba(255, 87, 34, 0.5)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                },
                            }}
                        >
                            {loading ? 'Analyzing...' : 'Analyze JD'}
                        </Button>
                        <IconButton
                            onClick={handleReset}
                            disabled={loading}
                            size="large"
                            sx={{
                                width: isMobile ? '100%' : 'auto',
                                borderRadius: 3,
                                border: '2px solid #ff5722',
                                color: '#ff5722',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #ff5722 0%, #7c3aed 100%)',
                                    color: 'white',
                                    transform: 'rotate(180deg)',
                                },
                            }}
                        >
                            <Refresh />
                        </IconButton>
                    </Stack>

                    {/* Tip Section */}
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                            border: '1px solid rgba(255, 87, 34, 0.2)',
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <AutoAwesome sx={{ fontSize: 20, color: '#ff5722' }} />
                            <strong>Pro Tip:</strong> Detailed job descriptions yield more accurate and comprehensive analysis results
                        </Typography>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default JDInput;