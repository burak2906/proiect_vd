import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import api from '../../services/api';

const KMeansChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Apel către endpoint-ul de analytics definit în backend [cite: 33]
        api.get('/analytics/customer-clusters')
            .then(response => {
                const { centers, labels } = response.data;
                
                // Verificăm dacă primim datele înainte de mapare
                if (centers && centers.length > 0) {
                    const plotData = [{
                        x: centers.map(c => c[0]), // Coloana 'age' din backend [cite: 44]
                        y: centers.map(c => c[1]), // Coloana 'order_value' din backend [cite: 52]
                        text: labels,
                        mode: 'markers+text',
                        type: 'scatter',
                        marker: { 
                            size: 18, 
                            color: ['#EF4444', '#3B82F6', '#10B981'], // Roșu, Albastru, Verde (Tailwind colors) [cite: 125]
                            symbol: 'diamond',
                            line: { width: 2, color: 'white' }
                        },
                        textposition: 'top center',
                        textfont: { family: 'Inter, sans-serif', size: 12 }
                    }];

                    setData(plotData);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Eroare la preluarea datelor ML:", error);
                setLoading(false);
            });
    }, []);

    // Loading state pentru o experiență UX mai bună 
    if (loading) return (
        <div className="p-10 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Se procesează cei 50.000 de clienți...</p>
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analiza Segmentelor de Clienți</h2>
            <p className="text-sm text-gray-500 mb-6">Vizualizarea centrelor de consum bazată pe vârstă și valoarea comenzii</p>
            
            <div className="w-full overflow-hidden">
                <Plot
                    data={data}
                    layout={{
                        autosize: true,
                        margin: { l: 60, r: 30, t: 40, b: 60 },
                        hovermode: 'closest',
                        xaxis: { 
                            title: 'Vârstă Medie (Ani)',
                            autorange: true,
                            gridcolor: '#f3f4f6'
                        },
                        yaxis: { 
                            title: 'Valoare Medie Comandă (RON)',
                            autorange: true,
                            gridcolor: '#f3f4f6'
                        },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                    }}
                    // Configurare pentru a face graficul interactiv și salvabil [cite: 126]
                    config={{ 
                        responsive: true, 
                        displayModeBar: true,
                        toImageButtonOptions: { format: 'png', filename: 'segmentare_clienti' }
                    }}
                    style={{ width: "100%", height: "500px" }}
                />
            </div>
        </div>
    );
};

export default KMeansChart;