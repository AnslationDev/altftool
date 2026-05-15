import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const defaultForm = {
  appName: "",
  websiteUrl: "",
  businessType: "",
  companyName: "",
  contactEmail: "",
  country: "",
  dataTypes: [],
  cookies: false,
  cookieTypes: [],
  analytics: [],
  ads: [],
  thirdParties: [],
  gdpr: false,
  ccpa: false,
};

// Check if all required fields are filled
function isFormComplete(form) {
  const requiredFields = [
    form.appName?.trim(),
    form.websiteUrl?.trim(),
    form.businessType?.trim(),
    form.companyName?.trim(),
    form.contactEmail?.trim(),
    form.country?.trim(),
  ];
  
  const allRequiredPresent = requiredFields.every(field => field && field.length > 0);
  const hasDataTypeSelected = form.dataTypes.length > 0;
  
  // If cookies is enabled, need at least one cookie type
  const cookiesValid = !form.cookies || (form.cookies && form.cookieTypes.length > 0);
  
  return allRequiredPresent && hasDataTypeSelected && cookiesValid;
}

function getReadiness(form) {
  const checks = [
    { label: "Website/app name", done: Boolean(form.appName?.trim()) },
    { label: "Website URL", done: Boolean(form.websiteUrl?.trim()) },
    { label: "Company/Owner Name", done: Boolean(form.companyName?.trim()) },
    { label: "Contact email", done: Boolean(form.contactEmail?.trim()) },
    { label: "Country", done: Boolean(form.country?.trim()) },
    { label: "Business Type", done: Boolean(form.businessType?.trim()) },
    { label: "Data collection selected", done: form.dataTypes.length > 0 },
    { label: "Cookie choice configured", done: !form.cookies || form.cookieTypes.length > 0 },
    { label: "GDPR section (optional)", done: form.gdpr },
    { label: "CCPA section (optional)", done: form.ccpa },
  ];
  return {
    checks,
    score: Math.round((checks.filter((item) => item.done).length / checks.length) * 100),
  };
}

// Get business type specific wording based on actual business type
function getBusinessTypeSpecificContent(businessType, appName, websiteUrl, companyName) {
  const type = businessType.toLowerCase().trim();
  
  const contentMap = {
    ecommerce: {
      description: `an e-commerce platform that sells products and services online`,
      dataPurpose: `Process your orders, manage your account, provide customer service, process payments and refunds, and send you updates about your purchases and delivery status`,
      dataRetention: `as required for tax, legal, and warranty purposes, typically 7 years for transaction records`,
      dataSharing: `with payment gateways (like Stripe, PayPal), shipping carriers (like FedEx, UPS), fraud prevention services, and customer support tools`,
      examples: `product searches, order history, shipping addresses, payment methods`,
      specificClause: `When you make a purchase on ${websiteUrl}, we collect your shipping address, billing information, and order details to complete your transaction.`,
    },
    saas: {
      description: `a Software-as-a-Service platform that provides cloud-based solutions`,
      dataPurpose: `Provide, operate, and maintain our SaaS platform, manage your subscription, process recurring payments, provide customer support, track usage for billing, and improve our software`,
      dataRetention: `for the duration of your subscription and as required for legal and accounting purposes, typically up to 3 years after account closure`,
      dataSharing: `with payment processors, cloud hosting providers (like AWS, Google Cloud), customer support tools, and analytics platforms`,
      examples: `subscription tier, usage frequency, feature preferences, API calls`,
      specificClause: `As a ${businessType} provider, we track your usage patterns to ensure service reliability and accurate billing based on your subscription plan.`,
    },
    "mobile app": {
      description: `a mobile application available on iOS and Android platforms`,
      dataPurpose: `Provide app functionality, sync your data across devices, send push notifications, track app performance, manage in-app purchases, and improve user experience`,
      dataRetention: `while you have the app installed on your device and for a reasonable period (up to 30 days) after app deletion`,
      dataSharing: `with app store providers (Apple App Store, Google Play), crash reporting services (like Sentry), push notification services, and analytics platforms`,
      examples: `device ID, app version, screen views, in-app actions, crash logs`,
      specificClause: `Our ${appName} mobile app requires certain permissions (like camera, location, notifications) to provide full functionality. You can manage these permissions in your device settings.`,
    },
    blog: {
      description: `a content publishing platform and blog`,
      dataPurpose: `Publish and manage content, manage user comments, send newsletters, understand our readership, display relevant content, and improve our writing`,
      dataRetention: `indefinitely for published content you create, and as long as necessary for newsletter subscriptions and analytics`,
      dataSharing: `with commenting systems (like Disqus), email marketing services (like Mailchimp), analytics providers, and CDN services`,
      examples: `comments, reading preferences, subscription status, article interactions`,
      specificClause: `When you comment on our blog posts at ${websiteUrl}, we collect your name, email address, and comment content which may be publicly visible.`,
    },
    "ai tool": {
      description: `an artificial intelligence powered tool that processes user inputs to generate responses`,
      dataPurpose: `Process your inputs to generate AI responses, improve our AI models, maintain conversation history for context, provide personalized results, and conduct research`,
      dataRetention: `as long as needed to improve our AI models, typically 30-90 days for training data, or as required by applicable laws`,
      dataSharing: `with AI infrastructure providers (like OpenAI, Anthropic), content moderation services, analytics platforms, and research partners`,
      examples: `input prompts, generated outputs, feedback ratings, usage patterns`,
      specificClause: `Your conversations with our AI tool on ${websiteUrl} may be reviewed by human reviewers to improve our model's accuracy and safety.`,
    },
    startup: {
      description: `an early-stage company developing innovative products and services`,
      dataPurpose: `Develop and improve our product, communicate with early users, analyze usage patterns, scale our services, conduct user research, and secure funding`,
      dataRetention: `as needed for product development and business operations, typically while your account is active`,
      dataSharing: `with business partners, investors (for due diligence), analytics services, infrastructure providers, and user research tools`,
      examples: `feedback submissions, beta features usage, referral sources, feature requests`,
      specificClause: `As a startup, we value your feedback. The information you provide helps us shape ${appName} into a better product for all users.`,
    },
    website: {
      description: `a general website providing information and services`,
      dataPurpose: `Provide website functionality, analyze traffic patterns, respond to inquiries, improve user experience, serve content, and maintain security`,
      dataRetention: `as necessary to provide website services and for analytical purposes, typically 12-24 months for analytics data`,
      dataSharing: `with hosting providers, analytics services (like Google Analytics), content delivery networks (CDN), and security services`,
      examples: `page views, time on site, referral sources, browser type, device information`,
      specificClause: `When you visit ${websiteUrl}, we automatically collect standard web traffic information including your IP address, browser type, and pages visited.`,
    },
  };
  
  // Find matching content
  let matched = contentMap.ecommerce; // default fallback
  for (const [key, value] of Object.entries(contentMap)) {
    if (type.includes(key) || key === type) {
      matched = value;
      break;
    }
  }
  
  return matched;
}

// Generate UNIQUE policy based on all form data
function generateLocalPolicy(form) {
  const effectiveDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  // Get all form values (these are now guaranteed to be filled)
  const appName = form.appName;
  const websiteUrl = form.websiteUrl;
  const companyName = form.companyName;
  const contactEmail = form.contactEmail;
  const country = form.country;
  const businessType = form.businessType;
  
  // Get business-specific content
  const businessContent = getBusinessTypeSpecificContent(businessType, appName, websiteUrl, companyName);
  
  // Format data types list
  const dataTypesList = form.dataTypes.map(type => `- ${type}`).join('\n');
  
  // Format cookie types if enabled
  let cookieSection = '';
  if (form.cookies && form.cookieTypes.length > 0) {
    cookieSection = `Yes, ${appName} uses cookies and similar tracking technologies. The specific types of cookies we use include:\n\n`;
    form.cookieTypes.forEach(type => {
      const desc = {
        "Essential": `necessary for the operation of ${websiteUrl}`,
        "Analytics": `help us understand how users interact with ${appName}`,
        "Marketing": `track your browsing activity to show relevant advertisements`,
        "Preferences": `remember your settings and preferences on ${appName}`
      };
      cookieSection += `- **${type} Cookies:** ${desc[type] || `Used for ${type.toLowerCase()} purposes`}\n`;
    });
    cookieSection += `\nYou can control cookie settings through your browser preferences. However, disabling essential cookies may affect the functionality of ${websiteUrl}.\n`;
  } else {
    cookieSection = `No, ${appName} does not currently use cookies or similar tracking technologies on ${websiteUrl}. We may use cookie-free alternatives for essential functionality.\n`;
  }
  
  // Format analytics section
  let analyticsSection = '';
  if (form.analytics.length > 0) {
    analyticsSection = `${appName} uses the following analytics tools to understand how users interact with our ${businessType}:\n\n`;
    form.analytics.forEach(tool => {
      analyticsSection += `- ${tool}\n`;
    });
    analyticsSection += `\nThese tools collect information such as your IP address, browser type, pages visited on ${websiteUrl}, time spent, and referral sources. This data helps us improve ${appName} and user experience.\n`;
  } else {
    analyticsSection = `${appName} may collect basic, anonymized usage metrics internally to monitor the performance and reliability of our ${businessType}. We do not currently use third-party analytics services.\n`;
  }
  
  // Format ads section
  let adsSection = '';
  if (form.ads.length > 0) {
    adsSection = `## Advertising and Monetization\n\n${appName} uses the following advertising and monetization methods to support our ${businessType}:\n\n`;
    form.ads.forEach(ad => {
      adsSection += `- ${ad}\n`;
    });
    adsSection += `\nThese advertising partners may use cookies and similar technologies to collect data about your browsing activities across ${websiteUrl} and other websites over time for ad personalization. You can opt out of personalized advertising through your device settings.\n\n`;
  }
  
  // Format third party section
  let thirdPartySection = '';
  if (form.thirdParties.length > 0) {
    thirdPartySection = `## Third-Party Services and Data Sharing\n\n${companyName} shares your information with the following third-party service providers to operate ${appName}:\n\n`;
    form.thirdParties.forEach(service => {
      thirdPartySection += `- ${service}\n`;
    });
    thirdPartySection += `\nThese third parties have access to your personal information only to perform specific tasks for ${websiteUrl} and are contractually obligated to protect your data. They may not use your information for any other purpose.\n\n`;
    thirdPartySection += `We also share your information ${businessContent.dataSharing} as necessary to provide our services.\n\n`;
  }
  
  // Build the complete UNIQUE policy
  let policy = `# Privacy Policy for ${appName}

**Effective Date:** ${effectiveDate}
**Company:** ${companyName}
**Website:** ${websiteUrl}
**Business Type:** ${businessType}
**Country of Operation:** ${country}

## 1. Introduction & Overview

Welcome to ${appName} ("we," "our," or "us"). This Privacy Policy explains how ${companyName} collects, uses, discloses, and safeguards your information when you access or use our **${businessType}** at ${websiteUrl}. ${appName} is ${businessContent.description}.

By using ${websiteUrl}, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not use ${appName}.

**${businessContent.specificClause}**

## 2. Information We Collect at ${websiteUrl}

${companyName} collects several different types of information for various purposes to provide and improve our service to you.

### Personal Data You Voluntarily Provide to ${appName}:

${dataTypesList}

### Automatically Collected Information from ${websiteUrl}:

- Device information (browser type, operating system, device identifiers)
- Usage data (pages visited on ${websiteUrl}, time spent, features used)
- IP address and approximate location data
- ${businessContent.examples}

## 3. How ${companyName} Uses Your Information

${appName} uses the collected data for various purposes:

- ${businessContent.dataPurpose}
- Improve, personalize, and develop our ${businessType}
- Understand and analyze how you use ${websiteUrl}
- Communicate with you about updates, security alerts, and support messages
- Process transactions and manage your account on ${appName}
- Detect, prevent, and address technical or security issues
- Comply with legal obligations and enforce our terms of service

## 4. Legal Basis for Processing (for GDPR purposes)

${companyName} processes your personal information based on one or more of the following legal grounds:
- **Contract performance:** Processing necessary to provide ${appName} to you
- **Legitimate interests:** Improving our services at ${websiteUrl}, preventing fraud, and marketing ${appName}
- **Legal compliance:** When required by applicable laws in ${country}
- **Consent:** When you have given clear consent for specific processing activities

## 5. Cookies and Tracking Technologies on ${websiteUrl}

${cookieSection}

## 6. Analytics and Performance Monitoring for ${appName}

${analyticsSection}

${adsSection ? adsSection : ''}
${thirdPartySection ? thirdPartySection : ''}

## ${form.ads.length + form.thirdParties.length + 7}. Data Security and Retention at ${companyName}

${companyName} implements appropriate technical and organizational security measures to protect your personal information, including encryption, access controls, and regular security assessments. However, no method of transmission over the Internet is 100% secure.

We retain your personal information ${businessContent.dataRetention}. We retain this data at ${websiteUrl} for the time necessary to fulfill the purposes outlined in this privacy policy.

## ${form.ads.length + form.thirdParties.length + 8}. International Data Transfers

Your information collected at ${websiteUrl} may be transferred to and processed in countries other than your country of residence. ${companyName} ensures appropriate safeguards are in place for such transfers.

${form.gdpr ? `
## ${form.ads.length + form.thirdParties.length + 9}. Your GDPR Rights (EEA/UK Users)

If you are a resident of the European Economic Area (EEA) or United Kingdom (UK) using ${websiteUrl}, you have the following data protection rights under GDPR:

- **Right to Access** - Request a copy of your personal data from ${appName}
- **Right to Rectification** - Correct inaccurate or incomplete data
- **Right to Erasure** - Request deletion of your personal data from ${companyName}
- **Right to Restrict Processing** - Limit how ${appName} uses your data
- **Right to Data Portability** - Receive your data in a machine-readable format
- **Right to Object** - Object to processing based on legitimate interests
- **Right to Withdraw Consent** - Withdraw consent at any time

**How to Exercise Your Rights with ${companyName}:**  
Contact us at ${contactEmail}. We will respond within 30 days.
` : ''}

${form.ccpa ? `
## ${form.ads.length + form.thirdParties.length + (form.gdpr ? 10 : 9)}. Your CCPA Rights (California Users)

If you are a California resident using ${websiteUrl}, the California Consumer Privacy Act (CCPA) provides you with specific rights:

**Your CCPA Rights with ${appName}:**

1. **Right to Know** - Request disclosure of personal information ${companyName} collected
2. **Right to Delete** - Request deletion of personal information
3. **Right to Opt-Out** - Opt-out of sale of your personal information (${companyName} does not sell your data)
4. **Right to Non-Discrimination** - Equal service and price

**How to Submit a Request to ${companyName}:**  
Contact us at ${contactEmail}. We will respond within 45 days.
` : ''}

## ${form.ads.length + form.thirdParties.length + (form.gdpr ? (form.ccpa ? 11 : 10) : (form.ccpa ? 10 : 9))}. Children's Privacy

${appName} at ${websiteUrl} is not intended for children under the age of 13. ${companyName} does not knowingly collect personal information from anyone under 13.

## ${form.ads.length + form.thirdParties.length + (form.gdpr ? (form.ccpa ? 12 : 11) : (form.ccpa ? 11 : 10))}. Changes to This Privacy Policy

${companyName} may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on ${websiteUrl} and updating the "Effective Date".

## ${form.ads.length + form.thirdParties.length + (form.gdpr ? (form.ccpa ? 13 : 12) : (form.ccpa ? 12 : 11))}. Contact ${companyName}

If you have any questions about this Privacy Policy or ${appName}, please contact us at:

**${companyName}**  
Email: ${contactEmail}  
Country: ${country}  
Website: ${websiteUrl}

---

*This Privacy Policy was generated specifically for ${appName} (${businessType}) at ${websiteUrl} on ${effectiveDate}. Copyright © ${new Date().getFullYear()} ${companyName}.*`;

  return policy;
}

export function usePolicyGenerator() {
  const [form, setForm] = useState(defaultForm);
  const [policy, setPolicy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const debounceRef = useRef(null);

  const isComplete = useMemo(() => isFormComplete(form), [form]);

  // Save form to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("privacy_policy_generator_form", JSON.stringify(form));
    }
  }, [form]);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const toggleList = useCallback((field, value) => {
    setForm((current) => {
      const next = current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value];
      return { ...current, [field]: next };
    });
  }, []);

  // Generate policy ONLY when form is complete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isComplete) {
      setPolicy("");
      setShowPolicy(false);
      setIsGenerating(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsGenerating(true);
      setError(null);
      setShowPolicy(true);
      
      try {
        const generatedPolicy = generateLocalPolicy(form);
        setPolicy(generatedPolicy);
      } catch (err) {
        setError("Failed to generate policy. Please try again.");
        console.error("Policy generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, isComplete]);

  const readiness = useMemo(() => getReadiness(form), [form]);

  const stats = useMemo(() => {
    if (!policy) return { words: 0, sections: 0, minutes: 0 };
    const words = policy.trim().split(/\s+/).filter(Boolean).length;
    const sections = (policy.match(/^## \d+\./gm) || []).length;
    return {
      words,
      sections,
      minutes: Math.max(1, Math.ceil(words / 220)),
    };
  }, [policy]);

  return {
    form,
    updateField,
    toggleList,
    policy,
    isGenerating,
    error,
    readiness,
    stats,
    copied,
    setCopied,
    showPolicy,
    isComplete,
  };
}