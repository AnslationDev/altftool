"use client";

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
    question: 'What is a Mail Template Builder Tool?',
    answer:
      'A Mail Template Builder Tool is an online utility that helps you design professional email templates using a visual editor. It allows you to create responsive and reusable email layouts without writing complex HTML or CSS.',
  },
  {
    question: 'Do I need coding skills to use the Mail Template Builder?',
    answer:
      'No. The tool is built for both technical and non-technical users. You can create email templates using drag-and-drop components and simple customization options.',
  },
  {
    question: 'Can I customize colors, fonts, and layouts?',
    answer:
      'Yes. You can easily customize colors, fonts, spacing, and layout elements to match your brand identity and design requirements.',
  },
  {
    question: 'Does the Mail Template Builder support responsive emails?',
    answer:
      'Yes. All templates created with the tool are responsive and optimized to look good on desktops, tablets, and mobile devices.',
  },
  {
    question: 'Can I export the email template HTML?',
    answer:
      'Yes. You can export clean and email-client–friendly HTML that can be used with popular email services and marketing platforms.',
  },
  {
    question: 'Can I preview the email before using it?',
    answer:
      'Yes. The tool provides a live preview so you can see how your email will look before sending or exporting it.',
  },
  {
    question: 'Is the Mail Template Builder free to use?',
    answer:
      'Yes. The Mail Template Builder is completely free to use and does not require any sign-up or installation.',
  },
  {
    question: 'Is my email content stored or shared?',
    answer:
      'No. The tool does not store or share your email content. Everything is generated and processed securely in real time.',
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
                        Find answers to common questions about our <strong>Mail Template Builder</strong> tool
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
