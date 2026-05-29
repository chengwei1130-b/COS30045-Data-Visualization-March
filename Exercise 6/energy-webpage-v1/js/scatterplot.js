// scatterplot.js
// Draws the scatterplot of Energy Consumption vs Star Rating,
// colour-coded by screen technology with a legend.
// Reads and writes shared state from window.ex6 (set in shared-constants.js).
// Wrapped in an IIFE so re-injection by the SPA is safe.
// Code based on Dufour and Meeks (2024)

(() => {

  const drawScatterplot = (data) => {

    const { margin, width, height, innerWidth, innerHeight,
            xScaleS, yScaleS, colorScale } = window.ex6;

    /******************************************/
    /*  Clear any previous render             */
    /******************************************/
    d3.select("#scatterplot").selectAll("*").remove();

    /******************************************/
    /*  Set up the SVG and inner chart group  */
    /*  NOTE: innerChartS is assigned to      */
    /*  window.ex6 (not declared with const)  */
    /*  so tooltip code can access it too.    */
    /******************************************/
    const svg = d3.select("#scatterplot")
      .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto");

    // Assign to the shared namespace — NOT re-declared with const
    window.ex6.innerChartS = svg
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    /******************************************/
    /*  Set up x and y scales                 */
    /******************************************/
    const maxStar = d3.max(data, d => d.star);
    const maxEnergy = d3.max(data, d => d.energyConsumption);

    xScaleS
      .domain([0, maxStar + 0.5])
      .range([0, innerWidth]);

    yScaleS
      .domain([0, maxEnergy * 1.05])
      .range([innerHeight, 0])
      .nice();

    /******************************************/
    /*  Set up colour scale                   */
    /******************************************/
    colorScale
      .domain(data.map(d => d.screenTech))   // unique screen tech values
      .range(d3.schemeCategory10);            // predefined categorical colour scheme

    /******************************************/
    /*  Draw circles                          */
    /******************************************/
    window.ex6.innerChartS
      .selectAll("circle")
      .data(data)
      .join("circle")
        .attr("cx",      d => xScaleS(d.star))
        .attr("cy",      d => yScaleS(d.energyConsumption))
        .attr("r",       5)
        .attr("fill",    d => colorScale(d.screenTech))
        .attr("opacity", 0.5);
    // No stroke, as per exercise instructions

    /******************************************/
    /*  Add axes                              */
    /******************************************/
    const bottomAxis = d3.axisBottom(xScaleS).ticks(8);

    window.ex6.innerChartS
      .append("g")
        .attr("class", "x-axis-s")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    // X-axis label
    svg
      .append("text")
        .text("Star Rating")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", height - 5)
        .attr("class", "axis-label");

    const leftAxis = d3.axisLeft(yScaleS).ticks(6).tickFormat(d3.format(","));

    window.ex6.innerChartS
      .append("g")
        .attr("class", "y-axis-s")
        .call(leftAxis);

    // Y-axis label
    svg
      .append("text")
        .text("Labeled Energy Consumption (kWh/year)")
        .attr("x", 14)
        .attr("y", 20)
        .attr("class", "axis-label");

    /******************************************/
    /*  Add legend                            */
    /******************************************/
    const techTypes = [...new Set(data.map(d => d.screenTech))];

    const legend = window.ex6.innerChartS
      .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth - 90}, 10)`);

    techTypes.forEach((tech, i) => {
      const legendRow = legend
        .append("g")
          .attr("transform", `translate(0, ${i * 22})`);

      legendRow
        .append("rect")
          .attr("width",  14)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", colorScale(tech));

      legendRow
        .append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("font-size", "13px")
          .attr("fill", "#3b1f0a")
          .text(tech === "LCD (LED)" ? "LED" : tech);
    });

  };

  // Expose drawScatterplot so load-data.js can call it
  window.ex6.drawScatterplot = drawScatterplot;

})();