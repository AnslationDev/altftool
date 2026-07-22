import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    keyframes
} from '@mui/material';
import {
    ExpandMore as ExpandIcon,
    Help as HelpIcon
} from '@mui/icons-material';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FAQSection = () => {
    const [expanded, setExpanded] = useState('panel1');

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

 const faqs = [
  {
    question: "What is the Corporate Tools Directory?",
    answer:
      "The Corporate Tools Directory is a curated platform that helps businesses discover, compare, and evaluate productivity, management, and enterprise software tools in one centralized place.",
  },
  {
    question: "Is the Corporate Tools Directory free to use?",
    answer:
      "Yes. The directory is completely free to browse, search, and explore. Some listed tools may offer free trials, freemium plans, or paid subscriptions.",
  },
  {
    question: "How are tools categorized in the directory?",
    answer:
      "Tools are organized into clear categories such as Communication, Project Management, CRM, Finance, HR, Analytics, Development, Marketing, and Customer Support to ensure easy discovery.",
  },
  {
    question: "Can I search and filter tools easily?",
    answer:
      "Absolutely. You can search tools by name, features, or keywords and apply category-based filters to quickly find tools that match your business needs.",
  },
  {
    question: "Does this platform sell or promote any tools?",
    answer:
      "No. The Corporate Tools Directory is an informational and comparison-based platform. It does not directly sell tools or force paid promotions.",
  },
  {
    question: "How accurate is the pricing information?",
    answer:
      "Pricing details are provided for reference purposes only and may change over time. We recommend visiting the official website of each tool for the most up-to-date pricing.",
  },
  {
    question: "Can I suggest a new tool to be added?",
    answer:
      "Yes. Users can submit suggestions for new tools. Relevant and valuable corporate tools may be reviewed and added in future updates.",
  },

];




    return (
        <Box
            component="section"
            id="faq"
        >
            <Container maxWidth="md">
                {/* Header */}
                <Box textAlign="center" mb={{ xs: 5, md: 7 }}>


                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '32px', sm: '40px', md: '48px' },
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mt:5,
                            mb: 2,
                            lineHeight: 1.2,
                            letterSpacing: '-1px'
                        }}
                    >
                        Frequently Asked Questions ?
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: { xs: '16px', sm: '18px' },
                         color: "#64748b",

                            lineHeight: 1.7
                        }}
                    >
                        Find answers to common questions about our <strong>Digital Wallet </strong> App.
                    </Typography>
                </Box>

                {/* FAQ Accordions */}
                <Box sx={{ animation: `${fadeInUp} 0.8s ease-out` }}>
                    {faqs.map((faq, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === `panel${index + 1}`}
                            onChange={handleChange(`panel${index + 1}`)}
                            sx={{
                                mb: 2,
                                borderRadius: '12px !important',
                                overflow: 'hidden',
                                boxShadow: 'none',
                                border: '1px solid',
                                borderColor: expanded === `panel${index + 1}` ? 'primary.main' : 'divider',
                                '&:before': {
                                    display: 'none'
                                },
                                '&.Mui-expanded': {
                                    margin: '0 0 16px 0'
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandIcon />}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: 'rgba(79, 70, 229, 0.04)'
                                    },
                                    '& .MuiAccordionSummary-content': {
                                        my: 1.5
                                    }
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: { xs: '15px', sm: '16px' },
                                        color: expanded === `panel${index + 1}` ? 'primary.main' : 'text.primary'
                                    }}
                                >
                                    {faq.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                sx={{
                                    px: 3,
                                    py: 2,
                                    bgcolor: 'rgba(79, 70, 229, 0.02)',
                                    borderTop: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '15px',
                                        color: 'text.secondary',
                                        lineHeight: 1.7
                                    }}
                                >
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

            </Container>
        </Box>
    );
};

export default FAQSection;
