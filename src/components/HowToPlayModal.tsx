import React from 'react';
import { X, CheckCircle, HandMetal, Sparkles, Star, Zap, BookCheck } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HandMetal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              How to Play & Scoring Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              4x4 Grid Swipe & Point Rules
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 my-4 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-black/5 dark:border-white/5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Swipe Horizontally &amp; Vertically (No Diagonals)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drag up, down, left, or right across adjacent tiles to connect 4 letters. Diagonal moves are not allowed. You can drag backwards anytime to undo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-black/5 dark:border-white/5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Dictionary Word Validation
                </p>
                <BookCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every drawn 4-letter word is checked against a standard English dictionary. Only legitimate valid words are approved and added to your discovered list!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-black/5 dark:border-white/5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Multi-Tier Scoring System
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Earn massive points through multiple stacking bonus mechanisms:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5">
                  <span className="font-bold text-slate-900 dark:text-white block">Word Length</span>
                  <span className="text-slate-500 dark:text-slate-400">4 letters = 100 base pts</span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5">
                  <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Rare Letters
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">Up to +40 pts per rare letter (Q, Z, J, X, K...)</span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5">
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Quick Finding
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">Find in &lt;3s (+50), &lt;6s (+30), &lt;10s (+15)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Use the Word Checker at the bottom of the word list to verify any word directly in the dictionary!
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Understood, Let&apos;s Play!</span>
        </button>
      </div>
    </div>
  );
};
