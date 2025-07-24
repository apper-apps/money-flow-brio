import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { transactionService } from "@/services/api/transactionService";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

const MonthlyChart = () => {
  const [chartData, setChartData] = useState({ income: [], expenses: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChartData = async () => {
    try {
      setError("");
      setLoading(true);
      const transactions = await transactionService.getAll();
      
      // Get last 6 months
      const endDate = new Date();
      const startDate = subMonths(endDate, 5);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        });
        
        const income = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          month: format(month, "MMM yyyy"),
          income,
          expenses
        };
      });

      setChartData({
        categories: monthlyData.map(d => d.month),
        income: monthlyData.map(d => d.income),
        expenses: monthlyData.map(d => d.expenses)
      });
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
      type: "bar",
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        }
      }
    },
    yaxis: {
      title: {
        text: "Amount ($)",
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        }
      },
      labels: {
        formatter: function(val) {
          return `$${val.toLocaleString()}`;
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        }
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#34D399", "#F87171"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return `$${val.toLocaleString()}`;
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
    },
    colors: ["#10B981", "#EF4444"]
  };

  const series = [
    {
      name: "Income",
      data: chartData.income
    },
    {
      name: "Expenses",
      data: chartData.expenses
    }
  ];

  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadChartData} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height={400}
        />
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;