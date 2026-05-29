const navLinks = document.querySelectorAll(".nav-links a");
const logo = document.querySelector(".logo");
const contentContainer = document.getElementById("content-container");

function setActiveLink(activeLink) {
  navLinks.forEach(link => {
    link.classList.toggle("active", link === activeLink);
  });
}

function loadPageContent(pageUrl) {
  fetch(pageUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      const content = temp.querySelector('section.page') || temp.querySelector('section');
      
      if (!content) {
        console.error('No content section found in:', pageUrl);
        contentContainer.innerHTML = '<p>Error: Could not load page content</p>';
        return;
      }
      
      const oldContent = contentContainer.querySelector('.page');
      if (oldContent) oldContent.classList.remove('active-page');
      
      contentContainer.innerHTML = '';
      const newContent = content.cloneNode(true);
      newContent.classList.add('active-page');
      contentContainer.appendChild(newContent);
      
      const scripts = temp.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src) {
          const newScript = document.createElement('script');
          newScript.src = script.src;
          newScript.onload = () => {
            if (pageUrl.includes('television') && typeof loadCharts === 'function') {
              setTimeout(loadCharts, 200);
            } else if (pageUrl.includes('data') && typeof loadStoryboardChart === 'function') {
              setTimeout(loadStoryboardChart, 200);
            }
          };
          contentContainer.appendChild(newScript);
        } else if (script.textContent) {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          contentContainer.appendChild(newScript);
        }
      });
      
      if (pageUrl.includes('television') && !scripts.length) {
        setTimeout(() => { if (typeof loadCharts === 'function') loadCharts(); }, 200);
      } else if (pageUrl.includes('data') && !scripts.length) {
        setTimeout(() => { if (typeof loadStoryboardChart === 'function') loadStoryboardChart(); }, 200);
      } else if (pageUrl.includes('exercise-5')) {
        const ex5Scripts = ['js/ex5scatter.js', 'js/ex5line.js', 'js/ex5bar.js', 'js/ex5donut.js'];
        // Load scripts sequentially so each chart div already exists in the DOM
        function loadNext(i) {
          if (i >= ex5Scripts.length) return;
          const s = document.createElement('script');
          s.src = ex5Scripts[i];
          s.onload = () => loadNext(i + 1);
          s.onerror = () => { console.error('Failed to load', ex5Scripts[i]); loadNext(i + 1); };
          contentContainer.appendChild(s);
        }
        // Small timeout ensures the injected HTML is fully in the DOM before scripts run
        setTimeout(() => loadNext(0), 50);
      } else if (pageUrl.includes('exercise-6')) {
        // Load ex6 scripts sequentially — shared-constants must be first
        // so window.ex6 namespace exists before histogram/interactions run
        const ex6Scripts = [
          'js/shared-constants.js',
          'js/histogram.js',
          'js/scatterplot.js',
          'js/interactions.js',
          'js/load-data.js'
        ];
        function loadEx6(i) {
          if (i >= ex6Scripts.length) return;
          const s = document.createElement('script');
          s.src = ex6Scripts[i];
          s.onload = () => loadEx6(i + 1);
          s.onerror = () => { console.error('Failed to load', ex6Scripts[i]); loadEx6(i + 1); };
          contentContainer.appendChild(s);
        }
        setTimeout(() => loadEx6(0), 50);
      }
    })
    .catch(error => {
      console.error('Error loading page:', error);
      contentContainer.innerHTML = '<p>Error: Could not load page. Please try again.</p>';
    });
}

if (contentContainer && navLinks.length > 0) {
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const pageUrl = link.getAttribute("href");

      if (pageUrl.includes("exercise-4.html")) {
        return; // don't preventDefault, let browser navigate
      }

      e.preventDefault();
      loadPageContent(pageUrl);
      setActiveLink(link);
    });
  });

  if (logo) {
    logo.addEventListener("click", () => {
      loadPageContent("home.html");
      const homeLink = document.querySelector('.nav-links a[href="home.html"]');
      if (homeLink) setActiveLink(homeLink);
    });
  }
  
  // If returning from exercise-4.html via ?page=xxx, load that page; otherwise load home
  const params = new URLSearchParams(window.location.search);
  const initialPage = params.get('page') || 'home.html';
  const initialLink = document.querySelector(`.nav-links a[href="${initialPage}"]`)
    || document.querySelector('.nav-links a[href="home.html"]');
  if (initialLink) setActiveLink(initialLink);
  loadPageContent(initialPage);
}



function renderBarChart(containerId, data, config) {
  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove();

  const margin = { top: 40, right: 30, bottom: 100, left: 70 };
  const width = Math.max(container.node().clientWidth, (config.minWidth || 700));
  const height = 460;
  const svg = container.append("svg").attr("width", width).attr("height", height);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(data.map(d => d[config.xKey]))
    .range([0, innerWidth])
    .padding(0.22);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[config.yKey]) * 1.1])
    .nice()
    .range([innerHeight, 0]);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  g.append("g").call(d3.axisLeft(y).ticks(6)).selectAll("text").style("font-size", "12px");

  const xAxis = g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  if (config.rotateX) {
    xAxis.selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.4em");
  }

  g.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d[config.xKey]))
      .attr("y", d => y(d[config.yKey]))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d[config.yKey]))
      .attr("fill", config.color || "#5470C6");

  g.selectAll(".label")
    .data(data)
    .join("text")
      .attr("class", "label")
      .attr("x", d => x(d[config.xKey]) + x.bandwidth() / 2)
      .attr("y", d => y(d[config.yKey]) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text(d => d[config.yKey] != null ? d3.format(config.valueFormat || ",.0f")(d[config.yKey]) : "");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "700")
    .text(config.title || "");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(config.yLabel || "");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(config.xLabel || "");
}

function renderScatterPlot(containerId, data, config) {
  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove();

  const margin = { top: 40, right: 40, bottom: 70, left: 70 };
  const width = Math.max(container.node().clientWidth, (config.minWidth || 700));
  const height = 460;
  const svg = container.append("svg").attr("width", width).attr("height", height);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => +d[config.xKey]))
    .nice()
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => +d[config.yKey]))
    .nice()
    .range([innerHeight, 0]);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  g.append("g").call(d3.axisLeft(y).ticks(6)).selectAll("text").style("font-size", "12px");

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("~s")))
    .selectAll("text")
      .attr("font-size", "12px");

  if (config.line) {
    const line = d3.line()
      .x(d => x(d[config.xKey]))
      .y(d => y(d[config.yKey]));

    g.append("path")
      .datum(data.slice().sort((a, b) => a[config.xKey] - b[config.xKey]))
      .attr("fill", "none")
      .attr("stroke", config.color || "#5470C6")
      .attr("stroke-width", 2)
      .attr("d", line);
  }

  g.selectAll(".dot")
    .data(data)
    .join("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d[config.xKey]))
      .attr("cy", d => y(d[config.yKey]))
      .attr("r", 4.5)
      .attr("fill", config.color || "#5470C6")
      .attr("opacity", 0.75);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "700")
    .text(config.title || "");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(config.yLabel || "");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(config.xLabel || "");
}

function loadCharts() {
  Promise.all([
    d3.csv("data/q1.csv", d => ({ screenTech: d.Screen_Tech, count: +d["Count*(Submit_ID)"] })),
    d3.csv("data/q2.csv", d => ({ screenSize: +d.Screen_Size_Category, count: +d["Count*(Submit_ID)"] })),
    d3.csv("data/q3.csv", d => ({ brand: d.Brand_Reg, count: +d["Count*(Submit_ID)"] })),
    d3.csv("data/q4.csv", d => ({ screenTech: d.Screen_Tech, avgPower: +d["Min*(Avg_mode_power)"] })),
    d3.csv("data/q5.csv", d => ({ screenInch: +d.screenInch, avgPower: +d["Avg_mode_power"] })),
    d3.csv("data/q6.csv", d => ({ star: +d.Star, screenSize: +d.Screen_Size_Category })),
    d3.csv("data/q7.csv", d => ({ brand: d.Brand_Reg, avgPower: +d["Mean(Avg_mode_power)"] })),
    d3.csv("data/q8.csv", d => ({ star: +d.Star, avgPower: +d["Avg_mode_power"] }))
  ]).then(([q1, q2, q3, q4, q5, q6, q7, q8]) => {
    q2.sort((a, b) => a.screenSize - b.screenSize);

    renderBarChart("chart-q1", q1, {
      title: "Screen Technologies by Count",
      xLabel: "Screen Technology",
      yLabel: "Count",
      xKey: "screenTech",
      yKey: "count",
      color: "#5470C6"
    });

    renderBarChart("chart-q2", q2, {
      title: "Screen Size Frequency",
      xLabel: "Screen Size (inches)",
      yLabel: "Count",
      xKey: "screenSize",
      yKey: "count",
      color: "#91CC75"
    });

    renderBarChart("chart-q3", q3.sort((a, b) => b.count - a.count).slice(0, 20), {
      title: "Top 20 Brands by Model Count",
      xLabel: "Brand",
      yLabel: "Count",
      xKey: "brand",
      yKey: "count",
      color: "#FAC858",
      rotateX: true,
      valueFormat: ",.0f"
    });

    renderBarChart("chart-q4", q4, {
      title: "Average Power by Screen Technology",
      xLabel: "Screen Technology",
      yLabel: "Average Power (Watts)",
      xKey: "screenTech",
      yKey: "avgPower",
      color: "#EE6666",
      valueFormat: ",.1f"
    });

    renderScatterPlot("chart-q5", q5, {
      title: "Screen Size vs Average Power",
      xLabel: "Screen Size (inches)",
      yLabel: "Average Power (Watts)",
      xKey: "screenInch",
      yKey: "avgPower",
      color: "#73C0DE",
      line: false
    });

    if (typeof loadStoryboardChart === "function") {
      loadStoryboardChart(q5);
    }

    renderScatterPlot("chart-q6", q6, {
      title: "Star Rating vs Screen Size",
      xLabel: "Screen Size (inches)",
      yLabel: "Star Rating",
      xKey: "screenSize",
      yKey: "star",
      color: "#91CC75"
    });

    renderBarChart("chart-q7", q7.sort((a, b) => a.avgPower - b.avgPower).slice(0, 20), {
      title: "Top 20 Brands by Average Power",
      xLabel: "Brand",
      yLabel: "Average Power (Watts)",
      xKey: "brand",
      yKey: "avgPower",
      color: "#EE6666",
      rotateX: true,
      valueFormat: ",.1f"
    });

    const q8agg = Array.from(d3.rollup(q8, v => d3.mean(v, d => d.avgPower), d => d.star), ([star, avgPower]) => ({ star, avgPower }))
      .sort((a, b) => a.star - b.star);

    renderBarChart("chart-q8", q8agg, {
      title: "Average Power by Star Rating",
      xLabel: "Star Rating",
      yLabel: "Average Power (Watts)",
      xKey: "star",
      yKey: "avgPower",
      color: "#5470C6",
      valueFormat: ",.1f"
    });

  }).catch(error => {
    console.error("Error loading chart data:", error);
  });
}

if (typeof d3 !== "undefined" && document.querySelector("[id^='chart-']")) {
  loadCharts();
}

// Dropdown click-to-toggle
document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdown = trigger.closest('.dropdown');
    const isOpen = dropdown.classList.contains('open');
    
    // Close all dropdowns first
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    
    // Toggle this one
    if (!isOpen) dropdown.classList.add('open');
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  }
});

// ===== Exercise 4.3 =====
function renderExercise43() {
  const container = document.querySelector(".responsive-svg-container");
  if (!container) return;

  container.innerHTML = "";

  const svg = d3.select(".responsive-svg-container")
    .append("svg")
      .attr("viewBox", "0 0 1200 1600")
      .style("border", "1px solid black");

  svg
    .append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 414)
      .attr("height", 16)
      .attr("fill", "blue");
}

d3.csv("./data/tv_2026_03_26.csv", d => {
  return {
    brand: d.Brand_Reg,
    Star2: +d.Star2 //=> converts to number
  };

}).then(data => {
  console.log(data);
});

function renderExercise45() {
  const container = document.querySelector(".responsive-svg-container2");
  if (!container) return;

  container.innerHTML = "";

  d3.csv("./data/tv_2026_03_26.csv", d => ({
    brand: d.Brand_Reg,
    star: +d.Star2
  })).then(data => {

    // Aggregate: count per star rating
    const counts = Array.from(
      d3.rollup(data, v => v.length, d => d.star),
      ([star, count]) => ({ star, count })
    ).sort((a, b) => a.star - b.star);

    const svg = d3.select(".responsive-svg-container2")
      .append("svg")
        .attr("viewBox", "0 0 1200 1600")
        .style("border", "1px solid black");

    // Step 2 & 3 constants
    const barHeight = 40;       // constant height for every bar
    const barSpacing = 60;      // spacing between bars (barHeight + gap)
    const xOffset = 100;        // left offset to leave room for labels later
    const maxCount = d3.max(counts, d => d.count);
    const maxBarWidth = 1000;   // available width for bars inside the SVG

    svg.selectAll("rect")
      .data(counts)
      .join("rect")
        .attr("class", d => `bar bar-${d.star}`)
        .attr("x", xOffset)                          // Step 3: x is constant
        .attr("y", (d, i) => i * barSpacing + 20)    // Step 3: y based on index + spacing
        .attr("width", d => (d.count / maxCount) * maxBarWidth)  // Step 2: relative to count
        .attr("height", barHeight)                   // Step 2: constant height
        .attr("fill", "#5470C6");

  }).catch(err => console.error("Error loading CSV:", err));
}

function renderExercise46() {
  const container = document.querySelector(".responsive-svg-container3");
  if (!container) return;

  container.innerHTML = "";

  d3.csv("./data/tv_2026_03_26.csv", d => ({
    brand: d.Brand_Reg,
    star: +d.Star2
  })).then(data => {

    // Aggregate: count per brand
    const counts = Array.from(
      d3.rollup(data, v => v.length, d => d.brand),
      ([brand, count]) => ({ brand, count })
    ).sort((a, b) => b.count - a.count);

    const svgWidth = 500;
    const svgHeight = 1600;
    const xOffset = 120; // room for brand labels on the left

    const svg = d3.select(".responsive-svg-container3")
      .append("svg")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .style("border", "1px solid black");

    // Step 1: Linear scale for count (x-axis)
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(counts, d => d.count)])
      .range([0, svgWidth - xOffset - 40]); // 40px right padding for count labels

    // Step 2: Band scale for brands (y-axis)
    const yScale = d3.scaleBand()
      .domain(counts.map(d => d.brand))
      .range([0, svgHeight])
      .padding(0.2);

    // Step 3: Group container — keeps bar + labels together
    const barAndLabel = svg
      .selectAll("g")
      .data(counts)
      .join("g")
        .attr("transform", d => `translate(0, ${yScale(d.brand)})`);

    // Step 4: Add rectangles to each group
    barAndLabel
      .append("rect")
        .attr("x", xOffset)
        .attr("y", 0)                          // y is handled by the group's transform
        .attr("width", d => xScale(d.count))
        .attr("height", yScale.bandwidth())
        .attr("fill", "#5470C6");

    // Step 5: Add brand name label (left of bar)
    barAndLabel
      .append("text")
        .text(d => d.brand)
        .attr("x", xOffset - 4)               // just left of the bar
        .attr("y", yScale.bandwidth() / 2)    // vertically centered on bar
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "end")
        .style("font-family", "sans-serif")
        .style("font-size", "8px");

    // Step 6: Add count label (right of bar)
    barAndLabel
      .append("text")
        .text(d => d.count)
        .attr("x", d => xOffset + xScale(d.count) + 4)  // just right of bar end
        .attr("y", yScale.bandwidth() / 2)               // vertically centered
        .attr("dominant-baseline", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "8px");

  }).catch(err => console.error("Error loading CSV:", err));
}