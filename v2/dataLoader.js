const DataLoader = {
    // ▼▼▼ 補完用データ: 地図データから漏れやすい国や島国の座標定義 ▼▼▼
    // dataLoader.js 内の fallbackData をこれに置き換えてください

    // dataLoader.js 内の fallbackData をこれに置き換えてください

    fallbackData: {
        // --- 以前の追加分 ---
        "AGO": { name: "Angola", coords: [17.87, -11.20] },
        "ARM": { name: "Armenia", coords: [45.03, 40.06] },
        "ATG": { name: "Antigua and Barbuda", coords: [-61.79, 17.06] },
        "AUS": { name: "Australia", coords: [133.77, -25.27] },
        "AUT": { name: "Austria", coords: [14.55, 47.51] },
        "AZE": { name: "Azerbaijan", coords: [47.57, 40.14] },
        "BEL": { name: "Belgium", coords: [4.46, 50.50] },
        "BHR": { name: "Bahrain", coords: [50.55, 26.06] },
        "BHS": { name: "Bahamas", coords: [-77.39, 25.03] },
        "BIH": { name: "Bosnia and Herzegovina", coords: [17.67, 43.91] },
        "BMU": { name: "Bermuda", coords: [-64.75, 32.30] },
        "BOL": { name: "Bolivia", coords: [-63.58, -16.29] },
        "BRA": { name: "Brazil", coords: [-51.92, -14.23] },
        "GRD": { name: "Grenada", coords: [-61.60, 12.11] },
        "HKG": { name: "Hong Kong", coords: [114.16, 22.31] },
        "MAC": { name: "Macau", coords: [113.54, 22.19] },
        "MDV": { name: "Maldives", coords: [73.22, 3.20] },
        "MLT": { name: "Malta", coords: [14.37, 35.93] },
        "MUS": { name: "Mauritius", coords: [57.55, -20.34] },
        "SGP": { name: "Singapore", coords: [103.81, 1.35] },
        "ALB": { name: "Albania", coords: [20.17, 41.15] },
        "BLZ": { name: "Belize", coords: [-88.49, 17.18] },
        "CYM": { name: "Cayman Islands", coords: [-81.26, 19.32] },
        "MSR": { name: "Montserrat", coords: [-62.18, 16.74] },
        "SYC": { name: "Seychelles", coords: [55.49, -4.68] },
        "WSM": { name: "Samoa", coords: [-172.10, -13.75] },
        "ABW": { name: "Aruba", coords: [-69.97, 12.52] },
        "AFG": { name: "Afghanistan", coords: [67.71, 33.94] },
        "AND": { name: "Andorra", coords: [1.52, 42.51] },
        "ARG": { name: "Argentina", coords: [-63.62, -38.42] },
        "ASM": { name: "American Samoa", coords: [-170.13, -14.27] },
        "ATA": { name: "Antarctica", coords: [0.00, -82.86] },
        "BES": { name: "Bonaire, Sint Eustatius and Saba", coords: [-68.27, 12.14] },
        "BGD": { name: "Bangladesh", coords: [90.36, 23.68] },
        "BLM": { name: "Saint Barthélemy", coords: [-62.83, 17.90] },
        "BRB": { name: "Barbados", coords: [-59.54, 13.19] },
        "BRN": { name: "Brunei Darussalam", coords: [114.73, 4.53] },
        "BTN": { name: "Bhutan", coords: [90.43, 27.51] },
        "BWA": { name: "Botswana", coords: [24.68, -22.33] },
        "COK": { name: "Cook Islands", coords: [-159.78, -21.24] },
        "CPV": { name: "Cabo Verde", coords: [-24.01, 16.00] },
        "CUW": { name: "Curaçao", coords: [-68.99, 12.17] },
        "DMA": { name: "Dominica", coords: [-61.37, 15.41] },
        "DZA": { name: "Algeria", coords: [1.66, 28.03] },
        "FRO": { name: "Faroe Islands", coords: [-6.91, 61.89] },
        "FSM": { name: "Micronesia (Federated States of)", coords: [150.55, 7.42] },
        "GIB": { name: "Gibraltar", coords: [-5.35, 36.14] },
        "GUM": { name: "Guam", coords: [144.79, 13.44] },
        "IOT": { name: "British Indian Ocean Territory", coords: [71.88, -6.34] },
        "KIR": { name: "Kiribati", coords: [-168.73, -3.37] },
        "KNA": { name: "Saint Kitts and Nevis", coords: [-62.78, 17.36] },
        "LCA": { name: "Saint Lucia", coords: [-60.98, 13.91] },
        "MHL": { name: "Marshall Islands", coords: [171.18, 7.13] },
        "MNP": { name: "Northern Mariana Islands", coords: [145.67, 15.09] },
        "NIU": { name: "Niue", coords: [-169.87, -19.05] },
        "NRU": { name: "Nauru", coords: [166.93, -0.52] },
        "PLW": { name: "Palau", coords: [134.58, 7.51] },
        "PYF": { name: "French Polynesia", coords: [-149.41, -17.68] },
        "SLB": { name: "Solomon Islands", coords: [160.16, -9.65] },
        "STP": { name: "Sao Tome and Principe", coords: [6.61, 0.19] },
        "SXM": { name: "Sint Maarten", coords: [-63.06, 18.04] },
        "TCA": { name: "Turks and Caicos Islands", coords: [-71.79, 21.69] },
        "TON": { name: "Tonga", coords: [-175.20, -21.18] },
        "TUV": { name: "Tuvalu", coords: [179.14, -7.11] },
        "VCT": { name: "Saint Vincent and the Grenadines", coords: [-61.29, 12.98] },
        "VGB": { name: "British Virgin Islands", coords: [-64.64, 18.42] },
        "WLF": { name: "Wallis and Futuna", coords: [-177.16, -13.76] },
        "AIA": { name: "Anguilla", coords: [-63.06, 18.22] },
        "ATF": { name: "French Southern Territories", coords: [69.35, -49.28] },
        "CXR": { name: "Christmas Island", coords: [105.69, -10.44] },
        "FLK": { name: "Falkland Islands", coords: [-59.52, -51.79] },
        "PSE": { name: "Palestine", coords: [35.23, 31.95] },
        "SHN": { name: "Saint Helena", coords: [-5.70, -15.96] },
        "FRA": { name: "France", coords: [2.21, 46.22] },
        "SPM": { name: "Saint Pierre and Miquelon", coords: [-56.37, 46.88] }
    },

    async loadAll() {
        try {
            const [world, csv] = await Promise.all([
                d3.json(CONFIG.geoJsonUrl),
                d3.csv(CONFIG.csvFile)
            ]);
            STATE.geoData = topojson.feature(world, world.objects.countries);
            this.processGeoData(STATE.geoData);
            
            // ▼▼▼ 修正: 補完データを適用 ▼▼▼
            this.injectMissingCoordinates();

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

    // ▼▼▼ 新規追加メソッド: 地図にない国を強制登録 ▼▼▼
    injectMissingCoordinates() {
        Object.keys(this.fallbackData).forEach(code => {
            const data = this.fallbackData[code];
            
            // 変更点: 条件分岐を削除し、常に上書きするように変更
            // これにより、フランス(FRA)のように「重心がずれる国」も強制的に修正されます
            STATE.countryCoords[code] = data.coords;
            
            // 名前がない場合のみ名前も登録（名前は元の地図データのものでもOKなため）
            if (!STATE.countryNames[code]) {
                STATE.countryNames[code] = data.name;
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

        // 3. Region Filter
        if (STATE.region && STATE.region !== "Global") {
            filtered = filtered.filter(d => {
                const expRegion = RegionConfig.getRegion(d.exporter);
                const impRegion = RegionConfig.getRegion(d.importer);
                return expRegion === STATE.region && impRegion === STATE.region;
            });
        }

        // 4. Country Filters
        if (STATE.selectedExporters.size > 0) {
            filtered = filtered.filter(d => STATE.selectedExporters.has(d.exporter));
        }
        
        if (STATE.selectedImporters.size > 0) {
            filtered = filtered.filter(d => STATE.selectedImporters.has(d.importer));
        }

        if (STATE.selectedExporters.size === 0 && STATE.selectedImporters.size === 0) {
            filtered = [];
        }

        // 5. Clean Invalid
        filtered = filtered.filter(d => d.value > 0 && d.exporter !== "_X" && d.importer !== "_X");

        STATE.filteredData = filtered;
        return filtered;
    },

    getExporters() {
        let relevantData = STATE.data.filter(d => d.hsCode === STATE.hsCode);
        
        if (STATE.region && STATE.region !== "Global") {
            relevantData = relevantData.filter(d => RegionConfig.getRegion(d.exporter) === STATE.region);
        }
        
        return [...new Set(relevantData.map(d => d.exporter))].sort();
    },

    getImporters() {
        let relevantData = STATE.data.filter(d => d.hsCode === STATE.hsCode);
        
        if (STATE.region && STATE.region !== "Global") {
            relevantData = relevantData.filter(d => RegionConfig.getRegion(d.importer) === STATE.region);
        }

        return [...new Set(relevantData.map(d => d.importer))].sort();
    },

    getTopExporters(count = 5) {
        let relevantData = STATE.data.filter(d => d.hsCode === STATE.hsCode);
        
        if (STATE.region && STATE.region !== "Global") {
            relevantData = relevantData.filter(d => 
                RegionConfig.getRegion(d.exporter) === STATE.region && 
                RegionConfig.getRegion(d.importer) === STATE.region
            );
        }

        const rollup = d3.rollup(relevantData, v => d3.sum(v, d => d.value), d => d.exporter);
        return Array.from(rollup).sort((a, b) => b[1] - a[1]).slice(0, count).map(d => d[0]);
    }
};