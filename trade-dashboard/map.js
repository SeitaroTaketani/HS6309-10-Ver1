const TradeMap = {
    isoMap: {
        "4": "AFG", "8": "ALB", "12": "DZA", "24": "AGO", "32": "ARG", "51": "ARM", "36": "AUS",
        "40": "AUT", "31": "AZE", "44": "BHS", "48": "BHR", "50": "BGD", "52": "BRB", "112": "BLR",
        "56": "BEL", "84": "BLZ", "204": "BEN", "64": "BTN", "68": "BOL", "70": "BIH", "72": "BWA",
        "76": "BRA", "96": "BRN", "100": "BGR", "854": "BFA", "108": "BDI", "116": "KHM", "120": "CMR",
        "124": "CAN", "140": "CAF", "148": "TCD", "152": "CHL", "156": "CHN", "170": "COL", "174": "COM",
        "178": "COG", "180": "COD", "188": "CRI", "384": "CIV", "191": "HRV", "192": "CUB", "196": "CYP",
        "203": "CZE", "208": "DNK", "262": "DJI", "214": "DOM", "218": "ECU", "818": "EGY", "222": "SLV",
        "226": "GNQ", "232": "ERI", "233": "EST", "231": "ETH", "242": "FJI", "246": "FIN", "250": "FRA",
        "266": "GAB", "270": "GMB", "268": "GEO", "276": "DEU", "288": "GHA", "300": "GRC", "304": "GRL",
        "308": "GRD", "320": "GTM", "324": "GIN", "624": "GNB", "328": "GUY", "332": "HTI", "340": "HND",
        "344": "HKG", "348": "HUN", "352": "ISL", "356": "IND", "360": "IDN", "364": "IRN", "368": "IRQ",
        "372": "IRL", "376": "ISR", "380": "ITA", "388": "JAM", "392": "JPN", "400": "JOR", "398": "KAZ",
        "404": "KEN", "408": "PRK", "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO", "428": "LVA",
        "422": "LBN", "426": "LSO", "430": "LBR", "434": "LBY", "440": "LTU", "442": "LUX", "807": "MKD",
        "450": "MDG", "454": "MWI", "458": "MYS", "462": "MDV", "466": "MLI", "470": "MLT", "478": "MRT",
        "480": "MUS", "484": "MEX", "498": "MDA", "496": "MNG", "499": "MNE", "504": "MAR", "508": "MOZ",
        "104": "MMR", "516": "NAM", "524": "NPL", "528": "NLD", "540": "NCL", "554": "NZL", "558": "NIC",
        "562": "NER", "566": "NGA", "578": "NOR", "512": "OMN", "586": "PAK", "591": "PAN", "598": "PNG",
        "600": "PRY", "604": "PER", "608": "PHL", "616": "POL", "620": "PRT", "630": "PRI", "634": "QAT",
        "642": "ROU", "643": "RUS", "646": "RWA", "682": "SAU", "686": "SEN", "688": "SRB", "694": "SLE",
        "702": "SGP", "703": "SVK", "705": "SVN", "90": "SLB", "706": "SOM", "710": "ZAF", "728": "SSD",
        "724": "ESP", "144": "LKA", "729": "SDN", "740": "SUR", "748": "SWZ", "752": "SWE", "756": "CHE",
        "760": "SYR", "158": "TWN", "762": "TJK", "834": "TZA", "764": "THA", "626": "TLS", "768": "TGO",
        "780": "TTO", "788": "TUN", "792": "TUR", "795": "TKM", "800": "UGA", "804": "UKR", "784": "ARE",
        "826": "GBR", "840": "USA", "858": "URY", "860": "UZB", "548": "VUT", "862": "VEN", "704": "VNM",
        "732": "ESH", "887": "YEM", "894": "ZMB", "716": "ZWE"
    },

    svg: null,
    g: null,
    projection: null,
    path: null,
    width: 0,
    height: 0,
    
    init() {
        const container = document.getElementById("map-container");
        container.innerHTML = ''; 
        
        this.width = container.getBoundingClientRect().width;
        this.height = container.getBoundingClientRect().height;

        this.svg = d3.select("#map-container").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("background", STATE.mapMode === 'globe' 
                ? "radial-gradient(circle at center, #1e293b 0%, #020617 100%)" 
                : "#0f172a");

        this.g = this.svg.append("g");

        this.updateProjection();

        const drag = d3.drag().on("drag", (event) => {
            if (STATE.mapMode === 'globe') {
                const rotate = this.projection.rotate();
                const k = 75 / this.projection.scale();
                this.projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
                this.renderStaticMap();
                this.renderFlows();
            }
        });
        
        if (STATE.mapMode === 'globe') {
            this.svg.call(drag);
        }
        
        this.renderStaticMap();
    },

    updateProjection() {
        if (STATE.mapMode === 'globe') {
            this.projection = d3.geoOrthographic()
                .scale(Math.min(this.width, this.height) / 2.2)
                .translate([this.width / 2, this.height / 2])
                .clipAngle(90);
        } else {
            this.projection = d3.geoEquirectangular()
                .scale(this.width / 6.5)
                .translate([this.width / 2, this.height / 1.8]);
        }
        this.path = d3.geoPath().projection(this.projection);
    },

    renderStaticMap() {
        if (!STATE.geoData) return;
        this.g.selectAll(".land-group").remove();
        
        const group = this.g.append("g").attr("class", "land-group");

        const graticule = d3.geoGraticule();
        group.append("path")
            .datum(graticule())
            .attr("class", "graticule")
            .attr("d", this.path)
            .attr("fill", "none")
            .attr("stroke", "#334155")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.2);

        group.selectAll("path.land")
            .data(STATE.geoData.features)
            .enter().append("path")
            .attr("class", "land")
            .attr("d", this.path)
            .attr("fill", "#1e293b")
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 0.5)
            .on("mouseover", function() { d3.select(this).attr("fill", "#334155"); })
            .on("mouseout", function() { d3.select(this).attr("fill", "#1e293b"); });
    },

    renderFlows() {
        let flows = STATE.filteredData;
        
        if (STATE.mapMode === 'flat') {
            flows = flows.filter(d => {
                const s = STATE.countryCoords[d.exporter];
                const t = STATE.countryCoords[d.importer];
                if (!s || !t) return false;
                return Math.abs(s[0] - t[0]) < 180;
            });
        }
        
        this.g.selectAll(".flow-group").remove();
        if (!flows || flows.length === 0) {
            this.renderLegend();
            return;
        }

        const flowGroup = this.g.append("g").attr("class", "flow-group");
        
        const isIntegrated = (STATE.metric === 'integrated');
        let metricKey = STATE.metric;
        if (metricKey === 'unit_price') metricKey = 'unitPrice';
        
        const maxValue = d3.max(flows, d => d.value) || 1; 

        // Get Configuration
        let colors, thresholds;
        if (!isIntegrated) {
             colors = CONFIG.colors[STATE.metric].discrete;
             thresholds = CONFIG.thresholds[STATE.metric][STATE.hsCode];
        }

        const widthScale = d3.scaleSqrt().domain([0, maxValue]).range([0.5, 3]);

        // --- 1. Draw Lines ---
        const linesToDraw = flows.sort((a,b) => b.value - a.value).slice(0, 500);

        flowGroup.selectAll(".trade-arc")
            .data(linesToDraw)
            .enter().append("path")
            .attr("class", "trade-arc")
            .attr("d", d => {
                const source = STATE.countryCoords[d.exporter];
                const target = STATE.countryCoords[d.importer];
                if (source && target) return this.path({type: "LineString", coordinates: [source, target]});
                return null;
            })
            .attr("stroke", d => {
                if (isIntegrated) {
                    const th = CONFIG.thresholds.value[STATE.hsCode];
                    if (d.value >= th.large) return CONFIG.colors.integrated.line.large;
                    if (d.value >= th.medium) return CONFIG.colors.integrated.line.medium;
                    return CONFIG.colors.integrated.line.small;
                } else {
                    // Standard Mode: 3-step color based on metric
                    const val = d[metricKey];
                    if (val >= thresholds.large) return colors.large;
                    if (val >= thresholds.medium) return colors.medium;
                    return colors.small;
                }
            })
            .attr("stroke-width", d => widthScale(d.value))
            .attr("stroke-opacity", isIntegrated ? 0.3 : 0.5); // Integratedは少し薄く

        // --- 2. Draw Particles ---
        const topFlows = flows.sort((a,b) => b.value - a.value).slice(0, 150);
        const particleCountScale = d3.scaleLinear().domain([0, maxValue]).range([1, 4]).clamp(true);

        topFlows.forEach(d => {
            const source = STATE.countryCoords[d.exporter];
            const target = STATE.countryCoords[d.importer];
            if(!source || !target) return;

            const pathString = this.path({type: "LineString", coordinates: [source, target]});
            if (!pathString) return;
            const pathNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathNode.setAttribute("d", pathString);
            const len = pathNode.getTotalLength();
            if (!len) return;

            let count = 1;
            let pColor = "#fff";

            if (isIntegrated) {
                // Integrated: Count=Weight, Color=Price
                const wTh = CONFIG.thresholds.weight[STATE.hsCode];
                if (d.weight >= wTh.large) count = 4;
                else if (d.weight >= wTh.medium) count = 2;
                else count = 1;

                const pTh = CONFIG.thresholds.unit_price[STATE.hsCode];
                if (d.unitPrice >= pTh.large) pColor = CONFIG.colors.integrated.particle.large; 
                else if (d.unitPrice >= pTh.medium) pColor = CONFIG.colors.integrated.particle.medium; 
                else pColor = CONFIG.colors.integrated.particle.small; 
            } else {
                // Standard: Count=Value, Color=Same as Line (or White if preferred)
                count = Math.round(particleCountScale(d.value));
                // Optional: Use same color as line or white? Let's use white for visibility contrast on colored lines
                pColor = "#fff"; 
            }

            for (let i = 0; i < count; i++) {
                const particle = flowGroup.append("circle")
                    .attr("class", "particle")
                    .attr("r", isIntegrated ? 2.0 : 1.8)
                    .attr("fill", pColor)
                    .attr("opacity", 0);
                const delay = Math.random() * 5000 + (i * 1500); 
                this.animateParticle(particle, pathNode, len, delay);
            }
        });

        // --- Nodes & Labels ---
        const activeExporters = [...new Set(flows.map(d => d.exporter))];
        flowGroup.selectAll(".country-node")
            .data(activeExporters)
            .enter().append("circle")
            .attr("class", "country-node")
            .attr("cx", d => this.getProjectedPoint(d)[0])
            .attr("cy", d => this.getProjectedPoint(d)[1])
            .attr("r", 3)
            .attr("fill", "#fff")
            .attr("stroke", "#000")
            .attr("display", d => this.isVisible(d) ? "block" : "none")
            .on("mouseover", (event, d) => App.showTooltip(event, d))
            .on("mouseout", () => App.hideTooltip());

        flowGroup.selectAll(".map-label")
            .data(activeExporters)
            .enter().append("text")
            .attr("class", "map-label")
            .attr("x", d => this.getProjectedPoint(d)[0] + 6)
            .attr("y", d => this.getProjectedPoint(d)[1] + 4)
            .text(d => (STATE.countryNames[d] || d))
            .attr("font-size", "10px")
            .attr("display", d => this.isVisible(d) ? "block" : "none");

        this.renderLegend();
    },

    animateParticle(circle, pathNode, length, delay = 0) {
        const duration = 6000 + Math.random() * 3000;
        circle.transition()
            .delay(delay)
            .duration(duration)
            .ease(d3.easeLinear)
            .attrTween("transform", () => {
                return (t) => {
                    const p = pathNode.getPointAtLength(t * length);
                    return `translate(${p.x},${p.y})`;
                };
            })
            .styleTween("opacity", () => {
                return (t) => {
                    if (t < 0.1) return t * 10;
                    if (t > 0.9) return (1 - t) * 10;
                    return 1;
                };
            })
            .on("end", () => {
                this.animateParticle(circle, pathNode, length, 0);
            });
    },

    getProjectedPoint(iso) {
        const coords = STATE.countryCoords[iso];
        if (!coords) return [-999, -999];
        return this.projection(coords) || [-999, -999];
    },

    isVisible(iso) {
        if (STATE.mapMode === 'flat') return true;
        const coords = STATE.countryCoords[iso];
        if (!coords) return false;
        const center = this.projection.invert([this.width/2, this.height/2]);
        return d3.geoDistance(coords, center) < 1.57; 
    },

renderLegend() {
        const container = document.getElementById('legend-content');
        const config = CONFIG.colors[STATE.metric];
        document.getElementById('legend-title').innerText = config.label;
        
        let html = '';

        if (STATE.metric === 'integrated') {
            // --- ALL (Integrated) モード: 数字付きの詳細表示 ---
            
            // 現在のHSコードに基づく閾値を取得
            const vTh = CONFIG.thresholds.value[STATE.hsCode];      // Value
            const pTh = CONFIG.thresholds.unit_price[STATE.hsCode]; // Price
            const wTh = CONFIG.thresholds.weight[STATE.hsCode];     // Weight

            // フォーマッター
            const fmtVal = d3.format(".2s");  // 1.6M, 250k
            const fmtPrice = d3.format("$.1f"); // $10.0, $1.0

            html = `
                <div class="space-y-3 mt-2">
                    <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider border-b border-slate-700 pb-0.5">Line Color (Value)</div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2 text-[10px]">
                                <span class="w-3 h-3 rounded-full bg-[#0ea5e9]"></span>
                                <span class="text-slate-200 font-mono">Large (> ${fmtVal(vTh.large)})</span>
                            </div>
                            <div class="flex items-center gap-2 text-[10px]">
                                <span class="w-3 h-3 rounded-full bg-[#6366f1]"></span>
                                <span class="text-slate-300 font-mono">Med (${fmtVal(vTh.medium)} - ${fmtVal(vTh.large)})</span>
                            </div>
                            <div class="flex items-center gap-2 text-[10px]">
                                <span class="w-3 h-3 rounded-full bg-[#334155]"></span>
                                <span class="text-slate-400 font-mono">Small (< ${fmtVal(vTh.medium)})</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider border-b border-slate-700 pb-0.5">Dot Color (Quality)</div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2 text-[10px]">
                                <span class="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_5px_rgba(251,191,36,0.5)]"></span>
                                <span class="text-slate-200 font-mono">Premium (> ${fmtPrice(pTh.large)})</span>
                            </div>
                            <div class="flex items-center gap-2 text-[10px]">
                                <span class="w-2 h-2 rounded-full bg-[#f8fafc]"></span>
                                <span class="text-slate-300 font-mono">Standard (${fmtPrice(pTh.medium)} - ${fmtPrice(pTh.large)})</span>
                            </div>
                            <div class="flex items-center gap-2 text-[10px]">
                                <span class="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                                <span class="text-slate-400 font-mono">Economy (< ${fmtPrice(pTh.medium)})</span>
                            </div>
                        </div>
                    </div>

                    <div>
                         <div class="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider border-b border-slate-700 pb-0.5">Dot Count (Weight)</div>
                         <div class="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
                            <span>High: > ${fmtVal(wTh.large)}kg</span>
                            <span>Low: < ${fmtVal(wTh.medium)}kg</span>
                         </div>
                    </div>
                </div>`;

        } else {
            // --- Standard (Value/Weight/Price) モード: 変更なし ---
            const colors = config.discrete;
            const th = CONFIG.thresholds[STATE.metric][STATE.hsCode];
            const fmt = STATE.metric === 'unit_price' ? d3.format("$.2f") : d3.format(".2s");
            
            html = `
                <div class="space-y-2 mt-2">
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded" style="background-color: ${colors.large}"></span>
                        <span class="text-[10px] text-slate-300 font-mono">High (> ${fmt(th.large)})</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded" style="background-color: ${colors.medium}"></span>
                        <span class="text-[10px] text-slate-300 font-mono">Mid (${fmt(th.medium)} - ${fmt(th.large)})</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded" style="background-color: ${colors.small}"></span>
                        <span class="text-[10px] text-slate-300 font-mono">Low (< ${fmt(th.medium)})</span>
                    </div>
                </div>`;
        }

        container.innerHTML = html;
        const total = d3.sum(STATE.filteredData, d => d.value);
        document.getElementById('stat-value').innerText = "$" + d3.format(",.0f")(total);
    }
};