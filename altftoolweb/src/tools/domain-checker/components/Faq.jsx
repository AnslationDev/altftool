import React, { useState } from "react";
import { Container, useTheme } from "@mui/material";

// Chevron Icon
const ChevronDown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export default function FAQ({ isDark }) {
    const [openIndex, setOpenIndex] = useState(null);

    const theme = useTheme();
    const faqs = [
        {
            question: "What is Domain Availability Checker?",
            answer: "Domain Availability Checker is a fast and reliable tool that helps you instantly check if a domain name is available for registration. Simply enter your desired domain and get real-time availability results."
        },
        {
            question: "How do I use the domain checker?",
            answer: "Enter your desired domain name (e.g., example.com) in the input field and click 'Check Domain'. The system will instantly verify if the domain is available or already taken by someone else."
        },
        {
            question: "What domain extensions can I check?",
            answer: "You can check any valid domain extension including popular ones like .com, .net, .org, .io, .co, and many country-specific extensions. Just include the extension in your search (e.g., mysite.com)."
        },
        {
            question: "Is the domain information accurate?",
            answer: "Yes! Our checker queries real-time domain registration databases to provide accurate, up-to-date information about domain availability. However, availability can change quickly, so we recommend registering immediately when you find an available domain."
        },
        {
            question: "Do I need to create an account?",
            answer: "No account needed! Domain Availability Checker is completely free to use without any registration. Just visit the site, enter your domain, and get instant results."
        },
        {
            question: "Can I register the domain through this tool?",
            answer: "This tool checks domain availability only. Once you find an available domain, you'll need to register it through a domain registrar like GoDaddy, Namecheap, Google Domains, or other providers."
        },
        {
            question: "Why does it say a domain is taken?",
            answer: "If a domain shows as 'taken', it means someone has already registered that domain name. You can try variations of your desired name, use different extensions, or add prefixes/suffixes to find an available alternative."
        },
        {
            question: "How quickly are results shown?",
            answer: "Results are displayed instantly! Our optimized system checks domain availability in real-time and shows you whether the domain is available or taken within seconds."
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '50px',
        background: isDark
            ? 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '24px',
        boxShadow: isDark
            ? '0 4px 16px rgba(129, 140, 248, 0.3)'
            : '0 4px 16px rgba(102, 126, 234, 0.2)',
    };

    return (
        <Container maxWidth="md">
            {/* <div style={{
                // padding: '80px 32px',
                Height: '100vh',
            }}> */}

{/* udoate responsiveness */}

<div style={{
  minHeight:'100vh',
  padding:'64px 16px',
}} >




                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                }}>
                    {/* Header */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '60px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <div style={badgeStyle}>
                                <span>💬</span>
                                <span>Got Questions?</span>
                            </div>
                        </div>

                        <h2 style={{
                            // fontSize: '56px',
                            fontSize: 'clamp(32px, 5vw, 56px)',
                            fontWeight: 800,
                            margin: '0 0 16px 0',
                            background: !isDark
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'none',
                            WebkitBackgroundClip: !isDark ? 'text' : 'unset',
                            WebkitTextFillColor: isDark ? '#ffffff' : 'transparent',
                            letterSpacing: '-0.02em',
                        }}>
                            Frequently Asked Questions
                        </h2>

                        <p style={{
                            // fontSize: '20px',
                             fontSize: 'clamp(16px, 3vw, 20px)',
                            color: theme.textMuted,
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}>
                            Everything you need to know about Domain Checker
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}>
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;

                            return (
                              <div
  key={index}
  style={{
    background: "linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 50%, #f3e8ff 100%)",
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    boxShadow: isOpen
      ? isDark
        ? `0 8px 24px rgba(129, 140, 248, 0.2)`
        : `0 8px 24px rgba(102, 126, 234, 0.15)`
      : 'none',
    borderRadius: '12px',        
    marginBottom: '16px',      
    pointerEvents: 'auto',       
  }}
>
  {/* Question */}
  <button
  onClick={() => toggleFAQ(index)}
  style={{
    width: '100%',
    // padding: '24px 28px',
    padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 28px)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    textAlign: 'left',
    outline: 'none',
    borderRadius: 0, 
  }}
  className="plain-button-override"
>
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
    <div
      style={{
        // width: '36px',
        // height: '36px',
        width: 'clamp(28px, 6vw, 36px)',       // ✅ Scales on mobile
height: 'clamp(28px, 6vw, 36px)',
        borderRadius: '50%', // Badge is still circular
        background: isDark ? '#818cf8' : '#667eea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        // fontSize: '16px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        flexShrink: 0,
      }}
    >
      {index + 1}
    </div>

    <span style={{ fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 600, color: theme.palette.text.primary }}>
      {faq.question}
    </span>
  </div>

  <div
    style={{
      color: isOpen ? theme.accent : theme.textMuted,
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.4s ease, color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <ChevronDown />
  </div>
</button>


  {/* Answer */}
  <div
    style={{
      maxHeight: isOpen ? '500px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.5s ease, padding 0.4s ease',
      padding: isOpen ? '16px 28px 24px 84px' : '0 28px 0 84px',
      color: theme.textMuted,
      fontSize: '16px',
      lineHeight: '1.7',
      pointerEvents: isOpen ? 'auto' : 'none',  // prevent accidental selection
    }}
  >
    {faq.answer}
  </div>
</div>

                            );
                        })}
                    </div>

                </div>
            </div>
        </Container>
    );
}