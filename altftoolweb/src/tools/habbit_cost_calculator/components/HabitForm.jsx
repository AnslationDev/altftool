import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Coffee, Utensils, ShoppingBag, Car, Film, Music, Heart, ChevronDown } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

const iconOptions = [
  { icon: Coffee, label: 'Coffee' },
  { icon: Utensils, label: 'Food' },
  { icon: ShoppingBag, label: 'Shopping' },
  { icon: Car, label: 'Transport' },
  { icon: Film, label: 'Entertainment' },
  { icon: Music, label: 'Subscriptions' },
  { icon: Heart, label: 'Health' },
];

export const HabitForm = () => {
  const { addHabit } = useHabits();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandAdvanced, setExpandAdvanced] = useState(false);
  const [healthImpact, setHealthImpact] = useState('low');
  const [stressImpact, setStressImpact] = useState('low');
  const [productivityImpact, setProductivityImpact] = useState('low');
  const [relationshipImpact, setRelationshipImpact] = useState('low');
  const [timeSpentPerDay, setTimeSpentPerDay] = useState('');
  const [years, setYears] = useState('1');

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    const costNum = parseFloat(cost);
    if (!cost.trim()) {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(costNum) || costNum <= 0) {
      newErrors.cost = 'Please enter a valid positive cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate a brief delay for UX
    setTimeout(() => {
      addHabit({
        name: name.trim(),
        cost: parseFloat(cost),
        frequency,
        healthImpact,
        stressImpact,
        productivityImpact,
        relationshipImpact,
        timeSpentPerDay: parseFloat(timeSpentPerDay) || 0,
        years: parseInt(years) || 1,
      });

      // Reset form
      setName('');
      setCost('');
      setFrequency('daily');
      setSelectedIcon(0);
      setHealthImpact('low');
      setStressImpact('low');
      setProductivityImpact('low');
      setRelationshipImpact('low');
      setTimeSpentPerDay('');
      setYears('1');
      setExpandAdvanced(false);
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 2000);
    }, 300);
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const impactOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <Card variant="glass" className="relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 border border-blue-500/20">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-(--foreground)">Add New Habit</h2>
            <p className="text-sm text-(--muted-foreground)">Track your daily spending</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-(--foreground) mb-3">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.label}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedIcon(index)}
                    className={`
                      p-3 rounded-xl border transition-all duration-200
                      ${selectedIcon === index
                        ? 'bg-(--primary) border-(--primary) text-white'
                        : 'bg-(--muted) border-(--border) text-(--muted-foreground) hover:border-(--primary) hover:text-(--primary)'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Input
            label="Habit Name" 
            placeholder="e.g., Morning coffee, Netflix subscription"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            maxLength={50}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost (₹)"
              type="number"
              placeholder="0.00"
              prefix="₹"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              error={errors.cost}
              min="0"
              step="0.01"
            />

            <Select
              label="Frequency"
              options={frequencyOptions}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>

          {/* Advanced Options Collapsible */}
          <motion.div
            initial={false}
            animate={{ height: expandAdvanced ? 'auto' : 0, opacity: expandAdvanced ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-(--border) space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Time per day (hrs)"
                  type="number"
                  placeholder="0"
                  value={timeSpentPerDay}
                  onChange={(e) => setTimeSpentPerDay(e.target.value)}
                  min="0"
                  step="0.5"
                />
                <Input
                  label="Years active"
                  type="number"
                  placeholder="1"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-(--muted-foreground)">Impact Assessment</p>
                <Select
                  label="Health Impact"
                  options={impactOptions}
                  value={healthImpact}
                  onChange={(e) => setHealthImpact(e.target.value)}
                />
                <Select
                  label="Stress Impact"
                  options={impactOptions}
                  value={stressImpact}
                  onChange={(e) => setStressImpact(e.target.value)}
                />
                <Select
                  label="Productivity Impact"
                  options={impactOptions}
                  value={productivityImpact}
                  onChange={(e) => setProductivityImpact(e.target.value)}
                />
                <Select
                  label="Relationship Impact"
                  options={impactOptions}
                  value={relationshipImpact}
                  onChange={(e) => setRelationshipImpact(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Toggle Advanced Button */}
          <motion.button
            type="button"
            onClick={() => setExpandAdvanced(!expandAdvanced)}
            className="w-full flex items-center justify-center gap-2 text-sm text-(--primary) hover:text-(--primary) py-2 rounded-lg hover:bg-(--primary)/10 transition-colors"
          >
            {expandAdvanced ? 'Hide' : 'Show'} Impact Assessment
            <motion.div animate={{ rotate: expandAdvanced ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Adding Habit...' : 'Add Habit'}
          </Button>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showSuccess ? 1 : 0, y: showSuccess ? 0 : 10 }}
            className="flex items-center justify-center gap-2 text-(--primary) text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Habit added successfully!
          </motion.div>
        </form>
      </div>
    </Card>
  );
};

export default HabitForm;
