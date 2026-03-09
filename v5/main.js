const App = {
    exporterSelector: null,
    importerSelector: null,

    async init() {
        STATE.selectedExporters = new Set();
        STATE.selectedImporters = new Set();
        if (!STATE.volumeFilters) STATE.volumeFilters = new Set(['large', 'medium', 'small']);
        
        // 地域フィルタの初期化
        STATE.region = "Global";

        const success = await DataLoader.loadAll();
        if (!success) return;

        // Initialize hierarchical country selectors
        console.log('Initializing country selectors...');
        this.exporterSelector = new CountrySelector('exp', 'exp-label', 'exporter');
        this.importerSelector = new CountrySelector('imp', 'imp-label', 'importer');
        
        try {
            await this.exporterSelector.init();
            await this.importerSelector.init();
            console.log('Country selectors initialized successfully');
        } catch (error) {
            console.error('Failed to initialize country selectors:', error);
            alert('国選択機能の初期化に失敗しました。詳細はコンソールを確認してください。');
            return;
        }

        // Default: Top 5 Exporters
        const top5 = DataLoader.getTopExporters(5);
        top5.forEach(code => {
            this.exporterSelector.selectedCountries.add(code);
        });

        TradeMap.init();
        this.setupEventListeners();
        
        // Update selection AFTER TradeMap.init()
        this.exporterSelector.updateSelection();
        this.updateDashboard(); 
        document.getElementById('loader').classList.add('hidden');
    },

    setupEventListeners() {
        // Map Mode
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                STATE.mapMode = mode;
                this.updateUIClasses('.mode-btn', e.target);
                TradeMap.init(); // Re-init map for mode switch
                
                // モード切替時、もし地域が選択されていたらズームを再適用
                if (STATE.mapMode === 'flat' && STATE.region !== "Global") {
                    setTimeout(() => TradeMap.zoomToRegion(STATE.region), 100);
                }
                
                TradeMap.renderFlows();
            });
        });

        // Region Dropdown (NEW)
        const regionSelect = document.getElementById('region-select');
        if (regionSelect) {
            regionSelect.addEventListener('change', (e) => {
                const region = e.target.value;
                STATE.region = region;

                // 1. 国選択のリセット & その地域のTop 5を再選択
                STATE.selectedExporters.clear();
                STATE.selectedImporters.clear();
                
                const top5 = DataLoader.getTopExporters(5);
                top5.forEach(code => STATE.selectedExporters.add(code));

                // 2. 地図のズーム (2Dモード時のみ)
                TradeMap.zoomToRegion(region);

                // 3. UIの更新
                this.updateDashboard();
            });
        }

        // HS Code
        document.querySelectorAll('.hs-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateUIClasses('.hs-btn', e.target);
                STATE.hsCode = e.target.dataset.hs;
                
                // Reset to Top 5 Exporters on HS switch
                STATE.selectedExporters.clear();
                STATE.selectedImporters.clear(); 
                const top5 = DataLoader.getTopExporters(5);
                top5.forEach(code => STATE.selectedExporters.add(code));

                this.updateDashboard();
            });
        });

        // Metric
        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateUIClasses('.metric-btn', e.target);
                STATE.metric = e.target.dataset.metric;
                TradeMap.renderFlows();
            });
        });

        // Size Checkboxes
        document.querySelectorAll('.size-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const val = e.target.value;
                if (e.target.checked) STATE.volumeFilters.add(val);
                else STATE.volumeFilters.delete(val);
                this.updateDashboard(false);
            });
        });

        // Arrow toggle
        const arrowToggle = document.getElementById('toggle-arrows');
        if (arrowToggle) {
            arrowToggle.addEventListener('change', (e) => {
                STATE.showArrows = e.target.checked;
                TradeMap.renderFlows();
            });
        }

        // Curve toggle
        const curveToggle = document.getElementById('toggle-curve');
        if (curveToggle) {
            curveToggle.addEventListener('change', (e) => {
                STATE.clockwiseCurve = e.target.checked;
                TradeMap.renderFlows();
            });
        }

        // Exporter label toggle
        const expLabelToggle = document.getElementById('toggle-exp-labels');
        if (expLabelToggle) {
            expLabelToggle.addEventListener('change', (e) => {
                STATE.showExporterLabels = e.target.checked;
                TradeMap.renderFlows();
            });
        }

        // Importer label toggle
        const impLabelToggle = document.getElementById('toggle-imp-labels');
        if (impLabelToggle) {
            impLabelToggle.addEventListener('change', (e) => {
                STATE.showImporterLabels = e.target.checked;
                TradeMap.renderFlows();
            });
        }

        // --- Dropdown Logic (Exporter & Importer) ---
        this.setupHierarchicalDropdown('exp', this.exporterSelector);
        this.setupHierarchicalDropdown('imp', this.importerSelector);

        window.addEventListener('resize', () => {
            TradeMap.init();
            if (STATE.mapMode === 'flat' && STATE.region !== "Global") {
                // リサイズ時もズーム位置を維持
                setTimeout(() => TradeMap.zoomToRegion(STATE.region), 100);
            }
            TradeMap.renderFlows();
        });
    },

    setupHierarchicalDropdown(prefix, selector) {
        const btn = document.getElementById(`${prefix}-btn`);
        const menu = document.getElementById(`${prefix}-menu`);
        const search = document.getElementById(`${prefix}-search`);
        const selectAll = document.getElementById(`${prefix}-select-all`);
        const clearAll = document.getElementById(`${prefix}-clear-all`);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const otherPrefix = prefix === 'exp' ? 'imp' : 'exp';
            document.getElementById(`${otherPrefix}-menu`).classList.add('hidden');
            menu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });

        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            menu.querySelectorAll('.country-option').forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
            // Hide/show section headers based on visible countries
            menu.querySelectorAll('.group-option').forEach(item => {
                item.style.display = term ? 'none' : 'flex';
            });
        });

        selectAll.addEventListener('click', () => {
            selector.selectAll();
        });

        clearAll.addEventListener('click', () => {
            selector.clearAll();
        });
    },

    updateUIClasses(selector, activeEl) {
        document.querySelectorAll(selector).forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('text-slate-400');
        });
        activeEl.classList.remove('text-slate-400');
        activeEl.classList.add('bg-blue-600', 'text-white');
    },

    updateDashboard(rebuildMenus = true) {
        // Get selected countries from selectors
        STATE.selectedExporters = new Set(this.exporterSelector.getSelectedCountries());
        STATE.selectedImporters = new Set(this.importerSelector.getSelectedCountries());
        
        DataLoader.filterData();
        TradeMap.renderFlows();
        
        // No need to rebuild menus anymore - CountrySelector handles this
    },

    buildDropdown(prefix, stateKey, countryList) {
        const listContainer = document.getElementById(`${prefix}-list`);
        listContainer.innerHTML = '';
        
        countryList.forEach(code => {
            const name = STATE.countryNames[code] || code;
            
            const div = document.createElement('div');
            div.className = 'country-item flex items-center gap-2 p-1 hover:bg-slate-800 rounded';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox accent-blue-500 cursor-pointer';
            checkbox.value = code;
            if (STATE[stateKey].has(code)) checkbox.checked = true;
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) STATE[stateKey].add(code);
                else STATE[stateKey].delete(code);
                
                this.updateDropdownLabel(prefix, stateKey);
                DataLoader.filterData();
                TradeMap.renderFlows();
            });

            const span = document.createElement('span');
            span.className = 'text-xs text-slate-300 cursor-pointer';
            span.innerText = name;
            span.onclick = () => checkbox.click(); 

            div.appendChild(checkbox);
            div.appendChild(span);
            listContainer.appendChild(div);
        });
    },

    updateDropdownLabel(prefix, stateKey) {
        const count = STATE[stateKey].size;
        const label = document.getElementById(`${prefix}-label`);
        
        if (count === 0) label.innerText = "None (Select)";
        else if (count === 1) {
            const code = Array.from(STATE[stateKey])[0];
            label.innerText = STATE.countryNames[code] || code;
        } else {
            label.innerText = `${count} Selected`;
        }
    },

    showTooltip(event, iso) {
        const tooltip = document.getElementById('tooltip');
        const name = STATE.countryNames[iso] || iso;
        
        const flowsOut = STATE.filteredData.filter(d => d.exporter === iso);
        const flowsIn = STATE.filteredData.filter(d => d.importer === iso);
        
        const totalValOut = d3.sum(flowsOut, d => d.value);
        const totalValIn = d3.sum(flowsIn, d => d.value);
        
        let content = `<div class="font-bold text-blue-400 mb-1">${name}</div>`;
        
        if (totalValOut > 0) {
            content += `
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-1">
                <span class="text-slate-400">Exports:</span>
                <span class="text-right font-mono text-green-400">$${d3.format(".2s")(totalValOut)}</span>
            </div>`;
        }
        if (totalValIn > 0) {
             content += `
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span class="text-slate-400">Imports:</span>
                <span class="text-right font-mono text-orange-400">$${d3.format(".2s")(totalValIn)}</span>
            </div>`;
        }
        
        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY - 15) + 'px';
    },

    hideTooltip() {
        document.getElementById('tooltip').style.display = 'none';
    }
};

// Export App to window for CountrySelector
window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});