import React from 'react';
import { motion } from 'framer-motion';
import {
    Moon,
    Monitor,
    Activity,
    Smartphone,
    Droplets,
    Zap
} from 'lucide-react';
import { useProductivity } from '../context/ProductivityContext';

const InputSlider = ({ label, value, onChange, min, max, unit, icon: Icon, color }) => {
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div className="group space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2.5 rounded-xl text-white transition-all duration-500 group-hover:scale-110 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                    >
                        {Icon && <Icon size={16} />}
                    </div>
                    <span className="text-sm font-bold text-(--foreground) tracking-tight group-hover:text-blue-500 transition-colors uppercase tracking-widest">{label}</span>
                </div>
                <div className="flex items-baseline gap-1 bg-blue-500/5 px-3 py-1.5 rounded-xl border border-blue-500/10">
                    <span className="text-xl font-black tracking-tighter text-blue-500 tabular-nums">
                        {value.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 opacity-60">{unit}</span>
                </div>
            </div>

            <div className="relative py-4 cursor-pointer">
                <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${pct}%`,
                            backgroundColor: color
                        }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={0.1}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
            </div>

            <div className="flex justify-between px-0.5 text-[10px] font-black text-(--foreground) opacity-40 uppercase tracking-[0.2em]">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

const InputSliders = () => {
    const {
        sleep, setSleep,
        work, setWork,
        exercise, setExercise,
        screenTime, setScreenTime,
        water, setWater,
        energy, setEnergy
    } = useProductivity();

    const sliderData = [
        { label: 'Sleep Quality', value: sleep, onChange: setSleep, min: 0, max: 12, unit: 'hrs', icon: Moon, color: '#2563eb' },
        { label: 'Work Focus', value: work, onChange: setWork, min: 0, max: 16, unit: 'hrs', icon: Monitor, color: '#2563eb' },
        { label: 'Physical Activity', value: exercise, onChange: setExercise, min: 0, max: 180, unit: 'min', icon: Activity, color: '#2563eb' },
        { label: 'Digital Usage', value: screenTime, onChange: setScreenTime, min: 0, max: 12, unit: 'hrs', icon: Smartphone, color: '#2563eb' },
        { label: 'Hydration', value: water, onChange: setWater, min: 0, max: 20, unit: 'gls', icon: Droplets, color: '#2563eb' },
        { label: 'Energy Level', value: energy, onChange: setEnergy, min: 0, max: 10, unit: '/10', icon: Zap, color: '#2563eb' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {sliderData.map((slider) => (
                <InputSlider key={slider.label} {...slider} />
            ))}
        </div>
    );
};

export default InputSliders;
