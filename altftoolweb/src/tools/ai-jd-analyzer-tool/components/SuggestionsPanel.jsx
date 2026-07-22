import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    useTheme,
    alpha
} from '@mui/material';
import {
    Title as TitleIcon,
    AttachMoney as MoneyIcon,
    Label as LabelIcon,
    Lightbulb as LightbulbIcon,
    ArrowRightAlt as ArrowIcon
} from '@mui/icons-material';

const SuggestionsPanel = ({ suggestions }) => {
    const theme = useTheme();

    const SuggestionBlock = ({ title, icon: Icon, color, children }) => (
        <Box
            sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,

                backgroundColor: alpha(theme.palette[color].main, 0.05),
                border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`
            }}
        >
            {/* Header with Icon and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Icon sx={{ mr: 1.5, color: theme.palette[color].main, fontSize: '1.5rem' }} />
                <Typography variant="h6" fontWeight="700" color="text.primary">
                    {title}
                </Typography>
            </Box>
            {children}
        </Box>
    );

    return (
        <Paper
            elevation={8}
            sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: `0 10px 25px ${alpha(theme.palette.info.main, 0.1)}`
            }}
        >
            <Typography variant="h4" gutterBottom fontWeight="800" color="info.dark">
                🧠 AI Recommendations
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Enhance your content using these data-driven suggestions.
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* --- Alternative Titles --- */}
            <SuggestionBlock
                title="Alternative Job Titles"
                icon={TitleIcon}
                color="primary"
            >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Consider these high-traffic titles to improve search visibility:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {suggestions.alternativeTitles.map((title, index) => (
                        <Chip
                            key={index}
                            label={title}
                            color="primary"
                            variant="filled"
                            size="medium"
                            clickable
                            sx={{ fontWeight: '600', height: '32px' }}
                        />
                    ))}
                </Box>
            </SuggestionBlock>

            {/* --- Recommended Salary Band --- */}
            {suggestions.salaryBand && (
                <SuggestionBlock
                    title="Recommended Compensation"
                    icon={MoneyIcon}
                    color="success"
                >
                    <Typography variant="h5" fontWeight="700" color="success.dark" sx={{ mb: 1 }}>
                        {suggestions.salaryBand}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This band is based on current market rates and regional data for similar seniority levels.
                    </Typography>
                </SuggestionBlock>
            )}

            {/* --- Job Board Tags --- */}
            <SuggestionBlock
                title="Job Board Tags"
                icon={LabelIcon}
                color="secondary"
            >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use these tags to better categorize your post on major job platforms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {suggestions.jobBoardTags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            size="medium"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontWeight: '500' }}
                        />
                    ))}
                </Box>
            </SuggestionBlock>

            {/* --- Improvement Tips --- */}
            <SuggestionBlock
                title="Content Improvement Tips"
                icon={LightbulbIcon}
                color="warning"
            >
                <List sx={{ p: 0 }}>
                    {suggestions.improvementTips.map((tip, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                pl: 0,
                                alignItems: 'flex-start',
                                mb: 1,
                                borderBottom: `1px dashed ${theme.palette.divider}`
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 30, mt: '4px' }}>
                                <ArrowIcon color="warning" sx={{ fontSize: '1.1rem' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={tip}
                                primaryTypographyProps={{
                                    variant: 'body1',
                                    color: 'text.primary'
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </SuggestionBlock>
        </Paper>
    );
};

export default SuggestionsPanel;