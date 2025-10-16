// src/pages/Dashboard.jsx
import DashboardKPIs from "../components/DashboardKPIs";
import DashboardTable from "../components/DashboardTable";
import SalesByProduct from "../components/charts/SalesByProduct";
import SalesByCategory from "../components/charts/SalesByCategory";
import TopCustomers from "../components/charts/TopCustomers";

export default function Dashboard() {
  return (
    <div className="container md-3">
      <DashboardKPIs />
      <DashboardTable />
      <SalesByProduct />
      <SalesByCategory />
      <TopCustomers />
    </div>
  );
}
