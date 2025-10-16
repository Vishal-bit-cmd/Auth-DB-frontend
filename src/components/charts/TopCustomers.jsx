// src/components/charts/TopCustomers.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TopCustomers() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/charts/top-customers")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="mt-5">
      <h5>Top Customers by Spending</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="customer_name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total_spent" stroke="#28a745" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
