// src/components/charts/SalesByCategory.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CFF",
  "#FF6699",
  "#33CC33",
  "#FF9933",
  "#6699FF",
  "#CC66FF",
];

export default function SalesByCategory() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/charts/sales-by-category"
        );

        // Map backend fields to chart-compatible fields
        const formatted = res.data.map((item) => ({
          name: item.category_name, // This will appear in default legend
          value: Number(item.total_sales), // Pie slice size
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching sales by category:", err);
      }
    };

    fetchData();
  }, []);

  if (!data.length) {
    return <p className="text-center mt-3">No category sales data available</p>;
  }

  return (
    <div className="card p-3 mt-3">
      <h5>Sales by Category</h5>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name" // Important: default Legend will use this
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => entry.name} // Category names on pie slices
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend /> {/* Default legend now uses nameKey */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
