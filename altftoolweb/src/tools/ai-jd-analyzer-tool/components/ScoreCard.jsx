import React from 'react';
import {
    Paper,
    Typography,
    Box,
    LinearProgress,
    Grid,
    Chip,
    alpha
} from '@mui/material';
import {
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    Star,
    TrendingUp,
    People,
    Lightbulb,
    Business
} from '@mui/icons-material';


const SCORE_CATEGORIES = {
    readability: { label: 'Readability', icon: TrendingUp },
    inclusivity: { label: 'Inclusivity', icon: People },
    clarity: { label: 'Clarity', icon: Lightbulb },
    marketFit: { label: 'Market Fit', icon: Business },
};

const getScoreData = (score) => {
    if (score >= 80) return { color: 'success', label: 'Excellent', Icon: CheckCircle };
    if (score >= 60) return { color: 'warning', label: 'Good', Icon: Warning };
    return { color: 'error', label: 'Needs Improvement', Icon: ErrorIcon };
};

const ScoreCard = ({ scores }) => {

    const scoreValues = Object.values(scores);
    const overallScore = Math.round(
        scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
    );
    const overallData = getScoreData(overallScore);

    const ScoreItem = ({ categoryKey, value }) => {
        const { label, icon: ItemIcon } = SCORE_CATEGORIES[categoryKey];
        const { color, Icon: StatusIcon } = getScoreData(value);

        return (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, transition: '0.3s', '&:hover': { backgroundColor: (theme) => alpha(theme.palette[color].main, 0.05) } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    {/* Category Label and Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ItemIcon fontSize="small" color={color} />
                        <Typography variant="body1" fontWeight="600">
                            {label}
                        </Typography>
                    </Box>

                    {/* Score Value and Status Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="700" color={`${color}.main`}>
                            {value}
                        </Typography>
                        <StatusIcon sx={{ fontSize: '1.1rem' }} color={color} />
                    </Box>
                </Box>

                {/* Modernized Linear Progress Bar */}
                <LinearProgress
                    variant="determinate"
                    value={value}
                    color={color}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: (theme) => alpha(theme.palette[color].main, 0.15),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            transition: 'transform .5s linear',
                        }
                    }}
                />
            </Box>
        );
    };

    return (
        <Paper
            elevation={8}
            sx={{
                p: 4,
                borderRadius: 3,

                background: (theme) => `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.5)})`,
                boxShadow: (theme) => `0 10px 30px ${alpha(theme.palette[overallData.color].main, 0.2)}`
            }}
        >
            <Typography variant="h4" gutterBottom fontWeight="700" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}>
                ✨ Content Assessment Scorecard
            </Typography>

            {/* Overall Score Section (High Contrast) */}
            <Box sx={{
                textAlign: 'center',
                my: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: (theme) => alpha(theme.palette[overallData.color].main, 0.1),
                border: (theme) => `1px solid ${alpha(theme.palette[overallData.color].main, 0.4)}`
            }}>
                <Star sx={{ fontSize: 40, color: `${overallData.color}.dark`, mb: 1 }} />
                <Typography variant="h6" color="text.secondary" fontWeight="500">
                    Overall Performance
                </Typography>
                <Typography
                    variant="h1"
                    fontWeight="800"
                    color={`${overallData.color}.dark`}
                    sx={{ my: 1, letterSpacing: '-2px' }}
                >
                    {overallScore}
                </Typography>
                <Chip
                    label={overallData.label}
                    icon={<overallData.Icon />}
                    color={overallData.color}
                    sx={{ mt: 1, fontWeight: 'bold' }}
                />
            </Box>

            <Typography variant="h6" mt={4} mb={2} fontWeight="600">
                Individual Criteria Breakdown
            </Typography>

            <Grid container spacing={2}>
                {/* Iterate over the defined categories */}
                {Object.keys(SCORE_CATEGORIES).map(key => (
                    <Grid item xs={12} sm={6} key={key}>
                        <ScoreItem categoryKey={key} value={scores[key]} />
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default ScoreCard;