// interactions.js
// Filter buttons, histogram update logic, and scatterplot tooltip.
// Reads shared state from window.ex6 (set in shared-constants.js).
// Wrapped in an IIFE so re-injection by the SPA is safe.
// Code based on Dufour and Meeks (2024)

(() => {

  const { innerHeight, yScale, binGenerator,
          filters_screen, filters_size } = window.ex6;

  const populateFilters = (data) => {

    /******************************************/
    /*  Build screen TECHNOLOGY filter buttons */
    /******************************************/
    d3.select("#filters_screen")
      .selectAll(".filter")
      .data(filters_screen)
      .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .text(d => d.label)
        .on("click", (e, d) => {

          console.log("Clicked filter:", e);
          console.log("Clicked filter data:", d);

          if (!d.isActive) {

            // Make sure button clicked is not already active
            filters_screen.forEach(filter => {
              filter.isActive = d.id === filter.id ? true : false;
            });

            // Update the filter buttons based on which one was clicked
            d3.selectAll("#filters_screen .filter")
              .classed("active", filter => filter.id === d.id ? true : false);

            const activeSizeId = (filters_size.find(f => f.isActive) || {}).id || "all";
            updateHistogram(d.id, activeSizeId, data);
          }
        });

    /******************************************/
    /*  Build screen SIZE filter buttons      */
    /******************************************/
    d3.select("#filters_size")
      .selectAll(".filter")
      .data(filters_size)
      .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .text(d => d.label)
        .on("click", (e, d) => {

          if (!d.isActive) {

            filters_size.forEach(filter => {
              filter.isActive = d.id === filter.id ? true : false;
            });

            d3.selectAll("#filters_size .filter")
              .classed("active", filter => filter.id === d.id ? true : false);

            const activeTechId = (filters_screen.find(f => f.isActive) || {}).id || "all";
            updateHistogram(activeTechId, d.id, data);
          }
        });

    /******************************************/
    /*  updateHistogram function              */
    /******************************************/
    const updateHistogram = (techFilterId, sizeFilterId, data) => {

      // 1. Filter data based on both active filters
      let updatedData = data;

      if (techFilterId !== "all") {
        updatedData = updatedData.filter(tv => tv.screenTech === techFilterId);
      }

      if (sizeFilterId !== "all") {
        updatedData = updatedData.filter(tv => tv.screenSize === +sizeFilterId);
      }

      // 2. If no data matches the filter, hide bars and show a message
      const noDataMsg = d3.select("#histogram .no-data-msg");

      if (updatedData.length === 0) {
        // Hide all bars
        d3.selectAll("#histogram rect")
          .transition().duration(300)
          .attr("height", 0)
          .attr("y", innerHeight);

        // Show "No data available" message if not already there
        if (noDataMsg.empty()) {
          d3.select("#histogram svg")
            .append("text")
              .attr("class", "no-data-msg")
              .attr("x", "50%")
              .attr("y", "50%")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("font-size", "18px")
              .attr("font-weight", "600")
              .attr("fill", "#999")
              .text("No data available for this combination");
        }
        return;
      }

      // 3. Remove "No data" message if it exists
      noDataMsg.remove();

      // 4. Use filtered data to update the bins using binGenerator
      const updatedBins = binGenerator(updatedData);

      // 5. Update y scale domain to match new data
      const newMax = d3.max(updatedBins, d => d.length) || 0;
      yScale.domain([0, newMax]).nice();

      // 6. Update the histogram rectangles with a smooth transition
      d3.selectAll("#histogram rect")
        .data(updatedBins)
        .transition()
          .duration(500)
          .ease(d3.easeCubicInOut)
          .attr("y",      d => yScale(d.length))
          .attr("height", d => innerHeight - yScale(d.length));

      // 7. Animate the y-axis to reflect new scale
      d3.select("#histogram .y-axis")
        .transition()
          .duration(500)
          .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(",")));
    };

  };

  /******************************************/
  /*  createTooltip                         */
  /*  Appends tooltip group to innerChartS  */
  /******************************************/
  const createTooltip = () => {

    const { innerChartS, tooltipWidth, tooltipHeight, barColor } = window.ex6;

    // Step 3.2 — Append tooltip group to the scatterplot's inner chart
    // Start invisible so it only appears on mouse events
    const tooltip = innerChartS
      .append("g")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Step 3.3 — Background rectangle with rounded corners and slight transparency
    tooltip
      .append("rect")
        .attr("width",        tooltipWidth)
        .attr("height",       tooltipHeight)
        .attr("rx",           3)
        .attr("ry",           3)
        .attr("fill",         barColor)
        .attr("fill-opacity", 0.75);

    // Step 3.4 — Tooltip text, centred inside the rectangle
    tooltip
      .append("text")
        .attr("class",              "tooltip-text")
        .text("NA")
        .attr("x",                  tooltipWidth / 2)
        .attr("y",                  tooltipHeight / 2 + 2)
        .attr("text-anchor",        "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill",               "white")
        .style("font-weight",       900);

  };

  /******************************************/
  /*  handleMouseEvents                     */
  /*  Attaches mouseenter / mouseleave to   */
  /*  all circles in the scatterplot        */
  /******************************************/
  const handleMouseEvents = () => {

    const { tooltipWidth, tooltipHeight } = window.ex6;

    // Step 3.6 — Select all circles in the scatterplot
    window.ex6.innerChartS
      .selectAll("circle")

      // Step 3.7 — Attach event listeners
      .on("mouseenter", (e, d) => {

        console.log("Mouse entered circle", d);

        // 1. Update tooltip text with labelled energy consumption
        d3.select(".tooltip-text")
          .text(`${d3.format(",")(d.energyConsumption)}`);

        // 2. Get the circle's centre position from its SVG attributes
        const cx = e.target.getAttribute("cx");
        const cy = e.target.getAttribute("cy");

        // 3. Position tooltip above the circle and fade it in
        d3.select(".tooltip")
          .attr("transform",
            `translate(${cx - 0.5 * tooltipWidth}, ${cy - 1.5 * tooltipHeight})`)
          .transition()
            .duration(200)
            .style("opacity", 1);
      })

      .on("mouseleave", (e, d) => {

        console.log("Mouse left circle", d);

        // 4. Hide tooltip and move it off-screen so it doesn't block other elements
        d3.select(".tooltip")
          .style("opacity", 0)
          .attr("transform", "translate(0, 500)");
      });

  };

  // Expose all three functions so load-data.js can call them
  window.ex6.populateFilters    = populateFilters;
  window.ex6.createTooltip      = createTooltip;
  window.ex6.handleMouseEvents  = handleMouseEvents;

})();