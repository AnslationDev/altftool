"use client";
import { useState } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import { BarChart3, PieChart, Circle } from "lucide-react";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  ArcElement,
);

export default function PollChart({ options = [], votes = [] }) {
  const [chartType, setChartType] = useState("bar");

  if (!options.length || !votes.length) return null;

  const maxVotes = Math.max(...votes);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const palette = ["#F5F5F0", "#E6D8C3", "#C2A68C", "#5D866C"];

  const backgroundColors = votes.map((v, i) => {
    const color = palette[i % palette.length];
    return v === maxVotes && v !== 0 ? "#5D866C" : color;
  });

  const data = {
    labels: options,
    datasets: [
      {
        label: "Votes",
        data: votes,
        backgroundColor: backgroundColors,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        color: "#5D866C",
        font: { size: 18, weight: "bold" },
      },
      datalabels: {
        display: true,
        color: "#000",
        anchor: "end",
        align: "end",
        formatter: (value) => value,
        font: { weight: "bold", size: 14 },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    scales: {
      y: {
        beginAtZero: true,
        display: true,
        ticks: { precision: 0 },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
      x: {
        grid: { display: false },
         ticks: {
      maxRotation: 0,
      minRotation: 0,
      autoSkip: false,
    },
      },
    },
  };

  return (
    <div className=" relative z-0 w-full  rounded-2xl p-6 shadow-md mt-5 min-h-[350px] flex flex-col ">
      {/* Chart Type Switcher */}

      <h1 className="text-center text-2xl mx-auto mb-6 text-[#5D866C] font-bold ">
        {" "}
        Poll Results{" "}
      </h1>

      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-6  w-full ">
        <button
          onClick={() => setChartType("bar")}
          className={`flex  items-center gap-1 px-3 py-1 rounded-lg text-sm transition ${
            chartType === "bar" ? "bg-(--primary) text-white" : "bg-(--muted)"
          }`}
        >
          <BarChart3 size={16} className="text-green-500 " />
          Bar
        </button>

        <button
          onClick={() => setChartType("pie")}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition ${
            chartType === "pie" ? "bg-(--primary) text-white" : "bg-(--muted)"
          }`}
        >
          <PieChart size={16} className="text-blue-500" />
          Pie
        </button>

        <button
          onClick={() => setChartType("donut")}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition ${
            chartType === "donut" ? "bg-(--primary) text-white" : "bg-(--muted)"
          }`}
        >
          <Circle size={16} className="text-purple-500" />
          Donut
        </button>
      </div>
      
      {/* Custom Legend */}
      {(chartType === "pie" || chartType === "donut") && (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          {options.map((label, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: backgroundColors[i] }}
              ></span>
              <span className="text-(--foreground)">{label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="w-full  h-[280px] sm:h-[320px] flex   justify-center  rounded-lg">
        <div className="w-full  ">
          {chartType === "bar" && <Bar data={data} options={chartOptions} />}
        </div>
        {chartType === "pie" && (
          <Pie
            data={data}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                  position: "top",
                  labels: {
                    padding: 20,
                    boxWidth: 18,
                    boxHeight: 10,
                    font: {
                      size: isMobile ? 10 : 12,
                    },
                  },
                },
              },
            }}
          />
        )}

        {chartType === "donut" && (
          <Doughnut
            data={data}
            options={{
              responsive: true,
              cutout: "60%",
              plugins: {
                legend: {
                  display: false,
                  position: "top",
                  labels: {
                    padding: 20,
                    boxWidth: 18,
                    boxHeight: 10,
                    font: {
                      size: isMobile ? 10 : 12,
                    },
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
