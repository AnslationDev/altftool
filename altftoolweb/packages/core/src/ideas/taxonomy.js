/* ============================================================
   AltF Ideas — Idea DNA taxonomy
   Idea = Vertical x Buyer x Job x Mechanism x Wedge x Model
   Every axis carries score base-rates and copy fragments so the
   generator produces prose that reads authored, not templated.
   ============================================================ */

/* ---------- VERTICALS (60) ----------
   tam  : USD total addressable market for software in this vertical
   cagr : category growth
   d/m/o: base rates for demand / moat / openField (0-100)
   soft : how software-mature the vertical is (low = more open field)
   tags : job families that make sense here                            */
export const VERTICALS = [
  { name: 'Healthcare',        slug: 'healthcare',        tam: 86e8, cagr: 19, d: 84, m: 78, o: 54, buyers: ['Clinic admin','Practice owner','Ops manager','Compliance lead','Department head'] },
  { name: 'Dental',            slug: 'dental',            tam: 42e8, cagr: 14, d: 78, m: 62, o: 71, buyers: ['Practice owner','Office manager','Clinic admin'] },
  { name: 'Veterinary',        slug: 'veterinary',        tam: 18e8, cagr: 16, d: 70, m: 60, o: 82, buyers: ['Practice owner','Office manager','Technician'] },
  { name: 'Life sciences',     slug: 'life-sciences',     tam: 54e8, cagr: 18, d: 68, m: 86, o: 79, buyers: ['Study lead','Lab manager','Compliance lead'] },
  { name: 'Mental health',     slug: 'mental-health',     tam: 26e8, cagr: 22, d: 74, m: 58, o: 76, buyers: ['Solo practitioner','Clinic admin','Program director'] },
  { name: 'Home care',         slug: 'home-care',         tam: 21e8, cagr: 20, d: 72, m: 64, o: 84, buyers: ['Agency owner','Scheduler','Compliance lead'] },
  { name: 'Legal',             slug: 'legal',             tam: 28e8, cagr: 12, d: 71, m: 79, o: 68, buyers: ['Solo practitioner','Partner','Paralegal lead','Ops manager'] },
  { name: 'Accounting',        slug: 'accounting',        tam: 24e8, cagr: 11, d: 73, m: 66, o: 62, buyers: ['Firm owner','Partner','Ops manager'] },
  { name: 'Insurance',         slug: 'insurance',         tam: 38e8, cagr: 13, d: 69, m: 81, o: 66, buyers: ['Agency owner','Underwriter','Claims lead','Broker'] },
  { name: 'Fintech',           slug: 'fintech',           tam: 62e8, cagr: 17, d: 76, m: 72, o: 41, buyers: ['CFO','Ops manager','Compliance lead'] },
  { name: 'Lending',           slug: 'lending',           tam: 31e8, cagr: 12, d: 66, m: 77, o: 63, buyers: ['Loan officer','Underwriter','Ops manager'] },
  { name: 'Wealth management', slug: 'wealth-management', tam: 22e8, cagr: 14, d: 63, m: 71, o: 69, buyers: ['Advisor','Firm owner','Compliance lead'] },
  { name: 'Construction',      slug: 'construction',      tam: 24e8, cagr: 20, d: 77, m: 74, o: 74, buyers: ['Project manager','Ops manager','Owner-operator','Estimator'] },
  { name: 'Architecture',      slug: 'architecture',      tam: 9e8,  cagr: 15, d: 62, m: 68, o: 81, buyers: ['Principal','Project architect','Ops manager'] },
  { name: 'Real estate',       slug: 'real-estate',       tam: 34e8, cagr: 13, d: 74, m: 54, o: 52, buyers: ['Broker','Property manager','Owner-operator'] },
  { name: 'Property management',slug:'property-management',tam: 19e8, cagr: 15, d: 75, m: 61, o: 67, buyers: ['Property manager','Owner-operator','Maintenance lead'] },
  { name: 'Facilities',        slug: 'facilities',        tam: 14e8, cagr: 14, d: 64, m: 66, o: 80, buyers: ['Facilities director','Ops manager','Maintenance lead'] },
  { name: 'Logistics',         slug: 'logistics',         tam: 31e8, cagr: 15, d: 79, m: 72, o: 70, buyers: ['Fleet owner','Dispatcher','Ops manager','Warehouse lead'] },
  { name: 'Freight brokerage', slug: 'freight-brokerage', tam: 17e8, cagr: 13, d: 72, m: 69, o: 76, buyers: ['Broker','Ops manager','Dispatcher'] },
  { name: 'Last-mile delivery',slug: 'last-mile-delivery',tam: 23e8, cagr: 21, d: 76, m: 63, o: 58, buyers: ['Ops manager','Dispatcher','Owner-operator'] },
  { name: 'Warehousing',       slug: 'warehousing',       tam: 20e8, cagr: 16, d: 70, m: 70, o: 72, buyers: ['Warehouse lead','Ops manager','Inventory planner'] },
  { name: 'Maritime',          slug: 'maritime',          tam: 4e8,  cagr: 13, d: 54, m: 71, o: 93, buyers: ['Surveyor','Fleet owner','Ops manager'] },
  { name: 'Aviation',          slug: 'aviation',          tam: 12e8, cagr: 12, d: 58, m: 82, o: 85, buyers: ['Ops manager','Maintenance lead','Compliance lead'] },
  { name: 'Rail',              slug: 'rail',              tam: 7e8,  cagr: 10, d: 51, m: 84, o: 91, buyers: ['Ops manager','Maintenance lead','Compliance lead'] },
  { name: 'Manufacturing',     slug: 'manufacturing',     tam: 29e8, cagr: 16, d: 71, m: 76, o: 77, buyers: ['Plant supervisor','Ops manager','Quality lead','Maintenance lead'] },
  { name: 'Industrial services',slug:'industrial-services',tam: 13e8, cagr: 14, d: 63, m: 73, o: 86, buyers: ['Ops manager','Field supervisor','Owner-operator'] },
  { name: 'Energy',            slug: 'energy',            tam: 33e8, cagr: 18, d: 68, m: 83, o: 74, buyers: ['Ops manager','Compliance lead','Asset manager'] },
  { name: 'Solar',             slug: 'solar',             tam: 16e8, cagr: 24, d: 72, m: 62, o: 69, buyers: ['Owner-operator','Project manager','Ops manager'] },
  { name: 'Utilities',         slug: 'utilities',         tam: 25e8, cagr: 11, d: 61, m: 87, o: 82, buyers: ['Ops manager','Compliance lead','Field supervisor'] },
  { name: 'Waste management',  slug: 'waste-management',  tam: 16e8, cagr: 14, d: 64, m: 77, o: 85, buyers: ['Ops manager','Fleet owner','Route planner'] },
  { name: 'Agriculture',       slug: 'agriculture',       tam: 22e8, cagr: 22, d: 61, m: 79, o: 88, buyers: ['Grower','Co-op manager','Agronomist','Owner-operator'] },
  { name: 'Food production',   slug: 'food-production',   tam: 18e8, cagr: 15, d: 66, m: 71, o: 79, buyers: ['Plant supervisor','Quality lead','Ops manager'] },
  { name: 'Hospitality',       slug: 'hospitality',       tam: 14e8, cagr: 12, d: 77, m: 52, o: 61, buyers: ['Owner-operator','General manager','Ops manager'] },
  { name: 'Restaurants',       slug: 'restaurants',       tam: 17e8, cagr: 13, d: 80, m: 48, o: 55, buyers: ['Owner-operator','General manager','Kitchen lead'] },
  { name: 'Retail',            slug: 'retail',            tam: 41e8, cagr: 12, d: 78, m: 51, o: 44, buyers: ['Store manager','Owner-operator','Merchandiser','Ops manager'] },
  { name: 'E-commerce',        slug: 'e-commerce',        tam: 52e8, cagr: 16, d: 82, m: 46, o: 32, buyers: ['Owner-operator','Ops manager','Marketing lead'] },
  { name: 'Wholesale',         slug: 'wholesale',         tam: 19e8, cagr: 11, d: 65, m: 64, o: 78, buyers: ['Sales lead','Ops manager','Inventory planner'] },
  { name: 'Automotive',        slug: 'automotive',        tam: 27e8, cagr: 13, d: 72, m: 65, o: 68, buyers: ['Service manager','Owner-operator','Parts manager'] },
  { name: 'Auto repair',       slug: 'auto-repair',       tam: 11e8, cagr: 12, d: 74, m: 53, o: 73, buyers: ['Owner-operator','Service manager','Technician'] },
  { name: 'Equipment rental',  slug: 'equipment-rental',  tam: 9e8,  cagr: 14, d: 66, m: 68, o: 84, buyers: ['Owner-operator','Ops manager','Dispatcher'] },
  { name: 'Education',         slug: 'education',         tam: 30e8, cagr: 13, d: 69, m: 62, o: 66, buyers: ['Registrar','Department head','Program director','Ops manager'] },
  { name: 'Trade schools',     slug: 'trade-schools',     tam: 6e8,  cagr: 15, d: 60, m: 65, o: 87, buyers: ['Registrar','Program director','Owner-operator'] },
  { name: 'Childcare',         slug: 'childcare',         tam: 8e8,  cagr: 17, d: 71, m: 55, o: 81, buyers: ['Owner-operator','Program director','Office manager'] },
  { name: 'Nonprofits',        slug: 'nonprofits',        tam: 12e8, cagr: 12, d: 63, m: 57, o: 76, buyers: ['Program director','Development lead','Ops manager'] },
  { name: 'Government',        slug: 'government',        tam: 44e8, cagr: 10, d: 62, m: 88, o: 83, buyers: ['Program director','Compliance lead','Ops manager'] },
  { name: 'Public safety',     slug: 'public-safety',     tam: 15e8, cagr: 14, d: 66, m: 85, o: 86, buyers: ['Department head','Ops manager','Compliance lead'] },
  { name: 'Recruiting',        slug: 'recruiting',        tam: 23e8, cagr: 15, d: 75, m: 49, o: 47, buyers: ['Agency owner','Recruiter','Ops manager'] },
  { name: 'Staffing',          slug: 'staffing',          tam: 18e8, cagr: 14, d: 72, m: 58, o: 64, buyers: ['Agency owner','Scheduler','Ops manager'] },
  { name: 'Professional services',slug:'professional-services',tam: 26e8, cagr: 13, d: 70, m: 56, o: 59, buyers: ['Partner','Ops manager','Project manager'] },
  { name: 'Marketing agencies',slug: 'marketing-agencies',tam: 21e8, cagr: 14, d: 74, m: 44, o: 38, buyers: ['Agency owner','Account lead','Ops manager'] },
  { name: 'Franchising',       slug: 'franchising',       tam: 17e8, cagr: 17, d: 70, m: 74, o: 82, buyers: ['Franchisee','Franchisor ops','Field supervisor'] },
  { name: 'Fitness',           slug: 'fitness',           tam: 10e8, cagr: 15, d: 73, m: 45, o: 57, buyers: ['Owner-operator','General manager','Coach'] },
  { name: 'Salons & spas',     slug: 'salons-spas',       tam: 7e8,  cagr: 13, d: 71, m: 42, o: 66, buyers: ['Owner-operator','Office manager'] },
  { name: 'Events',            slug: 'events',            tam: 13e8, cagr: 16, d: 68, m: 50, o: 63, buyers: ['Event producer','Owner-operator','Ops manager'] },
  { name: 'Travel',            slug: 'travel',            tam: 29e8, cagr: 15, d: 76, m: 53, o: 45, buyers: ['Agency owner','Ops manager','Account lead'] },
  { name: 'Funeral services',  slug: 'funeral-services',  tam: 3e8,  cagr: 8,  d: 51, m: 80, o: 95, buyers: ['Owner-operator','Office manager'] },
  { name: 'Pest control',      slug: 'pest-control',      tam: 5e8,  cagr: 13, d: 62, m: 56, o: 83, buyers: ['Owner-operator','Dispatcher','Field supervisor'] },
  { name: 'Landscaping',       slug: 'landscaping',       tam: 6e8,  cagr: 14, d: 65, m: 47, o: 79, buyers: ['Owner-operator','Field supervisor','Estimator'] },
  { name: 'HVAC & plumbing',   slug: 'hvac-plumbing',     tam: 15e8, cagr: 16, d: 76, m: 58, o: 65, buyers: ['Owner-operator','Dispatcher','Field supervisor'] },
  { name: 'Security services', slug: 'security-services', tam: 11e8, cagr: 15, d: 64, m: 69, o: 81, buyers: ['Ops manager','Scheduler','Field supervisor'] },
  { name: 'Telecom',           slug: 'telecom',           tam: 36e8, cagr: 11, d: 63, m: 81, o: 72, buyers: ['Ops manager','Field supervisor','Compliance lead'] },
];

/* ---------- JOBS (40) ----------
   The unit of work being replaced. Carries the pain language.
   mech: mechanisms that credibly do this job                        */
export const JOBS = [
  { name: 'intake & triage',        noun: 'Intake Triage',        pain: 'the front-desk queue that swallows {N} hours a week', mech: ['voice','extract','classify','agent'] },
  { name: 'scheduling',             noun: 'Scheduling',           pain: 'a calendar rebuilt by hand every time one job slips',  mech: ['optimise','agent','forecast','workflow'] },
  { name: 'dispatch',               noun: 'Dispatch',             pain: 'routing decisions made from memory at 6am',            mech: ['optimise','forecast','workflow'] },
  { name: 'quoting & estimating',   noun: 'Quote Builder',        pain: 'quotes that take three days and still miss margin',    mech: ['extract','forecast','workflow','vision'] },
  { name: 'invoicing',              noun: 'Invoice Engine',       pain: 'invoices assembled from four systems by hand',         mech: ['extract','workflow','reconcile'] },
  { name: 'collections',            noun: 'Collections Chaser',   pain: 'receivables aging past 90 days because nobody chased', mech: ['agent','workflow','forecast'] },
  { name: 'reconciliation',         noun: 'Reconciler',           pain: 'two ledgers that never agree and nobody can say why',  mech: ['reconcile','extract','anomaly'] },
  { name: 'claims & appeals',       noun: 'Appeal Drafter',       pain: 'denials abandoned because appealing costs more than the claim', mech: ['rag','extract','workflow'] },
  { name: 'compliance audit',       noun: 'Compliance Auditor',   pain: 'an audit prepared in a two-week panic every year',      mech: ['rag','vision','extract','workflow'] },
  { name: 'inspection',             noun: 'Inspection Assistant', pain: 'inspections written up twice — once on paper, once at night', mech: ['vision','voice','extract'] },
  { name: 'shift handover',         noun: 'Handover Recorder',    pain: 'a whiteboard that loses half of what the last crew knew', mech: ['voice','extract','workflow'] },
  { name: 'onboarding',             noun: 'Onboarding Flow',      pain: 'a 40-step checklist living in one person’s head',      mech: ['workflow','agent','extract'] },
  { name: 'training & competency',  noun: 'Competency Tracker',   pain: 'certifications that expire before anyone notices',      mech: ['workflow','forecast','rag'] },
  { name: 'document review',        noun: 'Document Reviewer',    pain: 'a 900-page document read by someone billing $300 an hour', mech: ['rag','extract','longctx'] },
  { name: 'contract analysis',      noun: 'Contract Analyser',    pain: 'renewal terms nobody re-read before signing',           mech: ['longctx','rag','extract'] },
  { name: 'permit & licence tracking',noun:'Permit Tracker',      pain: 'twelve portals refreshed by hand every morning',        mech: ['scrape','workflow','anomaly'] },
  { name: 'inventory planning',     noun: 'Inventory Planner',    pain: 'stockouts on the fast movers and cash tied up in the slow ones', mech: ['forecast','optimise','anomaly'] },
  { name: 'demand forecasting',     noun: 'Demand Forecaster',    pain: 'next month planned from last month with a gut adjustment', mech: ['forecast','anomaly'] },
  { name: 'pricing',                noun: 'Pricing Engine',       pain: 'a price list last revised when costs were 30% lower',   mech: ['forecast','extract','optimise'] },
  { name: 'margin monitoring',      noun: 'Margin Watch',         pain: 'discovering a product went underwater a quarter late',  mech: ['anomaly','reconcile','forecast'] },
  { name: 'route planning',         noun: 'Route Optimiser',      pain: 'routes cut once a year and patched ever since',         mech: ['optimise','forecast'] },
  { name: 'field reporting',        noun: 'Field Reporter',       pain: 'reports typed up in a truck cab after a ten-hour day',  mech: ['voice','vision','extract'] },
  { name: 'quality control',        noun: 'Quality Inspector',    pain: 'defects caught by the customer instead of the line',    mech: ['vision','anomaly','forecast'] },
  { name: 'maintenance planning',   noun: 'Maintenance Planner',  pain: 'maintenance done on a calendar rather than on condition', mech: ['forecast','anomaly','optimise'] },
  { name: 'incident reporting',     noun: 'Incident Recorder',    pain: 'incidents written up days later from memory',           mech: ['voice','extract','workflow'] },
  { name: 'customer support',       noun: 'Support Agent',        pain: 'the same forty questions answered by a human every day', mech: ['agent','rag','classify'] },
  { name: 'lead qualification',     noun: 'Lead Qualifier',       pain: 'a pipeline where nobody knows which half is real',      mech: ['classify','agent','forecast'] },
  { name: 'proposal writing',       noun: 'Proposal Builder',     pain: 'proposals rebuilt from scratch that are 80% identical', mech: ['rag','longctx','workflow'] },
  { name: 'RFP response',           noun: 'RFP Responder',        pain: 'a 200-question RFP answered by six people over a week', mech: ['rag','longctx','extract'] },
  { name: 'vendor management',      noun: 'Vendor Monitor',       pain: 'vendor performance measured only when something breaks', mech: ['anomaly','reconcile','workflow'] },
  { name: 'expense review',         noun: 'Expense Reviewer',     pain: 'expenses approved without anyone actually reading them', mech: ['extract','anomaly','classify'] },
  { name: 'payroll verification',   noun: 'Payroll Verifier',     pain: 'payroll errors found by the employee, not the system',  mech: ['reconcile','anomaly','extract'] },
  { name: 'grant & funding tracking',noun:'Grant Tracker',        pain: 'reporting deadlines discovered the week they are due',  mech: ['workflow','extract','rag'] },
  { name: 'asset tracking',         noun: 'Asset Tracker',        pain: 'equipment located by asking around',                    mech: ['workflow','anomaly','vision'] },
  { name: 'warranty & returns',     noun: 'Warranty Handler',     pain: 'warranty claims processed on a spreadsheet and a hope',  mech: ['extract','classify','workflow'] },
  { name: 'renewal management',     noun: 'Renewal Manager',      pain: 'renewals that lapse because a date sat in a spreadsheet', mech: ['workflow','forecast','anomaly'] },
  { name: 'site selection',         noun: 'Site Scorer',          pain: 'location decisions made on instinct and a drive-by',    mech: ['forecast','geo','optimise'] },
  { name: 'risk assessment',        noun: 'Risk Scorer',          pain: 'risk scored by whoever is free that afternoon',         mech: ['forecast','rag','anomaly'] },
  { name: 'reporting & analytics',  noun: 'Reporting Layer',      pain: 'a monthly report rebuilt by hand in a spreadsheet',     mech: ['reconcile','extract','forecast'] },
  { name: 'knowledge capture',      noun: 'Knowledge Base',       pain: 'twenty years of know-how walking out at retirement',    mech: ['rag','voice','extract'] },
];

/* ---------- MECHANISMS (14 keys, richly described) ----------
   feas : feasibility base (higher = easier to build)
   moat : defensibility contribution
   time : timing / why-now strength                                  */
/* `name` must be a COUNTABLE noun phrase — the prose frames render it as
   "a {name} that handles {job}", so mass nouns like "classification" or
   "retrieval over a private corpus" read broken across the whole corpus.
   `label` is the short form used in generated titles. */
export const MECHANISMS = {
  voice:    { name: 'voice agent',           label: 'Voice',        feas: 68, moat: 58, time: 88, why: 'real-time speech models fell below $0.06 a minute in 2025' },
  vision:   { name: 'vision model',          label: 'Vision',       feas: 66, moat: 64, time: 84, why: 'multimodal models now read a photo of a worksite without custom training' },
  extract:  { name: 'document parser',       label: 'Extraction',   feas: 82, moat: 54, time: 72, why: 'document parsing stopped needing per-layout templates' },
  rag:      { name: 'retrieval engine',      label: 'Retrieval',    feas: 71, moat: 78, time: 79, why: 'retrieval over private documents became cheap enough to run per query' },
  longctx:  { name: 'long-context reviewer', label: 'Long context', feas: 64, moat: 71, time: 87, why: 'million-token context windows made whole-document reasoning possible in one pass' },
  forecast: { name: 'forecasting model',     label: 'Forecasting',  feas: 61, moat: 76, time: 64, why: 'forecasting that used to need a data team now runs on off-the-shelf models' },
  optimise: { name: 'optimisation engine',   label: 'Optimisation', feas: 54, moat: 82, time: 61, why: 'solver capacity that once needed a research budget now runs on commodity hardware' },
  anomaly:  { name: 'anomaly detector',      label: 'Anomaly',      feas: 73, moat: 68, time: 66, why: 'streaming detection became practical without a dedicated data platform' },
  reconcile:{ name: 'reconciliation engine', label: 'Reconciliation',feas: 76, moat: 70, time: 63, why: 'systems that never talked now expose APIs by default' },
  classify: { name: 'classifier',            label: 'Classification',feas: 86, moat: 46, time: 58, why: 'classification quality crossed the threshold where a human stops double-checking' },
  agent:    { name: 'autonomous agent',      label: 'Agent',        feas: 59, moat: 66, time: 91, why: 'tool-using agents became reliable enough to close a loop without supervision' },
  workflow: { name: 'workflow engine',       label: 'Workflow',     feas: 88, moat: 52, time: 55, why: 'connectors exist for systems that were closed five years ago' },
  scrape:   { name: 'change monitor',        label: 'Monitoring',   feas: 84, moat: 44, time: 57, why: 'monitoring infrastructure became a commodity' },
  geo:      { name: 'geospatial model',      label: 'Geospatial',   feas: 57, moat: 80, time: 74, why: 'satellite and census-linked data became licensable at startup prices' },
};

/* ---------- WEDGES (16) ---------- */
export const WEDGES = [
  { name: 'replace the spreadsheet', phrase: 'replacing the spreadsheet that currently holds it together', open: 8 },
  { name: 'kill the phone queue',    phrase: 'taking the phone queue off a human entirely',                open: 4 },
  { name: 'undercut the enterprise seat', phrase: 'at a tenth of what the enterprise suite charges',       open: -6 },
  { name: 'unbundle the suite',      phrase: 'unbundling the one module people actually use',              open: -4 },
  { name: 'serve the abandoned tail',phrase: 'going after the low-value tail everyone else skips',         open: 12 },
  { name: 'give back the evening',   phrase: 'so the work stops following people home',                    open: 6 },
  { name: 'catch it before the rework', phrase: 'catching the error before it becomes a change order',     open: 5 },
  { name: 'pre-empt the inspection', phrase: 'finding what the inspector would find, first',               open: 9 },
  { name: 'find the buried liability', phrase: 'surfacing the exposure nobody has priced',                 open: 11 },
  { name: 'cut the headcount, not the service', phrase: 'holding service constant on a smaller team',      open: 3 },
  { name: 'make the tacit explicit', phrase: 'writing down what only one person knows',                    open: 10 },
  { name: 'close the loop overnight',phrase: 'closing the loop while everyone is asleep',                  open: 7 },
  { name: 'price it per outcome',    phrase: 'charging only when it actually works',                       open: 2 },
  { name: 'start where the data already is', phrase: 'starting from data the business already produces',   open: 1 },
  { name: 'shrink the sales cycle',  phrase: 'proving value before anyone signs anything',                 open: 5 },
  { name: 'serve the single operator', phrase: 'built for one person, not a department',                   open: 13 },
];

/* ---------- BUSINESS MODELS (12) ---------- */
export const MODELS = [
  { name: 'Seat SaaS',        mon: 66, acv: [1200, 24000],  ttfr: 45 },
  { name: 'Flat SaaS',        mon: 58, acv: [900, 9600],    ttfr: 30 },
  { name: 'Usage-based',      mon: 72, acv: [2400, 48000],  ttfr: 40 },
  { name: 'Per-outcome',      mon: 84, acv: [4500, 96000],  ttfr: 70 },
  { name: 'Take-rate',        mon: 88, acv: [6000, 120000], ttfr: 55 },
  { name: 'Per-location',     mon: 74, acv: [1800, 36000],  ttfr: 50 },
  { name: 'Per-vehicle',      mon: 79, acv: [3600, 96000],  ttfr: 65 },
  { name: 'Site licence',     mon: 76, acv: [9000, 90000],  ttfr: 90 },
  { name: 'Per-project',      mon: 71, acv: [3000, 54000],  ttfr: 50 },
  { name: 'Per-matter',       mon: 77, acv: [2400, 42000],  ttfr: 55 },
  { name: 'Managed service',  mon: 81, acv: [12000, 180000],ttfr: 75 },
  { name: 'Data subscription',mon: 69, acv: [4800, 72000],  ttfr: 60 },
];

/* ---------- Title patterns ---------- */
export const TITLE_PATTERNS = [
  ({ mech, job, vert })        => `${mech} ${job} for ${vert}`,
  ({ job, vert, buyer })       => `${job} for ${vert} ${buyer}`,
  ({ mech, job, buyer })       => `${mech}-Powered ${job} for ${buyer}`,
  ({ job, vert })              => `${vert} ${job}`,
  ({ mech, job, vert })        => `${job} for ${vert}, Run by ${mech}`,
  ({ job, buyer })             => `${job} Built for ${buyer}`,
  ({ mech, vert, job })        => `${vert} ${job} on ${mech}`,
  ({ job, vert })              => `Automated ${job} for ${vert}`,
];

export const BUYER_PLURAL = {
  'Clinic admin': 'Clinic Admins', 'Practice owner': 'Practice Owners', 'Ops manager': 'Ops Teams',
  'Compliance lead': 'Compliance Leads', 'Department head': 'Department Heads', 'Office manager': 'Office Managers',
  'Technician': 'Technicians', 'Study lead': 'Study Leads', 'Lab manager': 'Lab Managers',
  'Solo practitioner': 'Solo Practitioners', 'Program director': 'Program Directors', 'Agency owner': 'Agency Owners',
  'Scheduler': 'Schedulers', 'Partner': 'Partners', 'Paralegal lead': 'Paralegal Teams', 'Firm owner': 'Firm Owners',
  'Underwriter': 'Underwriters', 'Claims lead': 'Claims Teams', 'Broker': 'Brokers', 'CFO': 'CFOs',
  'Loan officer': 'Loan Officers', 'Advisor': 'Advisors', 'Project manager': 'Project Managers',
  'Owner-operator': 'Owner-Operators', 'Estimator': 'Estimators', 'Principal': 'Principals',
  'Project architect': 'Project Architects', 'Property manager': 'Property Managers', 'Maintenance lead': 'Maintenance Leads',
  'Facilities director': 'Facilities Directors', 'Fleet owner': 'Fleet Owners', 'Dispatcher': 'Dispatchers',
  'Warehouse lead': 'Warehouse Teams', 'Inventory planner': 'Inventory Planners', 'Surveyor': 'Surveyors',
  'Plant supervisor': 'Plant Supervisors', 'Quality lead': 'Quality Teams', 'Field supervisor': 'Field Supervisors',
  'Asset manager': 'Asset Managers', 'Route planner': 'Route Planners', 'Grower': 'Growers',
  'Co-op manager': 'Co-op Managers', 'Agronomist': 'Agronomists', 'General manager': 'General Managers',
  'Kitchen lead': 'Kitchen Teams', 'Store manager': 'Store Managers', 'Merchandiser': 'Merchandisers',
  'Marketing lead': 'Marketing Leads', 'Sales lead': 'Sales Teams', 'Service manager': 'Service Managers',
  'Parts manager': 'Parts Managers', 'Registrar': 'Registrars', 'Development lead': 'Development Leads',
  'Recruiter': 'Recruiters', 'Account lead': 'Account Leads', 'Franchisee': 'Franchisees',
  'Franchisor ops': 'Franchisor Ops', 'Coach': 'Coaches', 'Event producer': 'Event Producers',
};

/* ---------- Score tiers ----------
   Percentile-anchored against the generated corpus rather than picked by
   feel: a tier answers "how does this rank against the alternatives",
   which is the question a founder is actually asking.
   S = top 1%   A = top 10%   B = top 50%   C = the rest              */
export const TIERS = { s: 78, a: 70, b: 59 };

/* ---------- Collections (editorial layer) ----------
   A collection is a shortlist, so every rule is tuned to land in the
   low hundreds to low thousands — not tens of thousands.             */
export const COLLECTION_RULES = [
  { slug: 'weekend-build-saas',    title: 'Ship it this weekend',        test: i => i.scores.feasibility >= 92 && i.aos >= 64 },
  { slug: 'boring-and-profitable', title: 'Boring and profitable',       test: i => i.scores.money >= 86 && i.scores.competition >= 82 },
  { slug: 'ai-native-2026',        title: 'Only possible since 2025',    test: i => i.scores.timing >= 93 && i.aos >= 66 },
  { slug: 'deep-moat-plays',       title: 'Deep moat plays',             test: i => i.scores.moat >= 92 && i.aos >= 68 },
  { slug: 'under-5k-startup-cost', title: 'Under $5,000 to start',       test: i => i.money.startupCostLowUsd < 5000 && i.aos >= 68 },
  { slug: 'no-competition',        title: 'Nobody is here yet',          test: i => i.scores.competition >= 94 && i.aos >= 62 },
  { slug: 'fast-first-dollar',     title: 'Revenue inside 30 days',      test: i => i.money.timeToFirstRevenueDays <= 26 && i.aos >= 66 },
  { slug: 'high-acv-niche',        title: 'Small market, big contracts', test: i => i.money.acvHighUsd >= 140000 && i.scores.competition >= 74 },
  { slug: 'solo-founder-scale',    title: 'One person can run it',       test: i => i.scores.feasibility >= 88 && i.build.effort !== 'year' && i.aos >= 70 },
  { slug: 'contrarian-bets',       title: 'Contrarian bets',             test: i => i.scores.demand <= 44 && i.scores.moat >= 86 },
  { slug: 'proven-demand',         title: 'Demand is not the question',  test: i => i.scores.demand >= 93 && i.aos >= 70 },
  { slug: 'top-100',               title: 'The top 100',                 test: i => i.aos >= 82 },
];
