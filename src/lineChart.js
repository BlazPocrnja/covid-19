import React, { useEffect, useState } from 'react';
import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway";

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_spiritedaway);

const LineChart = (props) => {
  const { data } = props
  const [chartState, setChartState] = useState()

	useEffect(()=> {
		let chart = am4core.create("linechartdiv", am4charts.XYChart);

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minWidth = 35;

    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "value";

    series.tooltipText = "{valueY.value}";
    chart.cursor = new am4charts.XYCursor();

    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(series);
    chart.scrollbarX = scrollbarX;

    setChartState(chart)
  }, [])
  
  useEffect(() => {
    if (chartState) chartState.data = data
  }, [data])
	
	return (
		<div id="linechartdiv" style={{ width: "100%", height: "100%" }}/>
	)
}

export default LineChart;