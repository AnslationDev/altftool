"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  keyframes
} from "@mui/material";
import {
  ExpandMore as ExpandIcon
} from "@mui/icons-material";
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
  const [expanded, setExpanded] = useState("panel1");
  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const faqs = [
    {
      question: "What is a Flowchart Maker?",
      answer: "A Flowchart Maker is a visual tool that allows you to create flowcharts and diagrams using draggable nodes and connectors to represent processes or workflows."
    },
    {
      question: "How do I create a flowchart?",
      answer: "You can create a flowchart by dragging shapes from the toolbar onto the canvas and connecting them to define the flow."
    },
    {
      question: "Can I edit flowchart nodes after adding them?",
      answer: "Yes. You can double-click on any node to edit its text, resize it, or reposition it anywhere on the canvas."
    },
    {
      question: "Can I undo or redo my changes?",
      answer: "Yes. The tool supports undo and redo actions, allowing you to easily revert or reapply recent changes."
    },
    {
      question: "Can I save my flowchart?",
      answer: "Yes. Your flowchart is automatically saved in your browser and can also be exported as a JSON file for later editing."
    },
    {
      question: "Can I export my flowchart as an image?",
      answer: "Yes. You can export your flowchart as a PNG image to download or share with others."
    },
    {
      question: "Is my data private and secure?",
      answer: "Yes. All flowchart data is stored locally in your browser and is never uploaded or shared externally."
    }
  ];
  return <Box component="section" id="faq">
      <Container maxWidth="md">
        {
    /* Header */
  }
        <Box textAlign="center" mb={{ xs: 5, md: 7 }}>
          <Typography
    variant="h2"
    sx={{
      fontSize: { xs: "32px", sm: "40px", md: "48px" },
      fontWeight: 900,
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      mt: 5,
      mb: 2,
      lineHeight: 1.2,
      letterSpacing: "-1px"
    }}
  >
            Frequently Asked Questions ?
          </Typography>

          <Typography
    sx={{
      fontSize: { xs: "16px", sm: "18px" },
      color: "#64748b",
      lineHeight: 1.7
    }}
  >
            Find answers to common questions about our{" "}
            <strong>Flow Chart Maker</strong> App.
          </Typography>
        </Box>

        {
    /* FAQ Accordions */
  }
        <Box sx={{ animation: `${fadeInUp} 0.8s ease-out` }}>
          {faqs.map((faq, index) => <Accordion
    key={index}
    expanded={expanded === `panel${index + 1}`}
    onChange={handleChange(`panel${index + 1}`)}
    sx={{
      mb: 2,
      borderRadius: "12px !important",
      overflow: "hidden",
      boxShadow: "none",
      border: "1px solid",
      borderColor: expanded === `panel${index + 1}` ? "primary.main" : "divider",
      "&:before": { display: "none" },
      "&.Mui-expanded": {
        margin: "0 0 16px 0"
      }
    }}
  >
              <AccordionSummary
    expandIcon={<ExpandIcon />}
    sx={{
      px: 3,
      py: 1.5,
      "&:hover": {
        bgcolor: "rgba(79, 70, 229, 0.04)"
      },
      "& .MuiAccordionSummary-content": {
        my: 1.5
      }
    }}
  >
                <Typography
    sx={{
      fontWeight: 600,
      fontSize: { xs: "15px", sm: "16px" },
      color: expanded === `panel${index + 1}` ? "primary.main" : "text.primary"
    }}
  >
                  {faq.question}
                </Typography>
              </AccordionSummary>

              <AccordionDetails
    sx={{
      px: 3,
      py: 2,
      bgcolor: "rgba(79, 70, 229, 0.02)",
      borderTop: "1px solid",
      borderColor: "divider"
    }}
  >
                <Typography
    sx={{
      fontSize: "15px",
      color: "text.secondary",
      lineHeight: 1.7
    }}
  >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>)}
        </Box>
      </Container>
    </Box>;
};
export default FAQSection;
