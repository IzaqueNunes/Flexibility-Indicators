import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Search, AlertCircle, CheckCircle2, ChevronRight, Loader2, Download } from 'lucide-react';
import { analyzeArticle, AnalysisResult } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';

type IndicatorKey = keyof AnalysisResult['article_analysis'];

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Por favor, envie apenas arquivos PDF.');
      }
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        throw new Error('Não foi possível extrair texto do PDF. O arquivo pode estar vazio ou protegido.');
      }
      const analysis = await analyzeArticle(text);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro durante a análise.');
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_${file?.name.replace('.pdf', '') || 'artigo'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1A1A1A] text-white rounded">
              <Search size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BPM Flexibility <span className="font-serif italic font-normal text-[#1A1A1A]/60">Analyzer</span></h1>
          </div>
          <div className="text-xs font-mono text-[#1A1A1A]/40 uppercase tracking-widest hidden md:block">
            ACADEMIC RESEARCH TOOL v1.0
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 gap-12">
          {/* Intro Section */}
          <section className="space-y-4">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-tighter rounded-full">
              Ferramenta Especializada
            </div>
            <h2 className="text-4xl font-light leading-tight">
              Rigorosa análise de indicadores de <span className="font-serif italic">flexibilidade de processo</span> em artigos científicos.
            </h2>
            <p className="text-[#1A1A1A]/60 max-w-2xl">
              Nossa inteligência analisa conceitos, definições e implementações de BPM (Business Process Management) 
              para identificar evidências reais ou indícios de flexibilidade em artigos em Português ou Inglês.
            </p>
          </section>

          {/* Upload Section */}
          <section>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer bg-white group h-64 flex flex-col items-center justify-center
                ${file ? 'border-[#1A1A1A] bg-[#1A1A1A]/5' : 'border-[#1A1A1A]/20 hover:border-[#1A1A1A]/40'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="application/pdf"
                onChange={handleFileChange}
              />
              
              <div className="p-4 bg-white rounded-full shadow-sm border border-[#1A1A1A]/5 group-hover:scale-110 transition-transform mb-4">
                <Upload size={32} className={file ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'} />
              </div>
              
              {file ? (
                <div className="text-center">
                  <p className="font-medium text-lg leading-none mb-2">{file.name}</p>
                  <p className="text-xs text-[#1A1A1A]/40 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-medium text-lg leading-none mb-1">Upload Artigo Científico</p>
                  <p className="text-sm text-[#1A1A1A]/40">Arraste um PDF ou clique para selecionar</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {file && !result && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 flex justify-center"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
                    className="flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-medium hover:bg-neutral-800 transition-all hover:gap-4 shadow-lg shadow-[#1A1A1A]/20"
                  >
                    Iniciar Análise <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Loading State */}
          {loading && (
            <section className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={48} className="text-[#1A1A1A] animate-spin" />
              <div className="text-center">
                <p className="font-medium text-lg">Processando artigo...</p>
                <p className="text-sm text-[#1A1A1A]/40 italic font-serif">O Gemini está extraindo e analisando conceitos de BPM</p>
              </div>
            </section>
          )}

          {/* Error State */}
          {error && (
            <section className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
              <AlertCircle className="text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold text-red-900">Erro na Análise</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </section>
          )}

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 pb-20"
              >
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">Diagnóstico do Artigo</h3>
                  <button 
                    onClick={downloadJson}
                    className="flex items-center gap-2 text-sm font-mono hover:underline text-[#1A1A1A]/60"
                  >
                    <Download size={16} /> DOWNLOAD JSON
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(Object.keys(result.article_analysis) as IndicatorKey[]).map((key) => {
                    const data = result.article_analysis[key];
                    const label = key.replace(/_/g, ' ').replace('flexibilidade por ', '');
                    const statusColor = data.status === 'Encontrado' ? 'bg-green-100 text-green-800' : 
                                      data.status === 'Possível Indício' ? 'bg-amber-100 text-amber-800' : 
                                      'bg-slate-100 text-slate-500';
                    const icon = data.status === 'Encontrado' ? <CheckCircle2 size={16} /> : 
                                data.status === 'Possível Indício' ? <AlertCircle size={16} /> : 
                                <FileText size={16} />;

                    return (
                      <div key={key} className="bg-white border border-[#1A1A1A]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="px-6 py-4 border-b border-[#1A1A1A]/5 flex items-center justify-between">
                          <h4 className="font-bold uppercase text-xs tracking-wider">{label}</h4>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {icon} {data.status}
                          </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col space-y-4">
                          <div>
                            <p className="text-[10px] font-mono text-[#1A1A1A]/40 uppercase mb-1 tracking-widest">Trecho Exato</p>
                            <p className="text-sm font-serif italic text-[#1A1A1A]/80 bg-neutral-50 p-3 rounded-lg border border-[#1A1A1A]/5 leading-relaxed">
                              "{data.trecho_exato || 'Sem citação direta disponível.'}"
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-[#1A1A1A]/40 uppercase mb-1 tracking-widest">Justificativa</p>
                            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
                              {data.justificativa}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A]/10 py-8 bg-neutral-50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#1A1A1A]/40 text-xs font-mono">
          <p>© 2026 BPM RESEARCH HUB</p>
          <div className="flex gap-6">
            <span>DESIGN BY FLEX-STUDIO</span>
            <span>POWERED BY GEMINI 3 FLASH</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
