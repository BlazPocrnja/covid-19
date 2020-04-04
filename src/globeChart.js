import React, { useEffect } from 'react';
import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_continentsLow from "@amcharts/amcharts4-geodata/continentsLow";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway";

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_spiritedaway);

const GlobeChart = (props) => {
	const { data } = props

	useEffect(() => {
		let chart = am4core.create("chartdiv", am4maps.MapChart);

		try {
				chart.geodata = am4geodata_worldLow;
		}
		catch (e) {
				chart.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
		}


		let label = chart.createChild(am4core.Label)
		label.text = "12 months (3/7/2019 data) rolling measles\nincidence per 1'000'000 total population. \n Bullet size uses logarithmic scale.";
		label.fontSize = 12;
		label.align = "left";
		label.valign = "bottom"
		label.fill = am4core.color("#927459");
		label.background = new am4core.RoundedRectangle()
		label.background.cornerRadius(10,10,10,10);
		label.padding(10,10,10,10);
		label.marginLeft = 30;
		label.marginBottom = 30;
		label.background.strokeOpacity = 0.3;
		label.background.stroke =am4core.color("#927459");
		label.background.fill = am4core.color("#f9e3ce");
		label.background.fillOpacity = 0.6;

		let dataSource = chart.createChild(am4core.TextLink)
		dataSource.text = "Data source: github.com/pomber/covid19";
		dataSource.fontSize = 12;
		dataSource.align = "left";
		dataSource.valign = "top"
		dataSource.url = "https://github.com/pomber/covid19"
		dataSource.urlTarget = "_blank";
		dataSource.fill = am4core.color("#927459");
		dataSource.padding(10,10,10,10);
		dataSource.marginLeft = 30;
		dataSource.marginTop = 30;

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

		chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#bfa58d");
		chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;
		chart.deltaLongitude = 20;
		chart.deltaLatitude = -20;

		// limits vertical rotation
		chart.adapter.add("deltaLatitude", function(delatLatitude){
				return am4core.math.fitToRange(delatLatitude, -90, 90);
		})

		// Create map polygon series

		let shadowPolygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
		shadowPolygonSeries.geodata = am4geodata_continentsLow;

		try {
				shadowPolygonSeries.geodata = am4geodata_continentsLow;
		}
		catch (e) {
				shadowPolygonSeries.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
		}

		shadowPolygonSeries.useGeodata = true;
		shadowPolygonSeries.dx = 2;
		shadowPolygonSeries.dy = 2;
		shadowPolygonSeries.mapPolygons.template.fill = am4core.color("#000");
		shadowPolygonSeries.mapPolygons.template.fillOpacity = 0.2;
		shadowPolygonSeries.mapPolygons.template.strokeOpacity = 0;
		shadowPolygonSeries.fillOpacity = 0.1;
		shadowPolygonSeries.fill = am4core.color("#000");


		// Create map polygon series
		let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
		polygonSeries.useGeodata = true;

		polygonSeries.calculateVisualCenter = true;
		polygonSeries.tooltip.background.fillOpacity = 0.2;
		polygonSeries.tooltip.background.cornerRadius = 20;

		let template = polygonSeries.mapPolygons.template;
		template.nonScalingStroke = true;
		template.fill = am4core.color("#f9e3ce");
		template.stroke = am4core.color("#e2c9b0");

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
			console.log("hello")
		})

		let hs = polygonSeries.mapPolygons.template.states.create("hover");
		hs.properties.fillOpacity = 1;
		hs.properties.fill = am4core.color("#deb7ad");


		let graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());
		graticuleSeries.mapLines.template.stroke = am4core.color("#fff");
		graticuleSeries.fitExtent = false;
		graticuleSeries.mapLines.template.strokeOpacity = 0.2;
		graticuleSeries.mapLines.template.stroke = am4core.color("#fff");


		let measelsSeries = chart.series.push(new am4maps.MapPolygonSeries())
		measelsSeries.tooltip.background.fillOpacity = 0;
		measelsSeries.tooltip.background.cornerRadius = 20;
		measelsSeries.tooltip.autoTextColor = false;
		measelsSeries.tooltip.label.fill = am4core.color("#000");
		measelsSeries.tooltip.dy = -5;

		let measelTemplate = measelsSeries.mapPolygons.template;
		measelTemplate.fill = am4core.color("#bf7569");
		measelTemplate.strokeOpacity = 0;
		measelTemplate.fillOpacity = 0.75;
		measelTemplate.tooltipPosition = "fixed";



		let hs2 = measelsSeries.mapPolygons.template.states.create("hover");
		hs2.properties.fillOpacity = 1;
		hs2.properties.fill = am4core.color("#86240c");

		polygonSeries.events.on("inited", function () {
			polygonSeries.mapPolygons.each(function (mapPolygon) {
				let count = 0
				let country = data[mapPolygon.dataItem.dataContext.name]
				if (country && country.length) count = country[country.length - 1].confirmed;
				

				if (count > 0) {
					let polygon = measelsSeries.mapPolygons.create();
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
		})
	}, [])
	
	return (
		<div id="chartdiv" style={{ width: "100%", height: "100%" }}/>
	)
}

export default GlobeChart;