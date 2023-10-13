import React from 'react'
import { useLocation } from 'react-router-dom';
import '../styles/pages.css';
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend} from 'chart.js';
import {Bar} from 'react-chartjs-2';
ChartJS.register(
  BarElement, CategoryScale, LinearScale, Tooltip, Legend
)

export default function StatisticsPage() {
  const location = useLocation();
  const data = location.state?.data;

  const chartData = {
    labels: data.keys,
    datasets: [
        {
            label: 'Estimate',
            data: data.estimates,
            backgroundColor: '#1ba182',
        },
        {
            label: 'Actual',
            data: data.actuals,
            backgroundColor: '#070b3f',
        }
    ]
  }

  const options = {
      scales: {
          y: {
            beginAtZero: true
          }
        }
  }
  
  return (
    <div className='page'>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px'}}>
      <Bar data = {chartData} options = {options}></Bar>
      </div>
    </div>
    
  )

}
