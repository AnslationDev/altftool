"use client";

import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Grid,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    Work as RoleIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    TrendingUp as SeniorityIcon,
    Build as SkillsIcon,
    CalendarMonth as ExperienceIcon,
    CheckCircleOutline as QualificationIcon,
    AssignmentOutlined as ResponsibilityIcon
} from '@mui/icons-material';

const ExtractionResults = ({ data }) => {
    const theme = useTheme();


    const InfoRow = ({ icon: Icon, label, value, isArray }) => (
        <Box
            sx={{

mb: isArray ? { xs: 3, md: 4 } : { xs: 2, md: 3 },

               p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderColor: theme.palette.primary.light
                },
            }}
        >
            {/* Label and Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon sx={{ mr: 1.5, color: theme.palette.primary.main, fontSize: '1.4rem' }} />
                <Typography variant="body1" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px',fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    {label}
                </Typography>
            </Box>

            {/* Value (Array or Single) - Larger and Bolder */}
            {isArray && Array.isArray(value) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                    {value.length > 0 ? (
                        value.map((item, index) => (
                            <Chip
                                key={index}
                                label={item}
                                size="large"
                                color="primary"
                                variant="filled"
                                sx={{ fontWeight: '600', height: '36px', fontSize: '0.9rem' }}
                            />
                        ))
                    ) : (
                        <Typography variant="body2" fontStyle="italic" color="text.disabled">
                            No skills extracted.
                        </Typography>
                    )}
                </Box>
            ) : (
                <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    {value || 'N/A'}
                </Typography>
            )}
        </Box>
    );


    const DetailSection = ({ title, icon: Icon, items }) => (
        <Box
            sx={{
                mb: 4,
                p: 4,
                borderRadius: 3,
                backgroundColor: theme.palette.background.default,
                boxShadow: `0 2px 10px ${alpha(theme.palette.grey[500], 0.1)}`
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Icon sx={{ mr: 1.5, color: theme.palette.secondary.main, fontSize: '1.6rem' }} />
                <Typography variant="h5" fontWeight="700">
                    {title}
                </Typography>
            </Box>

            {Array.isArray(items) && items.length > 0 ? (
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {items.map((item, index) => (
                        <Typography
                            key={index}
                            component="li"
                            variant="body1"
                            sx={{ mb: 1.5, color: 'text.primary' }}
                        >
                            {item}
                        </Typography>
                    ))}
                </Box>
            ) : (
                <Typography variant="body1" fontStyle="italic" color="text.disabled" sx={{ ml: 3 }}>
                    No details found for this section.
                </Typography>
            )}
        </Box>
    );

    return (
        <Paper
            elevation={10}
            sx={{
                 p: { xs: 2, sm: 4, md: 6 },
                borderRadius: { xs: 2, sm: 3, md: 4 },

                boxShadow: {
      xs: `0 6px 20px ${alpha(theme.palette.primary.dark, 0.15)}`,
      md: `0 15px 40px ${alpha(theme.palette.primary.dark, 0.2)}`
    },
                background: theme.palette.background.paper
            }}
        >
            {/* Header Section */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" fontWeight="800" color="primary.dark"
                 sx={{
    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
    textAlign: { xs: 'center', sm: 'left' }
  }}

                >
                    🤖 Document Extraction Summary
                </Typography>
                <Typography variant="h6" color="text.secondary" mt={1}
                sx={{
    fontSize: { xs: '0.95rem', sm: '1.05rem' },
    textAlign: { xs: 'center', sm: 'left' }
  }}


                >
                    Detailed overview of the key data points extracted from the source document.
                </Typography>
            </Box>

            <Divider sx={{ mb: 5, borderStyle: 'dashed' }} />

            {/* Core Attributes Group */}
            <Typography variant="h4" mb={3} fontWeight="700">
                Job & Logistics Overview
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} lg={4}>
                    <InfoRow icon={RoleIcon} label="Role Title" value={data.roleTitle} />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                    <InfoRow icon={SeniorityIcon} label="Seniority Level" value={data.seniority} />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                    <InfoRow icon={TimeIcon} label="Employment Type" value={data.employmentType} />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                    <InfoRow icon={LocationIcon} label="Location" value={data.location} />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                    <InfoRow icon={ExperienceIcon} label="Experience Required" value={data.experienceYears} />
                </Grid>
            </Grid>

            <Divider sx={{ my: 5 }} />

            {/* Skills Section (Full Width, Prominent) */}
            <Typography variant="h4" mb={3} fontWeight="700">
                Technical Requirements
            </Typography>
            <InfoRow
                icon={SkillsIcon}
                label="Required Skills / Technologies"
                value={data.skills}
                isArray
            />

            <Divider sx={{ my: 5 }} />

            {/* Detail Sections (Responsibilities & Qualifications) - Side by Side */}
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <DetailSection
                        title="Key Responsibilities"
                        icon={ResponsibilityIcon}
                        items={data.responsibilities}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DetailSection
                        title="Required Qualifications"
                        icon={QualificationIcon}
                        items={data.qualifications}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ExtractionResults;
