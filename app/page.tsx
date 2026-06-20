'use client';

import React from 'react';
import { IPProvider } from '@/context/IPContext';
import { motion } from 'motion/react';
import Header from '@/components/Header';
import QuickGuide from '@/components/QuickGuide';
import IPInputPanel from '@/components/IPInputPanel';
import BitFlipperCard from '@/components/BitFlipperCard';
import BinaryOutput from '@/components/BinaryOutput';
import MathSteps from '@/components/MathSteps';
import NetworkAnalysis from '@/components/NetworkAnalysis';
import FlashcardHub from '@/components/FlashcardHub';
import AIAssistant from '@/components/AIAssistant';
import QuizHub from '@/components/QuizHub';
import DataExporter from '@/components/DataExporter';
import HistorySidebar from '@/components/HistorySidebar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <IPProvider>
      <div className="min-h-screen flex flex-col justify-between" id="app-viewport-wrapper">
        <div className="w-full space-y-6">
          
          {/* 1. Global Interactive Navigation Header */}
          <Header />

          {/* 2. Main content Stage area container */}
          <main className="max-w-7xl mx-auto px-4 md:px-6 pb-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-6"
              id="main-bento-grid"
            >
              {/* Quick info Guide board */}
              <QuickGuide />

              {/* Core grid separation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: LEFT SUB-COLUMN (SPAN 8) -> Analytics, Bit manipulator and Representations */}
                <div className="lg:col-span-8 space-y-6" id="column-tools-analyser">
                  <IPInputPanel />
                  <BitFlipperCard />
                  <BinaryOutput />
                  <MathSteps />
                  <NetworkAnalysis />
                  <FlashcardHub />
                </div>

                {/* COLUMN 2: RIGHT SUB-COLUMN (SPAN 4) -> AI Companion, Flashcard test school, Exports, Sidebar logs */}
                <div className="lg:col-span-4 space-y-6" id="column-ai-gamified-sidebars">
                  <AIAssistant />
                  <QuizHub />
                  <DataExporter />
                  <HistorySidebar />
                </div>

              </div>
            </motion.div>
          </main>
        </div>

        {/* 3. Global custom-themed human Footer */}
        <Footer />
      </div>
    </IPProvider>
  );
}
