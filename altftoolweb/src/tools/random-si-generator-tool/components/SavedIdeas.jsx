import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    ExpandMore as ExpandIcon,
    ContentCopy as CopyIcon,
    Bookmark as BookmarkIcon
} from '@mui/icons-material';

const SavedIdeas = ({ ideas, onDelete, darkMode }) => {
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    if (ideas.length === 0) {
        return null;
    }

    const handleView = (idea) => {
        setSelectedIdea(idea);
        setDialogOpen(true);
    };

    const handleCopy = (idea) => {
        const text = `
${idea.title}
${idea.tagline}

Category: ${idea.category}
Target Users: ${idea.targetUser}
Problem: ${idea.painPoint}
Solution: ${idea.solution}

Revenue Model: ${idea.revenueModel}
Tech Stack: ${idea.techStack.join(', ')}

MVP Steps:
${idea.mvpSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Budget: ${idea.estimatedBudget}
Time: ${idea.timeToMVP}
    `.trim();

        navigator.clipboard.writeText(text);
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <BookmarkIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '24px', sm: '32px' } }}>
                        Saved Ideas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {ideas.length} idea{ideas.length !== 1 ? 's' : ''} saved
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {ideas.map((idea) => (
                    <Grid item xs={12} sm={6} md={4} key={idea.id}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2.5,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                background: darkMode
                                    ? 'linear-gradient(135deg, #141b3d 0%, #1a2138 100%)'
                                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '1px solid',
                                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                }
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Chip label={idea.category} size="small" color="primary" />
                                    <Box>
                                        <IconButton size="small" onClick={() => handleView(idea)}>
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleCopy(idea)}>
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDelete(idea.id)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '16px', mb: 1 }}>
                                    {idea.title}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', fontStyle: 'italic' }}>
                                    {idea.tagline}
                                </Typography>
                            </Box>

                            {/* Quick Info */}
                            <Box sx={{ mb: 2, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    🎯 {idea.targetUser}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    💰 {idea.revenueModel}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    ⏱️ {idea.timeToMVP} • {idea.estimatedBudget}
                                </Typography>
                            </Box>

                            {/* Expand for more */}
                            <Box>
                                <Button
                                    size="small"
                                    fullWidth
                                    onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                                    endIcon={<ExpandIcon sx={{
                                        transform: expandedId === idea.id ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s'
                                    }} />}
                                    sx={{ fontSize: '12px' }}
                                >
                                    {expandedId === idea.id ? 'Show Less' : 'Show More'}
                                </Button>

                                <Collapse in={expandedId === idea.id}>
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                                            Tech Stack:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                            {idea.techStack.map((tech, i) => (
                                                <Chip key={i} label={tech} size="small" sx={{ fontSize: '10px', height: 20 }} />
                                            ))}
                                        </Box>

                                        <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                                            MVP Steps:
                                        </Typography>
                                        <Box component="ol" sx={{ pl: 2, m: 0 }}>
                                            {idea.mvpSteps.map((step, i) => (
                                                <Typography key={i} component="li" variant="caption" sx={{ mb: 0.5 }}>
                                                    {step}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Saved Date */}
                            {idea.savedAt && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, fontSize: '10px' }}>
                                    Saved: {new Date(idea.savedAt).toLocaleDateString()}
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Detail Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: darkMode
                            ? 'linear-gradient(135deg, #141b3d 0%, #1a2138 100%)'
                            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    }
                }}
            >
                {selectedIdea && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Chip label={selectedIdea.category} size="small" color="primary" sx={{ mb: 1 }} />
                                    <Typography variant="h5" fontWeight={700}>
                                        {selectedIdea.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        {selectedIdea.tagline}
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                                        🎯 Target Users
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedIdea.targetUser}
                                    </Typography>

                                    <Typography variant="subtitle2" fontWeight={600} color="error" gutterBottom>
                                        ⚠️ Problem
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedIdea.painPoint}
                                    </Typography>

                                    <Typography variant="subtitle2" fontWeight={600} color="success.main" gutterBottom>
                                        💡 Solution
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedIdea.solution}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        💰 Revenue Model
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedIdea.revenueModel}
                                    </Typography>

                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        🛠️ Tech Stack
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {selectedIdea.techStack.map((tech, i) => (
                                            <Chip key={i} label={tech} size="small" variant="outlined" />
                                        ))}
                                    </Box>

                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        💵 Budget & Time
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedIdea.estimatedBudget} • {selectedIdea.timeToMVP}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        🚀 MVP Roadmap
                                    </Typography>
                                    <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
                                        {selectedIdea.mvpSteps.map((step, i) => (
                                            <Typography key={i} component="li" variant="body2" sx={{ mb: 1 }}>
                                                {step}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        🌍 Geography
                                    </Typography>
                                    <Chip label={selectedIdea.geography} size="small" color="secondary" />
                                </Grid>

                                {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            🏷️ Tags
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {selectedIdea.tags.map((tag, i) => (
                                                <Chip key={i} label={`#${tag}`} size="small" />
                                            ))}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => handleCopy(selectedIdea)} startIcon={<CopyIcon />}>
                                Copy
                            </Button>
                            <Button onClick={() => onDelete(selectedIdea.id)} color="error" startIcon={<DeleteIcon />}>
                                Delete
                            </Button>
                            <Button onClick={() => setDialogOpen(false)} variant="contained">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default SavedIdeas;