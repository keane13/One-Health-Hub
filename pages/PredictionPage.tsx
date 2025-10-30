import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { DISEASES } from '../constants';

const PredictionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header showBackButton={true} />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Prediksi Penyakit OH<sup className="text-white">2</sup></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Pilih jenis penyakit untuk mengunggah data, menganalisis tren, dan mendapatkan prediksi risiko wabah berbasis AI.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {DISEASES.map((disease, index) => (
            <Link 
              to={`/prediction/${disease.id}`} 
              key={disease.id}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`relative p-8 rounded-2xl h-full flex flex-col items-center text-center transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl ${disease.color} overflow-hidden`}>
                <div className={`absolute -top-4 -right-4 h-24 w-24 text-white/10`}>
                  <disease.Icon className="h-full w-full" />
                </div>
                <div className="relative z-10">
                  <div className={`mb-4 inline-block p-3 rounded-full bg-white/20`}>
                    <disease.Icon className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{disease.name}</h2>
                  <p className="text-white/80">{disease.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PredictionPage;