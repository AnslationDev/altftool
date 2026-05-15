'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer,
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
    Car, Fuel, Settings, Wallet, TrendingUp, Calculator,
    Download, Camera, Printer, RotateCcw, ChevronDown, ChevronUp,
    Info, CheckCircle2, AlertCircle, Scale, Zap, Gauge,
    CircleDollarSign, UserCircle2, BarChart3, TrendingDown, Clock
} from 'lucide-react';

// New UI Components
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Features from './Features';

// ==================== LOCAL STYLED COMPONENTS ====================

const StyledSectionCard = ({ children, className = '', title, icon: Icon, collapsible = false, defaultOpen = true, headerAction }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <Card variant="glass" className={`overflow-hidden p-0 ${className}`}>
            {title && (
                <div
                    className="flex items-center justify-between px-6 py-5 bg-slate-100/80 dark:bg-white/5 border-b border-(--border)"
                >
                    <div
                        className={`flex items-center gap-3 ${collapsible ? 'cursor-pointer flex-1' : ''}`}
                        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
                    >
                        {Icon && <Icon className="w-5 h-5 text-(--primary)" />}
                        <h3 className="text-sm font-black text-(--foreground) uppercase tracking-widest">{title}</h3>
                        {collapsible && (
                            <div className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors ml-2">
                                {isOpen ? <ChevronUp className="w-4 h-4 text-(--secondary)" /> : <ChevronDown className="w-4 h-4 text-(--secondary)" />}
                            </div>
                        )}
                    </div>
                    {headerAction && <div className="ml-4">{headerAction}</div>}
                </div>
            )}
            <AnimatePresence>
                {(!collapsible || isOpen) && (
                    <motion.div
                        initial={collapsible ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-6"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

const ResultCard = ({ title, value, subtext, icon: Icon, highlight = false, large = false }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className={`relative overflow-hidden rounded-[2rem] p-5 transition-all ${highlight ? 'bg-(--primary) text-white' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10'}`}
    >
        <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${highlight ? 'text-white' : 'text-(--primary)'}`} />}
                    <span className={`text-[10px] font-black uppercase tracking-widest truncate ${highlight ? 'text-white' : 'text-slate-900 dark:text-(--secondary)'}`}>{title}</span>
                </div>
                <div className={`font-black tracking-tight truncate ${large ? 'text-3xl' : 'text-xl'}`}>{value}</div>
                {subtext && <div className={`text-[9px] mt-1 font-black leading-tight ${highlight ? 'text-white/90' : 'text-slate-600 dark:text-(--secondary)'}`}>{subtext}</div>}
            </div>
        </div>
        {highlight && <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl" />}
    </motion.div>
);

const ChartCard = ({ title, children, className = '' }) => (
    <Card variant="glass" className={`flex flex-col rounded-[2rem] ${className}`}>
        <h4 className="text-[10px] font-black text-slate-700 dark:text-(--secondary) mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Gauge className="w-3.5 h-3.5 text-(--primary)" /> {title}
        </h4>
        <div className="flex-1 min-h-[200px]">
            {children}
        </div>
    </Card>
);

const defaultCar = {
    name: '', price: '', downPayment: '', loanAmount: '', interestRate: '', loanTenure: 5,
    fuelType: 'petrol', mileage: '', monthlyKM: '', fuelPrice: '', insurance: '',
    maintenance: '', parking: '', toll: '', registration: '', accessories: '',
    serviceFrequency: 6, ownershipYears: 5, resaleValue: '', annualKMGrowth: '', fuelInflation: '',
    unexpectedRepairs: '', tyreCost: '',
    monthlyIncome: '', taxiFarePerKM: '', dailyTaxiFare: '', taxiCalcMode: 'km',
};

const CarCostCalculator = () => {
    const [carA, setCarA] = useState({ ...defaultCar });
    const [carB, setCarB] = useState({ ...defaultCar });
    const [compareMode, setCompareMode] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [comparisonTimeRange, setComparisonTimeRange] = useState(5);
    const [chartType, setChartType] = useState('bar');
    const [selectedChartRange, setSelectedChartRange] = useState('all'); // '1', '3', '5', '10', 'all'
    const resultRef = useRef(null);

    const updateCarA = useCallback((updates) => {
        setCarA(prev => {
            const newCar = { ...prev, ...updates };
            if ('price' in updates || 'downPayment' in updates) {
                const price = parseFloat(newCar.price) || 0;
                const down = parseFloat(newCar.downPayment) || 0;
                newCar.loanAmount = Math.max(0, price - down);
            }
            return newCar;
        });
    }, []);

    const updateCarB = useCallback((updates) => {
        setCarB(prev => {
            const newCar = { ...prev, ...updates };
            if ('price' in updates || 'downPayment' in updates) {
                const price = parseFloat(newCar.price) || 0;
                const down = parseFloat(newCar.downPayment) || 0;
                newCar.loanAmount = Math.max(0, price - down);
            }
            return newCar;
        });
    }, []);

    const calculateCar = useCallback((car) => {
        const price = parseFloat(car.price) || 0;
        const loanAmount = parseFloat(car.loanAmount) || 0;
        const interestRate = parseFloat(car.interestRate) || 0;
        const loanTenure = parseFloat(car.loanTenure) || 1;
        const monthlyKM = parseFloat(car.monthlyKM) || 0;
        const mileage = parseFloat(car.mileage) || 1;
        const fuelPrice = parseFloat(car.fuelPrice) || 0;
        const insurance = parseFloat(car.insurance) || 0;
        const maintenance = parseFloat(car.maintenance) || 0;
        const parking = parseFloat(car.parking) || 0;
        const toll = parseFloat(car.toll) || 0;
        const registration = parseFloat(car.registration) || 0;
        const accessories = parseFloat(car.accessories) || 0;
        const ownershipYears = parseFloat(car.ownershipYears) || 1;
        const resaleValue = parseFloat(car.resaleValue) || 0;
        const fuelInflation = parseFloat(car.fuelInflation) || 0;
        const taxiFare = parseFloat(car.taxiFarePerKM) || 0;
        const dailyTaxiFare = parseFloat(car.dailyTaxiFare) || 0;
        const taxiCalcMode = car.taxiCalcMode || 'km';
        const monthlyIncome = parseFloat(car.monthlyIncome) || 0;

        const monthlyRate = interestRate / 100 / 12;
        const months = loanTenure * 12;
        let emi = 0, totalInterest = 0;
        if (loanAmount > 0 && interestRate > 0) {
            emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
            totalInterest = emi * months - loanAmount;
        } else if (loanAmount > 0) emi = loanAmount / months;

        const yearlyFuelCosts = [];
        for (let year = 1; year <= 10; year++) {
            const inflatedFuelPrice = fuelPrice * Math.pow(1 + fuelInflation / 100, year - 1);
            yearlyFuelCosts.push((monthlyKM * 12 / mileage) * inflatedFuelPrice);
        }

        const monthlyFuel = yearlyFuelCosts[0] / 12;
        const monthlyCost = emi + monthlyFuel + parking + toll + (maintenance / 12) + (insurance / 12);

        // Year 1, 3, 5, 10 Costs
        const getCostForYears = (yrs) => {
            const months = yrs * 12;
            return (monthlyCost * months) + registration + accessories;
        };

        const totalCost1Y = getCostForYears(1);
        const totalCost3Y = getCostForYears(3);
        const totalCost5Y = getCostForYears(5);
        const totalCost10Y = getCostForYears(10);

        // Taxi Comparison
        const getTaxiCost = (yrs) => {
            if (taxiCalcMode === 'daily') {
                return dailyTaxiFare * 30 * 12 * yrs;
            }
            return monthlyKM * taxiFare * 12 * yrs;
        };
        const taxi1Y = getTaxiCost(1);
        const taxi3Y = getTaxiCost(3);
        const taxi5Y = getTaxiCost(5);
        const taxi10Y = getTaxiCost(10);

        // Budget Compatibility
        const budgetPercent = monthlyIncome > 0 ? (monthlyCost / monthlyIncome) * 100 : 0;

        return {
            emi: Math.round(emi), totalInterest: Math.round(totalInterest),
            monthlyFuel: Math.round(monthlyFuel), monthlyCost: Math.round(monthlyCost),
            dailyCost: Math.round(monthlyCost / 30), costPerKM: Math.round((monthlyCost / monthlyKM) * 100) / 100 || 0,
            totalCost1Y, totalCost3Y, totalCost5Y, totalCost10Y,
            taxi1Y, taxi3Y, taxi5Y, taxi10Y,
            budgetPercent,
            yearlyFuelCosts,
        };
    }, []);

    const calcA = useMemo(() => calculateCar(carA), [carA, calculateCar]);
    const calcB = useMemo(() => calculateCar(carB), [carB, calculateCar]);

    const pieData = useMemo(() => [
        { name: 'EMI', value: calcA.emi, color: '#3b82f6' },
        { name: 'Fuel', value: calcA.monthlyFuel, color: '#f59e0b' },
        { name: 'Insurance', value: Math.round(carA.insurance / 12), color: '#10b981' },
        { name: 'Maint.', value: Math.round(carA.maintenance / 12), color: '#8b5cf6' },
        { name: 'Other', value: (parseFloat(carA.parking) || 0) + (parseFloat(carA.toll) || 0), color: '#ef4444' },
    ].filter(d => d.value > 0), [calcA, carA]);

    const comparisonChartData = useMemo(() => {
        const data = [];
        const ranges = selectedChartRange === 'all' ? [1, 3, 5, 10] : [parseInt(selectedChartRange)];
        ranges.forEach(yr => {
            data.push({
                year: `${yr}Y`,
                'Own Car': Math.round(calcA[`totalCost${yr}Y`]),
                'Taxi': Math.round(calcA[`taxi${yr}Y`]),
            });
        });
        return data;
    }, [calcA, selectedChartRange]);

    const barData = useMemo(() => [
        { year: 'Y1', cost: calcA.totalCost1Y },
        { year: 'Y3', cost: calcA.totalCost3Y },
        { year: 'Y5', cost: calcA.totalCost5Y },
    ], [calcA]);

    const lineData = useMemo(() => {
        const data = [];
        let cumulative = parseFloat(carA.registration || 0) + parseFloat(carA.accessories || 0);
        for (let i = 1; i <= 10; i++) {
            cumulative += calcA.monthlyCost * 12;
            data.push({ year: `Y${i}`, cost: cumulative });
        }
        return data;
    }, [calcA, carA]);

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20); doc.text('Car Ownership Cost Report', 20, 30);
        doc.setFontSize(12); doc.text(`Car: ${carA.name || 'My Car'}`, 20, 45);
        doc.text(`Total 5-Year Cost: ₹${calcA.totalCost5Y.toLocaleString('en-IN')}`, 20, 60);
        doc.text(`Monthly EMI: ₹${calcA.emi.toLocaleString('en-IN')}`, 20, 75);
        doc.text(`Cost/KM: ₹${calcA.costPerKM}`, 20, 90);
        doc.save('car-cost-report.pdf');
    };

    const takeScreenshot = async () => {
        if (resultRef.current) {
            const canvas = await html2canvas(resultRef.current);
            const link = document.createElement('a');
            link.download = 'car-cost-results.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const resetAll = () => {
        setCarA({ ...defaultCar });
        setCarB({ ...defaultCar });
        setCompareMode(false);
        setActiveTab('basic');
        setChartType('bar');
        setSelectedChartRange('all');
    };

    const applyScenario = (scenario) => {
        switch (scenario) {
            case 'fuel10': updateCarA({ fuelPrice: (parseFloat(carA.fuelPrice) || 100) * 1.1 }); break;
            case 'km2x': updateCarA({ monthlyKM: (parseFloat(carA.monthlyKM) || 0) * 2 }); break;
            case 'resaleDown': updateCarA({ resaleValue: Math.max(0, (parseFloat(carA.resaleValue) || 40) * 0.85) }); break;
            case 'interestUp': updateCarA({ interestRate: (parseFloat(carA.interestRate) || 8) + 2 }); break;
            case 'evCheaper': updateCarA({ fuelType: 'ev', fuelPrice: 8, mileage: 6 }); break;
        }
    };

    const formatCurrencyInput = (val) => {
        if (val === '') return '';
        const num = val.toString().replace(/[^0-9]/g, '');
        return num ? parseInt(num).toLocaleString('en-IN') : '';
    };

    const handleCurrencyChange = (val, updateFn, field) => {
        const num = val.toString().replace(/[^0-9]/g, '');
        updateFn({ [field]: num === '' ? '' : parseFloat(num) });
    };

    const renderCarForm = (car, updateCar, isCarB = false) => (
        <div className={`space-y-6 ${isCarB ? 'mt-8 pt-8 border-t border-(--border)' : ''}`}>
            {isCarB && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-(--foreground) tracking-tight">Car B Details</h3>
                </div>
            )}
            <div className="grid md:grid-cols-2 gap-5">
                <Input label="Car Name" value={car.name} onChange={(e) => updateCar({ name: e.target.value })} placeholder="e.g., Honda City" />
                <Input label="Purchase Price" value={formatCurrencyInput(car.price)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'price')} suffix="₹" placeholder="e.g. 1000000" />
                <Input label="Monthly Income" value={formatCurrencyInput(car.monthlyIncome)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'monthlyIncome')} suffix="₹" placeholder="e.g., 20000" />
                <Input label="Down Payment" value={formatCurrencyInput(car.downPayment)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'downPayment')} suffix="₹" placeholder="e.g., 200000" />
                <Input label="Loan Amount" value={formatCurrencyInput(car.loanAmount)} suffix="₹" disabled placeholder="e.g., 800000" />
                <Input label="Interest Rate" type="number" value={car.interestRate} onChange={(e) => updateCar({ interestRate: e.target.value })} suffix="%" step="0.1" placeholder="e.g., 9.9%" />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-(--secondary) uppercase tracking-widest">Loan Tenure</label>
                        <span className="px-2 py-0.5 bg-(--primary)/10 text-(--primary) text-[10px] font-black rounded-lg">{car.loanTenure} yr</span>
                    </div>
                    <input
                        type="range" min={1} max={10} step={1} value={car.loanTenure}
                        onChange={(e) => updateCar({ loanTenure: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );

    const renderFuelForm = (car, updateCar, isCarB = false) => (
        <div className={`space-y-6 ${isCarB ? 'mt-8 pt-8 border-t border-(--border)' : ''}`}>
            {isCarB && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-(--foreground) tracking-tight">Car B Details</h3>
                </div>
            )}
            <div className="grid md:grid-cols-2 gap-5">
                <Select label="Fuel Type" value={car.fuelType} onChange={(e) => updateCar({ fuelType: e.target.value })} options={[{ value: 'petrol', label: 'Petrol' }, { value: 'diesel', label: 'Diesel' }, { value: 'cng', label: 'CNG' }, { value: 'ev', label: 'Electric' }]} />
                <Input label="Mileage" type="number" value={car.mileage} onChange={(e) => updateCar({ mileage: e.target.value })} suffix={car.fuelType === 'ev' ? 'km/kWh' : 'km/l'} placeholder="e.g., 15" />
                <Input label="Monthly Running" type="number" value={car.monthlyKM} onChange={(e) => updateCar({ monthlyKM: e.target.value })} suffix="km" placeholder="e.g., 1000" />
                <Input label="Fuel/Energy Price" type="number" value={car.fuelPrice} onChange={(e) => updateCar({ fuelPrice: e.target.value })} suffix={car.fuelType === 'ev' ? '₹/kWh' : '₹/L'} placeholder="e.g., 100" />
            </div>
        </div>
    );

    const renderExpenseForm = (car, updateCar, isCarB = false) => (
        <div className={`space-y-6 ${isCarB ? 'mt-8 pt-8 border-t border-(--border)' : ''}`}>
            {isCarB && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-(--foreground) tracking-tight">Car B Details</h3>
                </div>
            )}
            <div className="grid md:grid-cols-2 gap-5">
                <Input label="Insurance/Year" value={formatCurrencyInput(car.insurance)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'insurance')} suffix="₹" placeholder="e.g., 25000" />
                <Input label="Maintenance/Year" value={formatCurrencyInput(car.maintenance)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'maintenance')} suffix="₹" placeholder="e.g., 10000" />
                <Input label="Parking/Month" value={formatCurrencyInput(car.parking)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'parking')} suffix="₹" placeholder="e.g., 1000" />
                <Input label="Toll/Month" value={formatCurrencyInput(car.toll)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'toll')} suffix="₹" placeholder="e.g., 500" />
                <Input label="Registration" value={formatCurrencyInput(car.registration)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'registration')} suffix="₹" placeholder="e.g., 100000" />
                <Input label="Accessories" value={formatCurrencyInput(car.accessories)} onChange={(e) => handleCurrencyChange(e.target.value, updateCar, 'accessories')} suffix="₹" placeholder="e.g., 50000" />
            </div>
        </div>
    );

    const getRecommendations = () => {
        const recs = [];
        const km = parseFloat(carA.monthlyKM) || 0;
        const price = parseFloat(carA.price) || 0;
        if (km > 2000) recs.push({ icon: Zap, title: 'High Mileage', text: 'Consider Diesel or EV for better economy', color: 'amber' });
        else if (km < 1000) recs.push({ icon: Fuel, title: 'Low Usage', text: 'Petrol car is most cost-effective', color: 'blue' });
        if (price > 1500000) recs.push({ icon: CheckCircle2, title: 'Premium Budget', text: 'Compare EV options for long-term savings', color: 'green' });
        if (carA.fuelType === 'ev') recs.push({ icon: Zap, title: 'EV Benefits', text: 'Lower running cost, check charging infra', color: 'emerald' });
        return recs;
    };

    const budgetStatus = useMemo(() => {
        const p = calcA.budgetPercent;
        if (p === 0) return { color: 'text-slate-400', bg: 'bg-slate-200', label: 'Awaiting Data', text: 'Enter your price and income to see compatibility.' };
        if (p < 15) return { color: 'text-blue-500', bg: 'bg-blue-500', label: 'Excellent Fit', text: 'This car fits comfortably in your budget.' };
        if (p < 25) return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Manageable', text: 'Consider reducing optional expenses to keep it safe.' };
        return { color: 'text-red-500', bg: 'bg-red-500', label: 'Financially Heavy', text: 'Consider reducing EMI or choosing a cheaper option.' };
    }, [calcA.budgetPercent]);

    const taxiVerdict = useMemo(() => {
        const km = parseFloat(carA.monthlyKM) || 0;
        const yrs = [1, 3, 5, 10];
        let breakevenYear = 0;

        for (let yr of yrs) {
            if (calcA[`totalCost${yr}Y`] < calcA[`taxi${yr}Y`]) {
                breakevenYear = yr;
                break;
            }
        }

        if (km < 500) return "Uber/Ola is significantly cheaper for your low monthly usage.";
        if (breakevenYear === 0) return "Taxi saves money for your current monthly usage over the long term.";
        return `Owning a car becomes more cost-effective after ${breakevenYear} years.`;
    }, [calcA, carA.monthlyKM]);

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground) pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                {/* Hero Header */}
                <div className='bg-(--background) text-(--primary) text-center mb-12 mx-auto'>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="heading flex justify-center items-center gap-3 animate-fade-up"
                    >
                        Car Ownership Cost Analyzer
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="description opacity-90 mt-3 text-(--secondary) animate-fade-up"
                    >
                        Discover the true cost of your vehicle investment
                    </motion.p>

                    <div className="flex justify-center gap-4 mt-8">
                        <Button variant="primary" icon={RotateCcw} onClick={resetAll} size="sm" pill>Reset Analyzer</Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-3 space-y-8">
                        <StyledSectionCard
                            title="Car Details"
                            icon={Car}
                            headerAction={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={Scale}
                                    onClick={() => setCompareMode(!compareMode)}
                                    className={compareMode ? 'ring-2 ring-(--primary)' : ''}
                                >
                                    {compareMode ? 'Exit Compare' : 'Compare Cars'}
                                </Button>
                            }
                        >
                            <div className="flex gap-2 mb-8 p-1.5 bg-slate-200 dark:bg-white/5 rounded-2xl w-fit">
                                {['basic', 'fuel', 'expenses'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2 rounded-xl font-black text-xs capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-white/10 text-(--primary) scale-105' : 'text-slate-600 dark:text-(--secondary) hover:text-(--foreground) hover:bg-white/50'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'basic' && renderCarForm(carA, updateCarA)}
                                    {activeTab === 'fuel' && renderFuelForm(carA, updateCarA)}
                                    {activeTab === 'expenses' && renderExpenseForm(carA, updateCarA)}

                                    {compareMode && (
                                        <div className="mt-8">
                                            {activeTab === 'basic' && renderCarForm(carB, updateCarB, true)}
                                            {activeTab === 'fuel' && renderFuelForm(carB, updateCarB, true)}
                                            {activeTab === 'expenses' && renderExpenseForm(carB, updateCarB, true)}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </StyledSectionCard>

                        {/* Buy vs Uber/Ola Comparison Section */}
                        <StyledSectionCard title="Buy vs Uber/Ola Comparison" icon={CircleDollarSign}>
                            <div className="flex gap-2 mb-8 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit">
                                <button
                                    onClick={() => updateCarA({ taxiCalcMode: 'km' })}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${carA.taxiCalcMode === 'km' ? 'bg-white dark:bg-white/10 text-(--primary)' : 'text-(--secondary)'}`}
                                >
                                    Per KM Fare
                                </button>
                                <button
                                    onClick={() => updateCarA({ taxiCalcMode: 'daily' })}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${carA.taxiCalcMode === 'daily' ? 'bg-white dark:bg-white/10 text-(--primary)' : 'text-(--secondary)'}`}
                                >
                                    Daily Spent
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {carA.taxiCalcMode === 'km' ? (
                                    <Input
                                        label="Taxi Fare (per KM)"
                                        type="number"
                                        value={carA.taxiFarePerKM}
                                        onChange={(e) => updateCarA({ taxiFarePerKM: e.target.value })}
                                        suffix="₹"
                                        placeholder="e.g., 12/km"
                                    />
                                ) : (
                                    <Input
                                        label="Daily Taxi Spent"
                                        type="number"
                                        value={carA.dailyTaxiFare}
                                        onChange={(e) => updateCarA({ dailyTaxiFare: e.target.value })}
                                        suffix="₹"
                                        placeholder="e.g., 500"
                                    />
                                )}
                                <div className="p-5 rounded-2xl bg-(--primary)/5 border border-(--primary)/10">
                                    <div className="text-[10px] font-black text-(--primary) uppercase tracking-widest mb-1">Smart Recommendation</div>
                                    <div className="text-sm font-bold text-(--foreground) leading-relaxed">{taxiVerdict}</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-(--border)">
                                            <th className="py-4 text-[10px] font-black text-(--secondary) uppercase tracking-widest">Timeframe</th>
                                            <th className="py-4 text-[10px] font-black text-(--secondary) uppercase tracking-widest">Car Ownership</th>
                                            <th className="py-4 text-[10px] font-black text-(--secondary) uppercase tracking-widest">Taxi (Uber/Ola) </th>
                                            <th className="py-4 text-[10px] font-black text-(--secondary) uppercase tracking-widest">Difference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {[1, 3, 5, 10].map(yr => {
                                            const own = calcA[`totalCost${yr}Y`];
                                            const taxi = calcA[`taxi${yr}Y`];
                                            const diff = own - taxi;
                                            return (
                                                <tr key={yr} className="border-b border-(--border) last:border-0">
                                                    <td className="py-4 font-bold">{yr} Year</td>
                                                    <td className="py-4 font-black">₹{Math.round(own).toLocaleString()}</td>
                                                    <td className="py-4 font-black">₹{Math.round(taxi).toLocaleString()}</td>
                                                    <td className={`py-4 font-black ${diff > 0 ? 'text-blue-500' : 'text-blue-600'}`}>
                                                        {diff > 0 ? `+₹${Math.round(diff).toLocaleString()}` : `-₹${Math.round(Math.abs(diff)).toLocaleString()}`}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h4 className="text-[10px] font-black text-(--secondary) uppercase tracking-widest flex items-center gap-2">
                                        <BarChart3 className="w-3.5 h-3.5" /> Comparison Analysis
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Timeframe Filter */}
                                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                                            {['all', '1', '3', '5', '10'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setSelectedChartRange(v)}
                                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${selectedChartRange === v ? 'bg-white dark:bg-white/10 text-(--primary)' : 'text-(--secondary)'}`}
                                                >
                                                    {v === 'all' ? 'All' : `${v}Y`}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Chart Type Toggle */}
                                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                                            {['bar', 'line'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setChartType(t)}
                                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${chartType === t ? 'bg-white dark:bg-white/10 text-(--primary)' : 'text-(--secondary)'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 min-h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={300}>
                                        {chartType === 'bar' ? (
                                            <BarChart data={comparisonChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10, fontWeight: 'bold' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} formatter={(v) => `₹${v.toLocaleString()}`} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold', paddingTop: 20 }} />
                                                <Bar dataKey="Own Car" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={selectedChartRange === 'all' ? 30 : 60} />
                                                <Bar dataKey="Taxi" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={selectedChartRange === 'all' ? 30 : 60} />
                                            </BarChart>
                                        ) : (
                                            <LineChart data={comparisonChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10, fontWeight: 'bold' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} formatter={(v) => `₹${v.toLocaleString()}`} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold', paddingTop: 20 }} />
                                                <Line type="monotone" dataKey="Own Car" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                <Line type="monotone" dataKey="Taxi" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </StyledSectionCard>

                        <StyledSectionCard title="Scenario Simulator" icon={Gauge}>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="primary" size="sm" onClick={() => applyScenario('fuel10')}>Fuel +10%</Button>
                                <Button variant="primary" size="sm" onClick={() => applyScenario('km2x')}>KM x2</Button>
                                <Button variant="primary" size="sm" onClick={() => applyScenario('resaleDown')}>Resale -15%</Button>
                                <Button variant="Primary" size="sm" onClick={() => applyScenario('interestUp')}>Interest +2%</Button>
                                <Button variant="Primary" size="sm" onClick={() => applyScenario('evCheaper')}>Switch to EV</Button>
                            </div>
                        </StyledSectionCard>

                        {calcA.monthlyCost > 0 && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <ChartCard title="Cost Breakdown">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                                                {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}
                                                itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
                                                formatter={(v) => `₹${v.toLocaleString()}`}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                                <ChartCard title="Yearly Ownership projection">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}
                                                formatter={(v) => `₹${v.toLocaleString()}`}
                                            />
                                            <Bar dataKey="cost" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2">
                        <div ref={resultRef} className="lg:sticky lg:top-10 space-y-6">
                            <StyledSectionCard title="Cost Summary" icon={Calculator}>
                                <div className="space-y-4">
                                    <ResultCard title="Monthly EMI" value={`₹${calcA.emi.toLocaleString()}`} icon={Wallet} />
                                    <ResultCard title="Monthly Fuel" value={`₹${calcA.monthlyFuel.toLocaleString()}`} icon={Fuel} />
                                    <ResultCard title="Daily Cost" value={`₹${calcA.dailyCost}`} icon={Zap} subtext="Your average daily ownership cost" />
                                    <ResultCard title="Total Monthly" value={`₹${calcA.monthlyCost.toLocaleString()}`} icon={TrendingUp} highlight />
                                    <ResultCard title="Cost/KM" value={`₹${calcA.costPerKM}`} icon={Gauge} />
                                    <ResultCard title="Daily Drive" value={`${Math.round(carA.monthlyKM / 30)}km`} icon={Car} />
                                    <ResultCard title="5-Year Total" value={`₹${calcA.totalCost5Y.toLocaleString()}`} icon={Settings} large />
                                </div>
                            </StyledSectionCard>

                            {/* Budget Compatibility Meter */}
                            <Card variant="glass" className="p-7">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black text-(--secondary) uppercase tracking-widest flex items-center gap-2">
                                        <UserCircle2 className="w-4 h-4 text-(--primary)" /> Budget Compatibility
                                    </h3>
                                    <span className={`text-xs font-black px-3 py-1 rounded-full ${budgetStatus.color} bg-(--primary)/5`}>
                                        {calcA.budgetPercent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="relative w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, calcA.budgetPercent)}%` }}
                                        className={`absolute top-0 left-0 h-full ${budgetStatus.bg}`}
                                    />
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <div className={`p-2.5 rounded-xl bg-white dark:bg-white/10 ${budgetStatus.color}`}>
                                        <CircleDollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className={`font-black text-xs mb-1 tracking-tight ${budgetStatus.color}`}>{budgetStatus.label}</div>
                                        <div className="text-[10px] text-(--secondary) leading-relaxed font-bold">{budgetStatus.text}</div>
                                    </div>
                                </div>
                            </Card>

                            <AnimatePresence>
                                {getRecommendations().length > 0 && (
                                    <Card variant="glass" className="p-7">
                                        <h3 className="text-[10px] font-black text-slate-800 dark:text-(--secondary) mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" /> Recommendations
                                        </h3>
                                        <div className="space-y-4">
                                            {getRecommendations().map((rec, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                                >
                                                    <div className="p-2.5 rounded-xl bg-white dark:bg-white/10 text-blue-600">
                                                        <rec.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-xs !text-blue-500 dark:text-white mb-1 tracking-tight">{rec.title}</div>
                                                        <div className="text-[10px] text-slate-700 dark:text-slate-400 leading-relaxed font-black">{rec.text}</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </AnimatePresence>

                            <StyledSectionCard title="Export Report" icon={Download}>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex gap-3">
                                        <Button variant="primary" icon={Download} onClick={downloadPDF} className="flex-1" size="sm">PDF</Button>
                                        <Button variant="primary" icon={Camera} onClick={takeScreenshot} className="flex-1 bg-blue-600" size="sm">Image</Button>
                                    </div>
                                    <Button variant="ghost" icon={Printer} onClick={() => window.print()} className="w-full text-blue-900 font-black" size="sm">Print Report</Button>
                                </div>
                            </StyledSectionCard>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            {/* <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center border-t border-(--border) mt-12">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-100 dark:bg-white/5 rounded-full mb-6 border border-(--border)">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-(--secondary) uppercase tracking-[0.2em]">Live Analysis Active</span>
                </div>
                <p className="text-sm font-bold text-(--secondary) tracking-tight">CarOwnership Cost Analyzer — Complete Financial Transparency for Vehicle Buyers</p>
                <div className="flex justify-center gap-8 mt-10">
                    {['Financial Rigor', 'Data Privacy', 'Real-time Calculations'].map(item => (
                        <span key={item} className="text-[10px] font-black text-(--secondary) uppercase tracking-widest opacity-30">{item}</span>
                    ))}
                </div>
            </footer> */}
            <Features />
        </div>
    );
};

export default CarCostCalculator;
