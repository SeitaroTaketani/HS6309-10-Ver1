const App = {
    async init() {
        STATE.selectedExporters = new Set();
        STATE.selectedImporters = new Set();
        if (!STATE.volumeFilters) STATE.volumeFilters = new Set(['large', 'medium', 'small']);
        
        const success = await DataLoader.loadAll();
        if (!success) return;

        // Default: Top 5 Exporters
        const top5 = DataLoader.getTopExporters(5);
        top5.forEach(code => STATE.selectedExporters.add(code));

        TradeMap.init();
        this.setupEventListeners();
        
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
                TradeMap.init();
                TradeMap.renderFlows();
            });
        });

        // HS Code
        document.querySelectorAll('.hs-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateUIClasses('.hs-btn', e.target);
                STATE.hsCode = e.target.dataset.hs;
                
                // Reset to Top 5 Exporters on HS switch
                STATE.selectedExporters.clear();
                STATE.selectedImporters.clear(); // Clear importers too
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

        // --- Dropdown Logic (Exporter & Importer) ---
        this.setupDropdown('exp', 'selectedExporters', DataLoader.getExporters.bind(DataLoader));
        this.setupDropdown('imp', 'selectedImporters', DataLoader.getImporters.bind(DataLoader));

        window.addEventListener('resize', () => {
            TradeMap.init();
            TradeMap.renderFlows();
        });
    },

    // Generic Dropdown Setup
    setupDropdown(prefix, stateKey, dataGetter) {
        const btn = document.getElementById(`${prefix}-btn`);
        const menu = document.getElementById(`${prefix}-menu`);
        const search = document.getElementById(`${prefix}-search`);
        const selectAll = document.getElementById(`${prefix}-select-all`);
        const clearAll = document.getElementById(`${prefix}-clear-all`);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other menu if open
            const otherPrefix = prefix === 'exp' ? 'imp' : 'exp';
            document.getElementById(`${otherPrefix}-menu`).classList.add('hidden');
            menu.classList.toggle('hidden');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });

        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            menu.querySelectorAll('.country-item').forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });

        selectAll.addEventListener('click', () => {
            menu.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            const allCodes = dataGetter(); 
            STATE[stateKey] = new Set(allCodes);
            this.updateDropdownLabel(prefix, stateKey);
            this.updateDashboard(false);
        });

        clearAll.addEventListener('click', () => {
            menu.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            STATE[stateKey].clear();
            this.updateDropdownLabel(prefix, stateKey);
            this.updateDashboard(false);
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
        DataLoader.filterData();
        TradeMap.renderFlows();
        
        if (rebuildMenus) {
            this.buildDropdown('exp', 'selectedExporters', DataLoader.getExporters());
            this.buildDropdown('imp', 'selectedImporters', DataLoader.getImporters());
        }
        this.updateDropdownLabel('exp', 'selectedExporters');
        this.updateDropdownLabel('imp', 'selectedImporters');
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
                // Do not rebuild menus to maintain scroll position
                DataLoader.filterData();
                TradeMap.renderFlows();
            });

            const span = document.createElement('span');
            span.className = 'text-xs text-slate-300 cursor-pointer';
            span.innerText = name;
            span.onclick = () => checkbox.click(); // Click text to check

            div.appendChild(checkbox);
            div.appendChild(span);
            listContainer.appendChild(div);
        });
    },

    updateDropdownLabel(prefix, stateKey) {
        const count = STATE[stateKey].size;
        const label = document.getElementById(`${prefix}-label`);
        const defaultText = prefix === 'exp' ? 'All Exporters' : 'All Importers';
        
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
        
        // Contextual Tooltip:
        // If viewing specific importer flow, show IMPORT stats for that node?
        // For simplicity, we stick to current metric sum in filtered view
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

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});