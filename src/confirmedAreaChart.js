import React, { useEffect, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
	Area,
	AreaChart,
  ResponsiveContainer
} from 'recharts';

const ConfirmedAreaChart = (props) => {
	const { data, predictedData  } = props
	const [mergedData, setMergedData] = useState([])

	useEffect(() => {
		setMergedData([...data, ...predictedData])
	}, [data, predictedData])

  return (
    <ResponsiveContainer>
			<AreaChart
				data={mergedData}
				margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
			>
				<defs>
					<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
						<stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
					</linearGradient>
					<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
						<stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
					</linearGradient>
				</defs>
				<XAxis
          dataKey="date"
          label={{ value: "Date", offset: -80, position: 'insideBottom' }}
          tickFormatter={x => new Date(x).toLocaleDateString()}
        />
				<YAxis />
				<CartesianGrid strokeDasharray="3 3" />
				<Tooltip labelFormatter={t => new Date(t).toLocaleDateString()} />
				<Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
				<Area type="monotone" dataKey="predictedValue" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
			</AreaChart>
    </ResponsiveContainer>
  );
}

export default ConfirmedAreaChart;