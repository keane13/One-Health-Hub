
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ChatIcon, AnalyticsIcon } from '../components/icons/UiIcons';

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-gray-900 to-blue-900 z-0"></div>
      <div className="absolute inset-0 bg-grid-gray-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
              OH<sup>2</sup> (One Health Hub)
            </h1>
            <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
              Mengintegrasikan kesehatan manusia, hewan, dan lingkungan untuk masa depan yang lebih sehat melalui kekuatan AI.
            </p>
          </div>

          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ActionCard
              icon={<ChatIcon className="h-12 w-12 text-blue-300" />}
              title="Konsultasi AI One Health"
              description="Tanyakan apapun tentang One Health, penyakit zoonosis, dan pencegahannya kepada asisten AI kami."
              buttonText="Mulai Chat"
              to="/chatbot"
            />
            <ActionCard
              icon={<AnalyticsIcon className="h-12 w-12 text-green-300" />}
              title="Prediksi Penyakit One Health"
              description="Analisis data penyakit, identifikasi pola, dan dapatkan prediksi risiko wabah menggunakan AI."
              buttonText="Mulai Prediksi"
              to="/prediction"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  to: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, buttonText, to }) => (
  <div className="animate-fade-in-up transform transition-all duration-500 hover:scale-105 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-green-500/10">
    <div className="mb-4">{icon}</div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-400 flex-grow mb-6">{description}</p>
    <Link
      to={to}
      className="mt-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 w-full"
    >
      {buttonText}
    </Link>
  </div>
);

export default HomePage;