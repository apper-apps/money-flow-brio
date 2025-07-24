import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { transactionService } from "@/services/api/transactionService";

const ExpenseChart = () => {
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChartData = async () => {
    try {
      setError("");
      setLoading(true);
      const transactions = await transactionService.getAll();
      
      // Filter expenses and group by category
      const expenses = transactions.filter(t => t.type === "expense");
      const categoryTotals = {};
      
      expenses.forEach(expense => {
        const category = expense.category;
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
      });

      const labels = Object.keys(categoryTotals);
      const series = Object.values(categoryTotals);

      setChartData({ labels, series });
    } catch (err) {
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  const chartOptions = {
    chart: {
      type: "pie",
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      }
    },
    labels: chartData.labels,
    colors: [
      "#2563EB", // Primary blue
      "#7C3AED", // Secondary purple
      "#10B981", // Accent green
      "#F59E0B", // Warning orange
      "#EF4444", // Error red
      "#3B82F6", // Info blue
      "#8B5CF6", // Purple variant
      "#06B6D4", // Cyan
      "#84CC16", // Lime
      "#F97316"  // Orange
    ],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Expenses",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `$${total.toLocaleString()}`;
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toFixed(1) + "%";
      },
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        fontWeight: "500"
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return `$${val.toLocaleString()}`;
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadChartData} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.series.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartData.series}
            type="pie"
            height={400}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-500">
            No expense data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseChart;