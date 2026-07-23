"use client";

import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    Tabs,
    Tab,
    TextField,
    Divider,
    Snackbar,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    Visibility as PreviewIcon,
    RocketLaunch as RocketIcon,
    Save as SaveIcon
} from '@mui/icons-material';

const RewrittenJD = ({ original, rewritten }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(rewritten);
    const [snackbarOpen, setSnackbarOpen] = useState(false);


    const currentText = activeTab === 0 ? original : editedText;

    const isImprovedTab = activeTab === 1;

    const handleCopy = () => {
        navigator.clipboard.writeText(currentText);
        setSnackbarOpen(true);
    };

    const handleDownload = () => {
        const textToDownload = currentText;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-description-${activeTab === 0 ? 'original' : 'improved'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setIsEditing(false);
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {

        setIsEditing(false);

    };

    return (
        <Paper
            elevation={8}
            sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: `0 10px 30px ${alpha(theme.palette.grey[800], 0.1)}`
            }}
        >
            {/* --- Header & Action Row --- */}
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    {/* LEFT TITLE */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: { xs: '1 1 100%', sm: '0 1 auto' }
                        }}
                    >
                        <RocketIcon
                            sx={{
                                mr: 1.5,
                                color: theme.palette.primary.dark,
                                fontSize: '2rem'
                            }}
                        />
                        <Typography variant="h4" fontWeight="800" color="text.primary">
                            Job Description Editor
                        </Typography>
                    </Box>

                    {/* BUTTONS WRAPPER */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                            width: { xs: '100%', sm: 'auto' }
                        }}
                    >
                        {/* Edit / Save */}
                        {isImprovedTab && (
                            <Button
                                size="small"
                                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                                onClick={isEditing ? handleSave : toggleEdit}
                                variant={isEditing ? 'contained' : 'outlined'}
                                color={isEditing ? 'success' : 'primary'}
                                disabled={isEditing && editedText === rewritten}
                                sx={{
                                    minWidth: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                {isEditing ? 'Save Changes' : 'Edit'}
                            </Button>
                        )}

                        {/* Copy */}
                        <Button
                            size="small"
                            startIcon={<CopyIcon />}
                            onClick={handleCopy}
                            variant="contained"
                            color="primary"
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Copy
                        </Button>

                        {/* Download */}
                        <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            variant="outlined"
                            color="primary"
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Download
                        </Button>
                    </Box>
                </Box>

            </Box>

            {/* --- Tabs --- */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ mb: 3 }}
                // Modern Tab styling
                TabIndicatorProps={{ style: { backgroundColor: theme.palette.primary.main } }}
            >
                <Tab
                    label="Original JD"
                    icon={!isImprovedTab && <PreviewIcon />}
                    iconPosition="start"
                    sx={{ fontWeight: '700' }}
                />
                <Tab
                    label="AI Improved Version"
                    icon={isImprovedTab && !isEditing ? <PreviewIcon /> : <EditIcon />}
                    iconPosition="start"
                    sx={{ fontWeight: '700' }}
                />
            </Tabs>

            <Divider sx={{ mb: 3 }} />


            <Box
                sx={{
                    minHeight: '400px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    p: 3,

                    backgroundColor: isEditing ? theme.palette.background.default : alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                    border: isEditing ? `2px solid ${theme.palette.success.light}` : `1px solid ${theme.palette.divider}`,
                    transition: 'border 0.3s, background-color 0.3s',
                    position: 'relative'
                }}
            >
                {/* Text Field for Editing */}
                {isImprovedTab && isEditing ? (
                    <TextField
                        multiline
                        fullWidth
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                fontSize: '1rem',
                                fontFamily: 'Monospace, Roboto',
                                lineHeight: 1.6,
                            }
                        }}
                    />
                ) : (

                    <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                    >
                        {currentText}
                    </Typography>
                )}
            </Box>

            {/* --- Improvement Summary (Only on Improved Tab) --- */}
            {isImprovedTab && (
                <Box sx={{ mt: 3, p: 3, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="700" color="info.dark" gutterBottom>
                        ✨ Key AI Improvements
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            **Readability:** Simplified complex language and sentence structure.
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            **Inclusivity:** Removed potentially gendered, biased, or exclusive terms.
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            **Clarity:** Ensured requirements and responsibilities are unambiguous.
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                            **SEO/Exposure:** Optimized keywords for better job board visibility.
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* --- Snackbar Notification --- */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
                    Content of **{activeTab === 0 ? 'Original' : 'Improved'}** JD copied to clipboard!
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default RewrittenJD;