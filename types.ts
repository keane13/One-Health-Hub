// Fix: Add import for React to resolve 'React' namespace error.
import React from 'react';
import type { IconType } from 'react-icons';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Disease {
  id: string;
  name: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  accentColor: string;
}

export interface PredictionResult {
  insights: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  recommendations: string[];
  chartData: {
    name: string;
    cases: number;
    predicted: number;
  }[];
}