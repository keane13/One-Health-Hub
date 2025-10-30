// Fix: Provides the full content for constants.ts.
import { Disease } from './types';
import { RabiesIcon, AvianFluIcon, LeptospirosisIcon, AnthraxIcon, VirusIcon, MalariaIcon } from './components/icons/DiseaseIcons';

export const DISEASES: Disease[] = [
  {
    id: 'rabies',
    name: 'Rabies',
    description: 'Analisis dan prediksi penyebaran virus rabies pada hewan.',
    Icon: RabiesIcon,
    color: 'bg-red-600',
    accentColor: 'red-400',
  },
  {
    id: 'avian-flu',
    name: 'Flu Burung',
    description: 'Pantau dan prediksi wabah flu burung (H5N1) pada unggas.',
    Icon: AvianFluIcon,
    color: 'bg-blue-600',
    accentColor: 'blue-400',
  },
  {
    id: 'leptospirosis',
    name: 'Leptospirosis',
    description: 'Prediksi risiko Leptospirosis berdasarkan data lingkungan.',
    Icon: LeptospirosisIcon,
    color: 'bg-yellow-500',
    accentColor: 'yellow-400',
  },
  {
    id: 'anthrax',
    name: 'Antraks',
    description: 'Identifikasi potensi wabah Antraks pada ternak dan manusia.',
    Icon: AnthraxIcon,
    color: 'bg-green-600',
    accentColor: 'green-400',
  },
   {
    id: 'covid-19',
    name: 'COVID-19',
    description: 'Analisis & prediksi penyebaran COVID-19 berdasarkan data & intervensi.',
    Icon: VirusIcon,
    color: 'bg-indigo-600',
    accentColor: 'indigo-400',
  },
  {
    id: 'malaria',
    name: 'Malaria',
    description: 'Modelkan penyebaran Malaria berdasarkan data iklim dan kasus.',
    Icon: MalariaIcon,
    color: 'bg-teal-600',
    accentColor: 'teal-400',
  },
];