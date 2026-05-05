import Dashboard from "../components/Dashboard";
import { ExpenseProvider } from "../context/ExpenseContext";
import DashboardLayout from "../layouts/DashboardLayout";
import Description from "../components/Description"; 

export default function ToolHome() {
  return (
    <ExpenseProvider>
      <DashboardLayout>
        <Dashboard />
        {/* Description section render */}
        <Description />
      </DashboardLayout>
    </ExpenseProvider>
  );
}