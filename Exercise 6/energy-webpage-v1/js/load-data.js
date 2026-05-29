// load-data.js
// Loads the CSV file and calls drawHistogram, drawScatterplot,
// populateFilters, createTooltip and handleMouseEvents.
// Wrapped in an IIFE so re-injection by the SPA is safe.
// Code based on Dufour and Meeks (2024)

(() => {

  // Load the CSV file with a row conversion function
  d3.csv("data/Ex6_TVdata.csv", d => ({
    brand:             d.brand,
    model:             d.model,
    screenSize:        +d.screenSize,        // Convert screenSize to a number
    screenTech:        d.screenTech,
    energyConsumption: +d.energyConsumption, // Convert energyConsumption to a number
    star:              +d.star               // Convert to number
  })).then(data => {

    // Log the processed data to the console
    console.log(data);

    // Filter to <= 1800 kWh/yr as noted in the exercise
    const filtered = data.filter(d => d.energyConsumption <= 1800);

    // Call functions after data is loaded
    window.ex6.drawHistogram(filtered);
    window.ex6.drawScatterplot(filtered);
    window.ex6.populateFilters(filtered);

    // Tooltip functions — called after scatterplot circles exist
    window.ex6.createTooltip();
    window.ex6.handleMouseEvents();

  }).catch(error => {
    console.error("Error loading the CSV file:", error);
    document.getElementById("histogram").innerHTML =
      `<p style="color:red">Error loading data: ${error.message}</p>`;
  });

})();   