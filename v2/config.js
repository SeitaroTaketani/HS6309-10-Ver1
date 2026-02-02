const CONFIG = {
    // Files
    csvFile: 'data/Final_Cleaned_2024.csv',
    // ▼▼▼ 修正: 110m を 50m に変更して詳細な地図を使用 ▼▼▼
    geoJsonUrl: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',

    // Thresholds (変更なし)
    thresholds: {
        value: {
            "6309": { large: 1600000, medium: 250000 },
            "6310": { large: 1600000, medium: 250000 }
        },
        weight: {
            "6309": { large: 1600000, medium: 200000 },
            "6310": { large: 730000, medium: 80000 }
        },
        unit_price: {
            "6309": { large: 10.0, medium: 1.0 }, 
            "6310": { large: 10.0, medium: 1.0 }
        }
    },

    colors: {
        value: { label: "Export Value ($)", discrete: { large: "#0ea5e9", medium: "#6366f1", small: "#334155" } },
        weight: { label: "Weight (kg)", discrete: { large: "#facc15", medium: "#22c55e", small: "#0f766e" } },
        unit_price: { label: "Unit Price ($/kg)", discrete: { large: "#fbbf24", medium: "#f8fafc", small: "#ef4444" } },
        integrated: {
            label: "Integrated View",
            line: { large: "#0ea5e9", medium: "#6366f1", small: "#334155" },
            particle: { large: "#fbbf24", medium: "#f8fafc", small: "#ef4444" }
        }
    }
};

const STATE = {
    data: [],
    geoData: null,
    filteredData: [],
    
    hsCode: "6309",
    metric: "value",
    mapMode: "globe",
    
    // --- 変更点: 輸出と輸入を別管理 ---
    selectedExporters: new Set(),
    selectedImporters: new Set(),
    
    volumeFilters: new Set(['large', 'medium', 'small']),
    
    countryCoords: {},
    countryNames: {}
};