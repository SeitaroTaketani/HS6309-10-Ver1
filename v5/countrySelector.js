// countrySelector.js - Hierarchical country selection (Alpha-3, 3-level hierarchy)

class CountrySelector {
    constructor(elementId, labelId, type) {
        this.elementId = elementId;
        this.labelId = labelId;
        this.type = type;
        this.classificationData = null;
        this.selectedCountries = new Set();
        this.allCountries = [];
    }

    async init() {
        await this.loadClassificationData();
        this.buildDropdown();
    }

    async loadClassificationData() {
        try {
            const response = await fetch('data/country_classification.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.classificationData = await response.json();

            this.allCountries = Object.keys(this.classificationData.countries)
                .map(code => ({ code, name: this.classificationData.countries[code].name }))
                .sort((a, b) => a.name.localeCompare(b.name));

            console.log(`Country classification loaded: ${this.allCountries.length} countries`);
        } catch (error) {
            console.error('Failed to load country classification:', error);
        }
    }

    getCountriesInRegion(regionCode) {
        return Object.keys(this.classificationData.countries).filter(code =>
            this.classificationData.countries[code].regions.includes(regionCode)
        );
    }

    buildDropdown() {
        if (!this.classificationData) return;
        const list = document.getElementById(`${this.elementId}-list`);
        if (!list) return;
        list.innerHTML = '';

        this.addSectionHeader(list, '🌍 Geographic Regions');

        const regionOrder = ['5100', '5200', '5300', '5400', '5500'];
        regionOrder.forEach(contCode => {
            const cont = this.classificationData.regions[contCode];
            if (!cont) return;

            this.addGroupOption(list, {
                label: `${cont.name} (All)`,
                countries: this.getCountriesInRegion(contCode),
                indent: 0, icon: '▶'
            });

            (cont.subregions || []).forEach(sub => {
                this.addGroupOption(list, {
                    label: sub.name,
                    countries: this.getCountriesInRegion(sub.code),
                    indent: 1, icon: '└'
                });

                (sub.subsubregions || []).forEach(subsub => {
                    this.addGroupOption(list, {
                        label: subsub.name,
                        countries: this.getCountriesInRegion(subsub.code),
                        indent: 2, icon: '  └'
                    });
                });
            });
        });

        this.addSectionHeader(list, '📊 Development Status');
        ['1500', '1400', '1610'].forEach(devCode => {
            const devGroup = this.classificationData.development[devCode];
            if (!devGroup) return;
            this.addGroupOption(list, {
                label: devGroup.name,
                countries: devGroup.countries,
                indent: 0, icon: '▶'
            });
        });

        this.addSectionHeader(list, '🌐 All Countries');
        this.allCountries.forEach(c => this.addCountryOption(list, c.code, c.name));
    }

    addSectionHeader(parent, title) {
        const div = document.createElement('div');
        div.className = 'px-2 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-800/50 sticky top-0 z-10';
        div.textContent = title;
        parent.appendChild(div);
    }

    addGroupOption(parent, { label, countries, indent, icon }) {
        const div = document.createElement('div');
        div.className = 'group-option flex items-center gap-2 py-1.5 text-xs rounded cursor-pointer hover:bg-blue-600/20 border-b border-slate-800/30';
        div.style.paddingLeft = `${8 + indent * 14}px`;
        div.style.paddingRight = '8px';
        div.innerHTML = `
            <span class="text-slate-500 text-[10px] font-mono flex-shrink-0">${icon}</span>
            <span class="flex-1 font-semibold text-slate-300">${label}</span>
            <span class="text-[9px] text-slate-500 font-mono bg-slate-800 px-1 rounded">${countries.length}</span>
        `;
        div.addEventListener('click', () => {
            countries.forEach(code => this.selectedCountries.add(code));
            this.updateSelection();
        });
        parent.appendChild(div);
    }

    addCountryOption(parent, code, name) {
        const label = document.createElement('label');
        label.className = 'country-option flex items-center gap-2 px-2 py-1 text-xs rounded cursor-pointer hover:bg-slate-800';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'accent-blue-500 flex-shrink-0';
        checkbox.dataset.country = code;
        checkbox.checked = this.selectedCountries.has(code);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) this.selectedCountries.add(code);
            else this.selectedCountries.delete(code);
            this.updateSelection();
        });
        const span = document.createElement('span');
        span.className = 'text-slate-300';
        span.textContent = name;
        label.appendChild(checkbox);
        label.appendChild(span);
        parent.appendChild(label);
    }

    updateSelection() {
        const labelEl = document.getElementById(this.labelId);
        const count = this.selectedCountries.size;
        if (count === 0) {
            labelEl.textContent = this.type === 'exporter' ? 'All Exporters' : 'All Importers';
        } else if (count === 1) {
            const code = Array.from(this.selectedCountries)[0];
            const country = this.classificationData?.countries[code];
            labelEl.textContent = country ? country.name : code;
        } else {
            labelEl.textContent = `${count} Countries`;
        }
        document.querySelectorAll(`#${this.elementId}-list input[type="checkbox"]`).forEach(cb => {
            cb.checked = this.selectedCountries.has(cb.dataset.country);
        });
        if (window.App?.updateDashboard) window.App.updateDashboard(false);
    }

    getSelectedCountries() { return Array.from(this.selectedCountries); }
    selectAll() { this.allCountries.forEach(c => this.selectedCountries.add(c.code)); this.updateSelection(); }
    clearAll() { this.selectedCountries.clear(); this.updateSelection(); }
}

window.CountrySelector = CountrySelector;