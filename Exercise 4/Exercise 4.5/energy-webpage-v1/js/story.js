function loadStoryboardChart(q5) {
  if (!document.getElementById("chart-storyboard")) {
    return;
  }

  renderScatterPlot("chart-storyboard", q5, {
    title: "Screen Size vs Average Power",
    xLabel: "Screen Size (inches)",
    yLabel: "Average Power (Watts)",
    xKey: "screenInch",
    yKey: "avgPower",
    color: "#73C0DE",
    line: false
  });
}

function loadStoryboardChart() {
  d3.csv("data/q5.csv", d => ({ screenInch: +d.screenInch, avgPower: +d["Avg_mode_power"] }))
    .then(q5 => {
      renderScatterPlot("chart-storyboard", q5, {
        title: "Screen Size vs Average Power",
        xLabel: "Screen Size (inches)",
        yLabel: "Average Power (Watts)",
        xKey: "screenInch",
        yKey: "avgPower",
        color: "#73C0DE",
        line: false
      });
    })
    .catch(error => console.error("Error loading storyboard chart:", error));
}

if (document.getElementById("chart-storyboard")) {
  loadStoryboardChart();
}
