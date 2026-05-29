// shared-constants.js
// Shared dimensions, colours, scales, bin generator and filter arrays.
// Uses a window.ex6 namespace so all other ex6 files can access these
// without const re-declaration errors when the SPA re-injects scripts.
// Code based on Dufour and Meeks (2024)

window.ex6 = {};

/******************************************/
/*  Set up dimensions and margins         */
/******************************************/
window.ex6.margin      = { top: 40, right: 30, bottom: 50, left: 70 };
window.ex6.width       = 800;
window.ex6.height      = 400;
window.ex6.innerWidth  = window.ex6.width  - window.ex6.margin.left - window.ex6.margin.right;
window.ex6.innerHeight = window.ex6.height - window.ex6.margin.top  - window.ex6.margin.bottom;

/******************************************/
/*  Make the colours accessible globally  */
/******************************************/
window.ex6.barColor            = "#606464";
window.ex6.bodyBackgroundColor = "#f4f8fb"; // matches site background

/******************************************/
/*  Histogram scales                      */
/******************************************/
window.ex6.xScale = d3.scaleLinear();
window.ex6.yScale = d3.scaleLinear();

/******************************************/
/*  Scatterplot-specific variables        */
/******************************************/
// innerChartS is declared with let so scatterplot.js can assign to it
window.ex6.innerChartS = null;

// Separate scales for the scatterplot so they don't clash with the histogram
window.ex6.xScaleS = d3.scaleLinear();
window.ex6.yScaleS = d3.scaleLinear();

// Colour scale to distinguish screen technologies
window.ex6.colorScale = d3.scaleOrdinal();

// Tooltip dimensions
window.ex6.tooltipWidth  = 65;
window.ex6.tooltipHeight = 32;

/******************************************/
/*  Create a bin generator using d3.bin   */
/******************************************/
window.ex6.binGenerator = d3.bin()
  .value(d => d.energyConsumption)  // Accessor for energyConsumption
  .domain([0, 1800])                 // cap at 1,800 kWh/yr as per exercise
  .thresholds(18);                   // ~200 kWh wide bins

/******************************************/
/*  Make the filter options accessible    */
/*  globally                              */
/******************************************/

// Screen technology filters
window.ex6.filters_screen = [
  { id: "all",       label: "All",  isActive: true  },
  { id: "LCD (LED)", label: "LED",  isActive: false },
  { id: "LCD",       label: "LCD",  isActive: false },
  { id: "OLED",      label: "OLED", isActive: false }
];

// Screen size filters (most frequent + largest)
window.ex6.filters_size = [
  { id: "all", label: 'All Sizes', isActive: true  },
  { id: "24",  label: '24"',       isActive: false },
  { id: "32",  label: '32"',       isActive: false },
  { id: "55",  label: '55"',       isActive: false },
  { id: "65",  label: '65"',       isActive: false },
  { id: "98",  label: '98"',       isActive: false }
];