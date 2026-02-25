/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Flower2, Loader2, Sparkles, ArrowRight, RefreshCcw, BookOpen, Heart, Compass } from "lucide-react";
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFlower = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: `You are a compassionate college counselor and expert in symbolic interpretation. 
              Analyze this photo of a DIY flower. 
              
              1. **Symbolic Interpretation**: Identify the components (colors of petals, materials used, stem shape, center details). Assign a psychological or situational meaning to each component in the context of a student applying to college. 
                 - Example: "Blue paper petals suggest a calm exterior but potential underlying anxiety about deadlines."
                 - Example: "A sturdy wire stem represents a strong support system at home."
              
              2. **Personalized Resources**: Based on the interpretation, provide a curated list of resources for college applications.
                 - If they seem anxious: Stress reduction tips, mindfulness apps, or "how to handle rejection" guides.
                 - If they seem ambitious: Links to top-tier scholarship databases or essay polishing services.
                 - If they seem creative: Advice on building a portfolio or finding liberal arts colleges with strong arts programs.
              
              Format the response in beautiful Markdown. Use headers, bullet points, and bold text for emphasis. Make it feel encouraging and "crafted".`,
            },
          ],
        },
      });

      setAnalysis(response.text || "I couldn't analyze the flower. Please try another photo.");
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the image. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 max-w-2xl"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bloom-olive/10 text-bloom-olive mb-6">
          <Flower2 size={32} />
        </div>
        <h1 className="serif text-5xl md:text-7xl mb-4 tracking-tight">Admission Season</h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Your DIY flower holds the key to your college journey. Upload a photo to uncover personalized resources and guidance.
        </p>
      </motion.header>

      <main className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer border-2 border-dashed border-bloom-olive/20 rounded-[32px] p-12 md:p-24 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:border-bloom-olive/40 transition-all duration-500"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-20 h-20 rounded-full bg-bloom-cream flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="text-bloom-olive" size={32} />
                </div>
                <h3 className="serif text-2xl mb-2">Plant your flower here</h3>
                <p className="text-bloom-olive/60 text-center max-w-xs">
                  Drag and drop your DIY flower photo or click to browse your files.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Image Preview */}
                <div className="relative group">
                  <div className="aspect-[3/4] rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                    <img 
                      src={image} 
                      alt="Your DIY Flower" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={reset}
                    className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-bloom-olive hover:bg-bloom-cream transition-colors"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>

                {/* Action / Results */}
                <div className="space-y-6">
                  {!analysis && !isAnalyzing && (
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-bloom-olive/5">
                      <h3 className="serif text-3xl mb-4">Ready to bloom?</h3>
                      <p className="mb-8 opacity-80">
                        Our AI counselor will analyze the colors, shapes, and materials of your flower to provide tailored college application advice.
                      </p>
                      <button 
                        onClick={analyzeFlower}
                        className="w-full py-4 bg-bloom-olive text-white rounded-full flex items-center justify-center gap-2 hover:bg-bloom-olive/90 transition-all shadow-lg shadow-bloom-olive/20 group"
                      >
                        <span>Analyze My Flower</span>
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                      </button>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="bg-white p-12 rounded-[32px] shadow-sm border border-bloom-olive/5 flex flex-col items-center justify-center text-center">
                      <Loader2 className="animate-spin text-bloom-clay mb-6" size={48} />
                      <h3 className="serif text-2xl mb-2">Interpreting your creation...</h3>
                      <p className="opacity-60 italic">"Every petal tells a story of your potential."</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100">
                      <p>{error}</p>
                      <button 
                        onClick={analyzeFlower}
                        className="mt-4 text-sm font-semibold underline underline-offset-4"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Result */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-bloom-olive/5"
                >
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-bloom-cream">
                    <div className="w-12 h-12 rounded-full bg-bloom-cream flex items-center justify-center text-bloom-clay">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="serif text-3xl">The Interpretation</h2>
                      <p className="text-sm opacity-60">Crafted specifically for your journey</p>
                    </div>
                  </div>
                  
                  <div className="markdown-body prose prose-bloom max-w-none">
                    <Markdown>{analysis}</Markdown>
                  </div>

                  <div className="mt-12 pt-8 border-t border-bloom-cream grid sm:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center p-4">
                      <BookOpen className="text-bloom-clay mb-2" size={24} />
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Resources</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <Heart className="text-bloom-clay mb-2" size={24} />
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Support</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <Compass className="text-bloom-clay mb-2" size={24} />
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Guidance</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-24 text-center opacity-40 text-sm max-w-md">
        <p>Admission Season. A activity for college applicants and guardians. </p>
      </footer>
    </div>
  );
}
