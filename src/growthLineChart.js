import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer
} from 'recharts';

const GrowthLineChart = (props) => {
  const { data } = props

  return (
    <ResponsiveContainer>
      <LineChart 
        data={data}
        margin={{top: 20, right: 20, left: 20, bottom: 20}}
      >
        <XAxis 
          dataKey="date"
          label={{ value: "Date", offset:-80, position: 'insideBottom' }}
          tickFormatter={x => new Date(x).toLocaleDateString()}
        />
        <YAxis 
          dataKey="value"
          label={{ value: "Growth Rate", angle: -90, position: 'insideLeft' }}
        />
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
        <Brush />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default GrowthLineChart;