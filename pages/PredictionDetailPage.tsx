// Fix: Provides the full content for pages/PredictionDetailPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import Header from '../components/Header';
import { LoadingSpinner } from '../components/icons/UiIcons';
import { DISEASES } from '../constants';
import { getPrediction } from '../services/geminiService';
import type { PredictionResult } from '../types';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';


const ALL_INTERVENTIONS = [
    'Vaksinasi Massal',
    'Pembatasan Sosial',
    'Peningkatan Tes & Lacak',
    'Kampanye Kesehatan Masyarakat',
    'Peningkatan Sanitasi',
    'Pengendalian Vektor',
];

const ML_MODELS = [
    'Random Forest',
    'Regresi Linier',
    'LSTM (Long Short-Term Memory)',
    'Temporal Fusion Transformer (TFT)',
];

const PredictionDetailPage: React.FC = () => {
    const { diseaseId } = useParams<{ diseaseId: string }>();
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<string>('');
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [interventions, setInterventions] = useState<{[key: string]: number}>({});
    const [selectedModel, setSelectedModel] = useState<string>(ML_MODELS[0]);
    const [predictionPeriod, setPredictionPeriod] = useState<number>(12);

    const disease = useMemo(() => DISEASES.find(d => d.id === diseaseId), [diseaseId]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            const reader = new FileReader();

            if (selectedFile.name.endsWith('.csv')) {
                reader.onload = (e) => {
                    const text = e.target?.result;
                    setCsvData(text as string);
                };
                reader.readAsText(selectedFile);
            } else if (selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
                reader.onload = (e) => {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const csv = XLSX.utils.sheet_to_csv(worksheet);
                    setCsvData(csv);
                };
                reader.readAsBinaryString(selectedFile);
            } else {
                 setError('Please upload a valid CSV or Excel file.');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }, multiple: false });

    const handleInterventionToggle = (intervention: string) => {
        setInterventions(prev => {
            const newInterventions = { ...prev };
            if (newInterventions.hasOwnProperty(intervention)) {
                delete newInterventions[intervention];
            } else {
                newInterventions[intervention] = 50; // Default to 50%
            }
            return newInterventions;
        });
    };
    
    const handleInterventionValueChange = (intervention: string, value: number) => {
        const clampedValue = Math.max(0, Math.min(100, value));
        setInterventions(prev => ({
            ...prev,
            [intervention]: clampedValue
        }));
    };

    const handlePeriodChange = (value: string) => {
        const period = parseInt(value, 10);
        if (!isNaN(period)) {
            setPredictionPeriod(Math.max(1, Math.min(60, period)));
        } else if (value === '') {
            setPredictionPeriod(1);
        }
    };

    const handlePredict = useCallback(async () => {
        if (!csvData || !disease) return;
        setIsLoading(true);
        setError('');
        setPrediction(null);
        try {
            const result = await getPrediction(disease, csvData, interventions, selectedModel, predictionPeriod);
            setPrediction(result);
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating the prediction.');
        } finally {
            setIsLoading(false);
        }
    }, [csvData, disease, interventions, selectedModel, predictionPeriod]);
    
    if (!disease) {
        return <div>Disease not found.</div>;
    }

    const getRiskLevelColor = (level: PredictionResult['riskLevel']) => {
        switch(level) {
            case 'Low': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'High': return 'text-orange-400';
            case 'Very High': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const accentColorClass = `text-${disease.accentColor}`;

    return (
        <div className="min-h-screen bg-gray-900">
            <Header showBackButton={true} />
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-8">
                    <disease.Icon className={`h-16 w-16 mx-auto mb-4 ${accentColorClass}`} />
                    <h1 className="text-4xl md:text-5xl font-bold text-white">OH<sup className="text-white">2</sup> Prediksi: {disease.name}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">{disease.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Input Section */}
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Konfigurasi Analisis</h2>
                            <p className="text-gray-400 mb-6">Unggah data, pilih model, atur periode prediksi, dan simulasikan dampak intervensi.</p>
                            
                            <h3 className="text-lg font-semibold text-white mb-3">A. Unggah Data (CSV/Excel)</h3>
                            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-green-500 bg-gray-700/50' : 'border-gray-600 hover:border-green-500'}`}>
                                <input {...getInputProps()} />
                                {file ? (
                                    <p className="text-green-400">File terpilih: {file.name}</p>
                                ) : (
                                    <p className="text-gray-400">Seret & lepas file di sini, atau klik untuk memilih file (CSV, XLS, XLSX)</p>
                                )}
                            </div>

                            {csvData && (
                                 <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-white">Pratinjau Data:</h3>
                                    <pre className="mt-2 bg-gray-900 text-gray-300 p-3 rounded-lg text-xs max-h-24 overflow-auto">
                                        <code>{csvData.split('\n').slice(0, 5).join('\n')}</code>
                                    </pre>
                                </div>
                            )}

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">B. Pilih Model Analisis</h3>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3 focus:ring-green-500 focus:border-green-500"
                                    >
                                        {ML_MODELS.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">C. Periode Prediksi</h3>
                                     <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={predictionPeriod}
                                            onChange={(e) => handlePeriodChange(e.target.value)}
                                            className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <span className="text-gray-400">Bulan</span>
                                     </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">D. Simulasi Intervensi (Opsional)</h3>
                                <div className="space-y-4">
                                    {ALL_INTERVENTIONS.map(intervention => (
                                        <div key={intervention}>
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={interventions.hasOwnProperty(intervention)}
                                                    onChange={() => handleInterventionToggle(intervention)}
                                                    className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-green-500 focus:ring-green-500"
                                                />
                                                <span className="text-gray-300">{intervention}</span>
                                            </label>
                                            {interventions.hasOwnProperty(intervention) && (
                                                <div className="flex items-center gap-4 mt-2 pl-8 animate-fade-in">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={interventions[intervention]}
                                                        onChange={(e) => handleInterventionValueChange(intervention, parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-thumb-green-500"
                                                    />
                                                     <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={interventions[intervention]}
                                                        onChange={(e) => handleInterventionValueChange(intervention, parseInt(e.target.value))}
                                                        className="w-20 bg-gray-700 text-center border-gray-600 rounded-lg text-white p-2 focus:ring-green-500 focus:border-green-500"
                                                    />
                                                    <span className="text-xl font-semibold text-white">%</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handlePredict}
                            disabled={!csvData || isLoading}
                            className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><LoadingSpinner /> Menganalisis...</> : 'Jalankan Analisis & Prediksi'}
                        </button>
                        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                    </div>

                    {/* Output Section */}
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Hasil Analisis AI</h2>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-400">AI sedang menganalisis data Anda... <br />Ini mungkin memakan waktu beberapa saat.</p>
                            </div>
                        ) : prediction ? (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400">Tingkat Risiko</h3>
                                    <p className={`text-3xl font-bold ${getRiskLevelColor(prediction.riskLevel)}`}>{prediction.riskLevel}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400">Wawasan Utama</h3>
                                    <p className="text-gray-300">{prediction.insights}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400">Rekomendasi</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {prediction.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center">
                                <p className="text-gray-500">Hasil analisis dan prediksi akan ditampilkan di sini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart Section */}
                {prediction && (
                    <div className="mt-8 bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-6xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Visualisasi Data dan Prediksi</h2>
                         <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={prediction.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                <XAxis dataKey="name" stroke="#A0AEC0" />
                                <YAxis stroke="#A0AEC0" />
                                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                                <Legend />
                                <Bar dataKey="cases" fill="#48BB78" name="Kasus Aktual" />
                                <Line type="monotone" dataKey="predicted" stroke="#F6E05E" strokeWidth={2} name="Prediksi Kasus" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </main>
            <style>{`
                .range-thumb-green-500::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #34D399;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -6px; /* Centers thumb on track */
                }

                .range-thumb-green-500::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: #34D399;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PredictionDetailPage;