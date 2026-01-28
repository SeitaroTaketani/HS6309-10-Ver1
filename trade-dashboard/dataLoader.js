const DataLoader = {
    async loadAll() {
        try {
            const [world, csv] = await Promise.all([
                d3.json(CONFIG.geoJsonUrl),
                d3.csv(CONFIG.csvFile)
            ]);
            STATE.geoData = topojson.feature(world, world.objects.countries);
            this.processGeoData(STATE.geoData);

            STATE.data = csv.map(d => ({
                year: +d.Year,
                exporter: d.Exporter,
                importer: d.Importer,
                hsCode: String(d.HSCode),
                weight: +d.Weight || 0,
                value: +d.Value || 0,
                unitPrice: (+d.Weight > 0) ? (+d.Value / +d.Weight) : 0,
            }));
            return true;
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
    },

    processGeoData(geoData) {
        geoData.features.forEach(feature => {
            const numericId = feature.id; 
            const alpha3 = TradeMap.isoMap[numericId];
            if (alpha3) {
                STATE.countryCoords[alpha3] = d3.geoCentroid(feature);
                STATE.countryNames[alpha3] = feature.properties.name;
            }
        });
    },

    filterData() {
        // 1. HS Code Filter
        let filtered = STATE.data.filter(d => d.hsCode === STATE.hsCode);

        // 2. Dynamic Size/Quality Filter
        let currentMetric = STATE.metric; 
        if (currentMetric === 'unit_price' || currentMetric === 'integrated') {
            currentMetric = 'value';
        }
        const thresholds = CONFIG.thresholds[currentMetric][STATE.hsCode];

        filtered = filtered.filter(d => {
            let valToCheck = 0;
            if (currentMetric === 'weight') valToCheck = d.weight;
            else valToCheck = d.value; 

            if (valToCheck >= thresholds.large) return STATE.volumeFilters.has('large');
            if (valToCheck >= thresholds.medium) return STATE.volumeFilters.has('medium');
            return STATE.volumeFilters.has('small');
        });

        // 3. Country Filters (Exporter AND Importer)
        
        // Exporter Filter
        if (STATE.selectedExporters.size > 0) {
            filtered = filtered.filter(d => STATE.selectedExporters.has(d.exporter));
        }
        
        // Importer Filter
        if (STATE.selectedImporters.size > 0) {
            filtered = filtered.filter(d => STATE.selectedImporters.has(d.importer));
        }

        // Edge Case: If BOTH sets are empty, we need a default behavior.
        // Rule: 
        // - Exporter Selected ONLY -> Show flows from Exporters
        // - Importer Selected ONLY -> Show flows to Importers
        // - Both Selected -> Show flow BETWEEN them
        // - NEITHER Selected -> Show Nothing (or Top Exporters logic handled in main.js init)
        
        if (STATE.selectedExporters.size === 0 && STATE.selectedImporters.size === 0) {
            filtered = [];
        }

        // 4. Clean Invalid
        filtered = filtered.filter(d => d.value > 0 && d.exporter !== "_X" && d.importer !== "_X");

        STATE.filteredData = filtered;
        return filtered;
    },

    // Get unique exporters from CURRENT HS code
    getExporters() {
        const relevantData = STATE.data.filter(d => d.hsCode === STATE.hsCode);
        return [...new Set(relevantData.map(d => d.exporter))].sort();
    },

    // Get unique importers from CURRENT HS code
    getImporters() {
        const relevantData = STATE.data.filter(d => d.hsCode === STATE.hsCode);
        return [...new Set(relevantData.map(d => d.importer))].sort();
    },

    getTopExporters(count = 5) {
        const relevantData = STATE.data.filter(d => d.hsCode === STATE.hsCode);
        const rollup = d3.rollup(relevantData, v => d3.sum(v, d => d.value), d => d.exporter);
        return Array.from(rollup).sort((a, b) => b[1] - a[1]).slice(0, count).map(d => d[0]);
    }
};