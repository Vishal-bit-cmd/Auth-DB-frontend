// src/components/DashboardKPIs.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardKPIs() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const [salesRes, ordersRes, customersRes] = await Promise.all([
          api.get("/kpis/total-sales"),
          api.get("/kpis/total-orders"),
          api.get("/kpis/total-customers"),
        ]);

        setTotalSales(salesRes.data.total_sales);
        setTotalOrders(ordersRes.data.total_orders);
        setTotalCustomers(customersRes.data.total_customers);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
      }
    };
    fetchKPIs();
  }, []);

  return (
    <div className="row">
      <div className="col-md-4 mb-3">
        <div className="card text-white bg-primary h-100">
          <div className="card-body">
            <h6>Total Sales</h6>
            <h4>${totalSales.toLocaleString()}</h4>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="card text-white bg-success h-100">
          <div className="card-body">
            <h6>Total Orders</h6>
            <h4>{totalOrders}</h4>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="card text-white bg-warning h-100">
          <div className="card-body">
            <h6>Total Customers</h6>
            <h4>{totalCustomers}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
