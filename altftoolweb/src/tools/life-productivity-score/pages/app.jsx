import { ProductivityProvider } from '../context/ProductivityContext';
import { HabitProvider } from '../context/HabitContext';
import Dashboard from '../components/Dashboard';

export default function App() {
    return (
        <ProductivityProvider>
            <HabitProvider>
                <Dashboard />
            </HabitProvider>
        </ProductivityProvider>
    );
}