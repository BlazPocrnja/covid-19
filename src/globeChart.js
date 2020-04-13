import React, { useEffect, useState } from 'react';
import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway";

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_spiritedaway);

const GlobeChart = (props) => {
	const { data, onCountryClick } = props
	const [polygonSeriesState, setPolygonSeries] = useState()
	const [covidSeriesState, setCovidSeries] = useState()

	useEffect(() => {
		let chart = am4core.create("globechartdiv", am4maps.MapChart);

		try {
				chart.geodata = am4geodata_worldLow;
		}
		catch (e) {
				chart.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
		}


		let label = chart.createChild(am4core.Label)
		label.text = "Select a country to view statistics.";
		label.fontSize = 12;
		label.align = "left";
		label.valign = "bottom"
		label.background = new am4core.RoundedRectangle()
		label.background.cornerRadius(10,10,10,10);
		label.padding(10,10,10,10);
		label.marginLeft = 30;
		label.marginBottom = 30;
		label.background.strokeOpacity = 0.3;
		label.background.fillOpacity = 0.6;

		let dataSource = chart.createChild(am4core.TextLink)
		dataSource.text = "Data source: github.com/pomber/covid19";
		dataSource.fontSize = 12;
		dataSource.align = "left";
		dataSource.valign = "top"
		dataSource.url = "https://github.com/pomber/covid19"
		dataSource.urlTarget = "_blank";
		dataSource.padding(10,10,10,10);
		dataSource.marginLeft = 30;
		dataSource.marginTop = 30;

		let gitSource = chart.createChild(am4core.Button)
		gitSource.icon = new am4core.Sprite();
		gitSource.icon.path = "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z";
		gitSource.fontSize = 12;
		gitSource.align = "right";
		gitSource.valign = "top"
		gitSource.url = "https://github.com/blazpocrnja/covid-19"
		gitSource.urlTarget = "_blank";
		gitSource.padding(10,10,10,10);
		gitSource.marginRight = 30;
		gitSource.marginTop = 30;
		gitSource.tooltipText = "View source code"

		// Set projection
		chart.projection = new am4maps.projections.Orthographic();
		chart.panBehavior = "rotateLongLat";
		chart.padding(20,20,20,20);

		// Add zoom control
		chart.zoomControl = new am4maps.ZoomControl();

		let homeButton = new am4core.Button();
		homeButton.events.on("hit", function(){
			chart.goHome();
		});

		homeButton.icon = new am4core.Sprite();
		homeButton.padding(7, 5, 7, 5);
		homeButton.width = 30;
		homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
		homeButton.marginBottom = 10;
		homeButton.parent = chart.zoomControl;
		homeButton.insertBefore(chart.zoomControl.plusButton);

		chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.1;
		chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#ffffff");
		chart.deltaLongitude = 20;
		chart.deltaLatitude = -20;

		// limits vertical rotation
		chart.adapter.add("deltaLatitude", function(deltaLatitude){
				return am4core.math.fitToRange(deltaLatitude, -90, 90);
		})

		// Create map polygon series
		let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
		polygonSeries.useGeodata = true;

		polygonSeries.calculateVisualCenter = true;
		polygonSeries.tooltip.background.fill = am4core.color("#47c78a");
		polygonSeries.tooltip.background.fillOpacity = 0.8;
		polygonSeries.tooltip.background.cornerRadius = 20;

		let template = polygonSeries.mapPolygons.template;
		template.nonScalingStroke = true;
		template.fill = am4core.color("#47c78a");
		template.stroke = am4core.color("#454a58");

		polygonSeries.calculateVisualCenter = true;
		template.propertyFields.id = "id";
		template.tooltipPosition = "fixed";
		template.fillOpacity = 1;

		template.events.on("over", function (event) {
			if (event.target.dummyData) {
				event.target.dummyData.isHover = true;
			}
		})
		template.events.on("out", function (event) {
			if (event.target.dummyData) {
				event.target.dummyData.isHover = false;
			}
		})
		template.events.on("hit", function (event) {
			onCountryClick(event.target.dataItem.dataContext.name)
		})

		let hs = polygonSeries.mapPolygons.template.states.create("hover");
		hs.properties.fillOpacity = 1;
		hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5)


		let graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());
		graticuleSeries.mapLines.template.stroke = am4core.color("#fff");
		graticuleSeries.fitExtent = false;
		graticuleSeries.mapLines.template.strokeOpacity = 0.2;
		graticuleSeries.mapLines.template.stroke = am4core.color("#fff");


		let covidSeries = chart.series.push(new am4maps.MapPolygonSeries())
		covidSeries.tooltip.background.fillOpacity = 0.8;
		covidSeries.tooltip.background.cornerRadius = 20;
		covidSeries.tooltip.autoTextColor = false;
		covidSeries.tooltip.label.fill = am4core.color("#000");
		covidSeries.tooltip.dy = -5;

		let covidTemplate = covidSeries.mapPolygons.template;
		covidTemplate.fill = am4core.color("#bf7569");
		covidTemplate.strokeOpacity = 0;
		covidTemplate.fillOpacity = 0.75;
		covidTemplate.tooltipPosition = "fixed";
		covidTemplate.events.on("hit", function (event) {
			onCountryClick(event.target.tooltipText.split(":")[0])
		})

		let hs2 = covidSeries.mapPolygons.template.states.create("hover");
		hs2.properties.fillOpacity = 1;
		hs2.properties.fill = am4core.color("#86240c");

		setPolygonSeries(polygonSeries)
		setCovidSeries(covidSeries)
	}, [])

	useEffect(() => {
		if (polygonSeriesState) {
			polygonSeriesState.mapPolygons.each(function (mapPolygon) {
				let count = 0
				let country = data[mapPolygon.dataItem.dataContext.name]
				if (country && country.length) count = country[country.length - 1].confirmed;
			
				if (count > 0) {
					let polygon = covidSeriesState.mapPolygons.create();
					polygon.multiPolygon = am4maps.getCircle(mapPolygon.visualLongitude, mapPolygon.visualLatitude, Math.max(0.2, Math.log(count) * Math.LN10 / 10));
					polygon.tooltipText = mapPolygon.dataItem.dataContext.name + ": " + count;
					mapPolygon.dummyData = polygon;
					polygon.events.on("over", function () {
						mapPolygon.isHover = true;
					})
					polygon.events.on("out", function () {
						mapPolygon.isHover = false;
					})
				}
				else {
					mapPolygon.tooltipText = mapPolygon.dataItem.dataContext.name + ": no data";
					mapPolygon.fillOpacity = 0.9;
				}
			})
		}
	}, [data])
	
	return (
		<div id="globechartdiv" style={{ width: "100%", height: "100%", backgroundColor: "#454a58"}}/>
	)
}

export default GlobeChart;