import { HabitProvider } from '../context/HabitContext';
import Dashboard from '../components/Dashboard';
import './index.css';

function HabitApp() {
  return (
    <HabitProvider>
      <Dashboard />
    </HabitProvider>
  );
}

export default HabitApp;
