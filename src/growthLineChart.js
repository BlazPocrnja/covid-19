import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ResponsiveContainer
} from 'recharts';

const GrowthLineChart = (props) => {
  const { data, trendLine, handleBrushChange } = props
  const [startIndex, setStartIndex] = useState()
  const [endIndex, setEndIndex] = useState()
  const [mergedData, setMergedData] = useState([])

  useEffect(() => {
    if (data.length >= 30) {
      setStartIndex(data.length - 30)
      setEndIndex(data.length - 1)

      handleBrushChange({startIndex: data.length - 30, endIndex: data.length - 1})
    }
  }, [data])

  useEffect(() => {
    setMergedData(data.map(d => ({ ...d, trend: (trendLine.find(t => t.date === d.date) || { value: undefined }).value })))
  }, [data, trendLine])

  const onBrushChange = e => {
    setStartIndex(e.startIndex)
    setEndIndex(e.endIndex)
    handleBrushChange(e)
  }

  return (
    <ResponsiveContainer>
      <LineChart
        data={mergedData}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <XAxis
          dataKey="date"
          label={{ value: "Date", offset: -80, position: 'insideBottom' }}
          tickFormatter={x => new Date(x).toLocaleDateString()}
        />
        <YAxis
          dataKey="value"
          label={{ value: "Growth Rate", angle: -90, position: 'insideLeft' }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip labelFormatter={t => new Date(t).toLocaleDateString()} />
        <Line
          name="Actual"
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8"
        />
        <Line
          name="Trend"
          type="monotone" 
          dataKey="trend" 
          stroke="#82ca9d"
        />
        <Brush
          startIndex={startIndex}
          endIndex={endIndex}
          onChange={onBrushChange}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default GrowthLineChart;