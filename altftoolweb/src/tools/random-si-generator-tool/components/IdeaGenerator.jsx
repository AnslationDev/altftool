"use client";

import React, { useState } from 'react';
import {
    Container,
    Box,
    Button,
    Typography,
    Chip,
    Paper,
    Grid,
    IconButton,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import {
    AutoAwesome as SparkleIcon,
    Refresh as RefreshIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    ContentCopy as CopyIcon,
    Download as DownloadIcon,
    TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { seeds, mvpTemplates, titleTemplates, taglineTemplates } from '../data/seeds';

// Helper function to pick random item
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate unique ID
const generateId = () => `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Template filler function
const fillTemplate = (template, vars) => {
    let result = template;
    Object.keys(vars).forEach(key => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
    });
    return result;
};

const IdeaGenerator = ({ darkMode, onSave, savedIdeas }) => {
    const [currentIdea, setCurrentIdea] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const generateIdea = () => {
        const category = selectedCategory || pick(seeds.categories);
        const persona = pick(seeds.personas);
        const pain = pick(seeds.painPoints);
        const solution = pick(seeds.solutions);
        const tech = pick(seeds.techStacks);
        const revenue = pick(seeds.revenueModels);
        const modifier = pick(seeds.noveltyModifiers);
        const budget = pick(seeds.budgetRanges);
        const time = pick(seeds.timeToMVP);
        const geography = pick(seeds.geographies);
        const mvpSteps = pick(mvpTemplates);

        // Generate title
        const titleTemplate = pick(titleTemplates);
        const title = fillTemplate(titleTemplate, { category, persona, modifier });

        // Generate tagline
        const taglineTemplate = pick(taglineTemplates);
        const benefit = pain.replace(/hard to |difficult to |struggle with |can't |lack of /gi, '').trim();
        const tagline = fillTemplate(taglineTemplate, { persona, pain, solution, benefit });

        // Generate MVP steps
        const filledMVP = mvpSteps.map(step =>
            fillTemplate(step, {
                feature: solution.toLowerCase(),
                tech: tech[0],
                core_feature: solution.toLowerCase(),
                revenue: revenue.split(' ')[0].toLowerCase(),
                integration: 'payment processing',
                product: category.toLowerCase()
            })
        );

        // Select relevant tags
        const relevantTags = seeds.tags
            .filter(() => Math.random() > 0.6)
            .slice(0, 5);

        const idea = {
            id: generateId(),
            title,
            tagline,
            category,
            painPoint: pain,
            targetUser: persona,
            solution: `Build a ${modifier} ${category.toLowerCase()} that helps ${persona} overcome "${pain}" through ${solution.toLowerCase()}.`,
            revenueModel: revenue,
            techStack: tech,
            mvpSteps: filledMVP,
            estimatedBudget: budget,
            timeToMVP: time,
            geography,
            tags: relevantTags
        };

        setCurrentIdea(idea);
    };

    const handleSave = () => {
        if (currentIdea && !savedIdeas.find(i => i.id === currentIdea.id)) {
            onSave(currentIdea);
            setSnackbar({ open: true, message: '💾 Idea saved successfully!' });
        } else {
            setSnackbar({ open: true, message: '⚠️ Idea already saved!' });
        }
    };

    const handleCopy = () => {
        if (!currentIdea) return;

        const text = `
${currentIdea.title}
${currentIdea.tagline}

Category: ${currentIdea.category}
Target Users: ${currentIdea.targetUser}

Problem: ${currentIdea.painPoint}

Solution: ${currentIdea.solution}

Revenue Model: ${currentIdea.revenueModel}
Tech Stack: ${currentIdea.techStack.join(', ')}

MVP Steps:
${currentIdea.mvpSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Budget: ${currentIdea.estimatedBudget}
Time to MVP: ${currentIdea.timeToMVP}
Geography: ${currentIdea.geography}
    `.trim();

        navigator.clipboard.writeText(text);
        setSnackbar({ open: true, message: '📋 Copied to clipboard!' });
    };

    const handleDownload = () => {
        if (!currentIdea) return;

        const text = `
STARTUP IDEA: ${currentIdea.title}
========================================

Tagline: ${currentIdea.tagline}

OVERVIEW
--------
Category: ${currentIdea.category}
Target Users: ${currentIdea.targetUser}
Geography: ${currentIdea.geography}

PROBLEM
-------
${currentIdea.painPoint}

SOLUTION
--------
${currentIdea.solution}

BUSINESS MODEL
--------------
Revenue Model: ${currentIdea.revenueModel}
Estimated Budget: ${currentIdea.estimatedBudget}
Time to MVP: ${currentIdea.timeToMVP}

TECH STACK
----------
${currentIdea.techStack.join(', ')}

MVP ROADMAP
-----------
${currentIdea.mvpSteps.map((step, i) => `Step ${i + 1}: ${step}`).join('\n')}

TAGS
----
${currentIdea.tags.join(', ')}

========================================
Generated by Startup Idea Generator
    `.trim();

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentIdea.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: '⬇️ Idea downloaded!' });
    };

    const isSaved = currentIdea && savedIdeas.find(i => i.id === currentIdea.id);

    return (
        <Container id="generate" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            {/* Hero Section */}
            <Box  textAlign="center" mb={6}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.5,
                        borderRadius: 50,
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        mb: 2
                    }}
                >
                    <TrendingIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight={600} color="primary">
                        AI-Powered Business Ideas
                    </Typography>
                </Box>

                <Typography
                    variant="h3"
                    fontWeight={800}
                    gutterBottom
                    sx={{
                        fontSize: { xs: '28px', sm: '36px', md: '44px' },
                        background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    Generate Your Next Big Idea
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: 'auto', mb: 4, fontSize: { xs: '14px', sm: '16px' } }}
                >
                    Get AI-generated startup ideas with target market, tech stack, revenue model, and MVP roadmap in seconds.
                </Typography>

                {/* Category Filters */}
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip
                        label="All Categories"
                        onClick={() => setSelectedCategory(null)}
                        color={selectedCategory === null ? 'primary' : 'default'}
                        sx={{ fontWeight: selectedCategory === null ? 600 : 400 }}
                    />
                    {seeds.categories.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            onClick={() => setSelectedCategory(cat)}
                            color={selectedCategory === cat ? 'primary' : 'default'}
                            sx={{ fontWeight: selectedCategory === cat ? 600 : 400 }}
                        />
                    ))}
                </Box>

                {/* Generate Button */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={generateIdea}
                    startIcon={<SparkleIcon />}
                    sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: { xs: '14px', sm: '16px' },
                        background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #6b21a8 100%)',
                            boxShadow: '0 12px 32px rgba(59, 130, 246, 0.5)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Generate Idea
                </Button>
            </Box>

            {/* Idea Display */}
            {currentIdea && (
                <Paper
                    elevation={4}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 3,
                        background: darkMode
                            ? 'linear-gradient(135deg, #141b3d 0%, #1a2138 100%)'
                            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid',
                        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Header with Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <Chip
                                label={currentIdea.category}
                                size="small"
                                color="primary"
                                sx={{ mb: 1.5 }}
                            />
                            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '20px', sm: '28px' } }}>
                                {currentIdea.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: { xs: '14px', sm: '16px' } }}>
                                {currentIdea.tagline}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 2 }}>
                            <IconButton onClick={handleSave} color={isSaved ? 'error' : 'default'}>
                                {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                            <IconButton onClick={generateIdea}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Content Grid */}
                    <Grid container spacing={3}>
                        {/* Problem & Solution */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                                🎯 Target Users
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {currentIdea.targetUser}
                            </Typography>

                            <Typography variant="subtitle2" fontWeight={600} color="error" gutterBottom>
                                ⚠️ Problem
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {currentIdea.painPoint}
                            </Typography>

                            <Typography variant="subtitle2" fontWeight={600} color="success.main" gutterBottom>
                                💡 Solution
                            </Typography>
                            <Typography variant="body2">
                                {currentIdea.solution}
                            </Typography>
                        </Grid>

                        {/* Business Details */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                💰 Revenue Model
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {currentIdea.revenueModel}
                            </Typography>

                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                🛠️ Tech Stack
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {currentIdea.techStack.map((tech, i) => (
                                    <Chip key={i} label={tech} size="small" variant="outlined" />
                                ))}
                            </Box>

                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                💵 Estimated Budget
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {currentIdea.estimatedBudget}
                            </Typography>

                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                ⏱️ Time to MVP
                            </Typography>
                            <Typography variant="body2">
                                {currentIdea.timeToMVP}
                            </Typography>
                        </Grid>

                        {/* MVP Steps */}
                        <Grid item xs={12}>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SparkleIcon color="primary" />
                                MVP Roadmap
                            </Typography>
                            <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
                                {currentIdea.mvpSteps.map((step, i) => (
                                    <Typography key={i} component="li" variant="body2" sx={{ mb: 1.5 }}>
                                        {step}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>

                        {/* Tags & Geography */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    🌍 Geography:
                                </Typography>
                                <Chip label={currentIdea.geography} size="small" color="secondary" />
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {currentIdea.tags.map((tag, i) => (
                                    <Chip key={i} label={`#${tag}`} size="small" />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<CopyIcon />}
                            onClick={handleCopy}
                            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                        >
                            Copy
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                        >
                            Download
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={generateIdea}
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' },
                                background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                            }}
                        >
                            Generate New
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Empty State */}
            {!currentIdea && (
                <Paper
                    elevation={2}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '2px dashed',
                        borderColor: 'divider',
                    }}
                >
                    <SparkleIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Ready to discover your next big idea?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click "Generate Idea" to get started!
                    </Typography>
                </Paper>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default IdeaGenerator;