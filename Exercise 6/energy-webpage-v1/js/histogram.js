// histogram.js
// Draws the histogram of TV energy consumption.
// Reads shared state from window.ex6 (set in shared-constants.js).
// Wrapped in an IIFE so re-injection by the SPA is safe.
// Code based on Dufour and Meeks (2024)

(() => {

  const { margin, width, height, innerWidth, innerHeight,
          barColor, bodyBackgroundColor, xScale, yScale,
          binGenerator } = window.ex6;

  function drawHistogram(data) {

    // Clear any previous render (safe on SPA revisit)
    d3.select("#histogram").selectAll("*").remove();

    /******************************************/
    /*  Set the dimensions and margins of     */
    /*  the chart area                        */
    /******************************************/
    const svg = d3.select("#histogram")
      .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`) // Responsive SVG
        .style("width", "100%")
        .style("height", "auto");

    // Create an inner chart group with margins
    const innerChart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    /******************************************/
    /*  Generate the bins                     */
    /******************************************/
    const bins = binGenerator(data); // save the bins into an array

    console.log(bins); // Log the bins to the console for debugging

    /******************************************/
    /*  Define scales (from shared constants) */
    /******************************************/
    const minEng        = bins[0].x0;                    // lower bound of the first bin
    const maxEng        = bins[bins.length - 1].x1;      // upper bound of the last bin
    const binsMaxLength = d3.max(bins, d => d.length);   // maximum frequency across bins

    xScale
      .domain([minEng, maxEng])
      .range([0, innerWidth]);

    yScale
      .domain([0, binsMaxLength])
      .range([innerHeight, 0])
      .nice(); // Use the nice() method to round the y-axis values

    /******************************************/
    /*  Draw the bars of the histogram        */
    /******************************************/
    innerChart
      .selectAll("rect")
      .data(bins)
      .join("rect")
        .attr("x",      d => xScale(d.x0))
        .attr("y",      d => yScale(d.length))
        .attr("width",  d => Math.max(0, xScale(d.x1) - xScale(d.x0)))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill",   barColor)
        .attr("stroke", bodyBackgroundColor) // stroke gives appearance of gap between bars
        .attr("stroke-width", 2);

    /******************************************/
    /*  Add axes                              */
    /******************************************/
    const bottomAxis = d3.axisBottom(xScale).ticks(9).tickFormat(d3.format(","));

    // Add the x-axis to the bottom of the chart relative to the inner chart
    innerChart
      .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    // Add the x-axis label
    svg
      .append("text")
        .text("Labeled Energy Consumption (kWh/year)")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", height - 5)
        .attr("class", "axis-label");

    const leftAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(","));

    // Add the y-axis to the left of the chart relative to the inner chart
    innerChart
      .append("g")
        .attr("class", "y-axis")
        .call(leftAxis);

    // Add the y-axis label
    svg
      .append("text")
        .text("Frequency")
        .attr("x", 30)
        .attr("y", 20)
        .attr("class", "axis-label");
  }

  // Expose drawHistogram so load-data.js can call it
  window.ex6.drawHistogram = drawHistogram;

})();