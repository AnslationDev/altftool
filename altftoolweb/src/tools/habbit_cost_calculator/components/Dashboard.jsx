import { motion } from 'framer-motion';
//import { Activity } from 'lucide-react';
import HabitForm from './HabitForm';
import HabitList from './HabitList';
import HabitSummary from './HabitSummary';
import CostChart from './CostChart';
import HabitImpactScore from './HabitImpactScore';
import FutureLossVisualization from './FutureLossVisualization';
import BreakThisHabit from './BreakThisHabit';
import TimeLostCalculator from './TimeLostCalculator';
import Features from "./features"
import { useHabits } from '../context/HabitContext';

export const Dashboard = () => {
  const { habits } = useHabits();

  return (
    <div className="px-4 py-6 text-(--foreground)">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          {/* <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <Activity className="w-5 h-5 text-white" />
          </div> */}
          <div className='bg-(--background) text-(--primary) text-center mb-5 mx-auto'>
            <h1 className="heading  flex justify-center gap-2  animate-fade-up ">
              Habbit Cost Calculator
            </h1>
            <p className=" description opacity-90 mt-1 text-(--secondary)  animate-fade-up">
              Discover your true spending
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg overflow-hidden py-5">
        <div className="p-6 space-y-6">
          {/* Summary Section */}
          <section>
            <HabitSummary />
          </section>

          {/* Form and Chart Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            > 
              <HabitForm />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CostChart />
            </motion.div>
          </section>

          {/* Habit List Section */}
          <section>
            <HabitList />
          </section>

          {/* Premium Features Section */}
          {habits.length > 0 && (
            <>
              {/* Habit Impact Score */}
              <section className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {habits.some((h) => h.healthImpact) ? (
                    <HabitImpactScore habit={habits[0]} />
                  ) : null}
                </motion.div>
              </section>

              {/* Future Loss Visualization */}
              <section className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FutureLossVisualization habits={habits} />
                </motion.div>
              </section>

              {/* Break This Habit */}
              <section className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <BreakThisHabit habits={habits} />
                </motion.div>
              </section>

              {/* Time Lost Calculator */}
              <section className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <TimeLostCalculator habits={habits} />
                </motion.div>
              </section>
            </>
          )}
        </div>
      </div>
      <Features />
    </div>
  );
};

export default Dashboard;
