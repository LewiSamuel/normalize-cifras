'use client';

import React, { useEffect, useState } from 'react';

// Tipagem
type Line = {
  index: number;
  value: string;
  type: 'Acorde' | 'Letra' | 'Grupo';
};

// Regex simples para acordes
const chordRegex = /\b([A-G][#b]?m?(aj7|sus|dim|aug|add)?[0-9]?([/][A-G][#b]?)?)\b/g;

export default function LinearPage() {
  // Estado principal
  const [lines, setLines] = useState<Line[]>([
    { index: 0, value: '', type: 'Letra' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [cifras, setCifras] = useState<string[]>([]);

  // Manipulação de linhas
  const updateLineValue = (index: number, newValue: string) => {
    setLines(prev =>
      prev.map(line =>
        line.index === index ? { ...line, value: newValue } : line
      )
    );
  };

  const updateLineType = (index: number, newType: 'Acorde' | 'Letra' | 'Grupo') => {
    setLines(prev =>
      prev.map(line =>
        line.index === index ? { ...line, type: newType } : line
      )
    );
  };

  const addLine = (type: 'Letra' | 'Acorde' | 'Grupo' = 'Letra') => {
    setLines((prev) => [
      ...prev,
      {
        index: prev.length,
        value: '',
        type,
      },
    ]);
  };
  const deleteLine = (indexToRemove: number) => {
    const newLines = lines
      .filter(line => line.index !== indexToRemove)
      .map((line, idx) => ({ ...line, index: idx }));
    setLines(newLines);
  };

  const handleAddUrls = (newUrls: string[]) => {
    setUrls(prev => [...prev, ...newUrls]);
  };

  // Destaque visual de acordes
  function highlightChords(text: string) {
    const parts = text.split(chordRegex);
    return parts.map((part, index) => {
      if (chordRegex.test(part)) {
        return (
          <span key={index} style={{ color: 'orange', fontWeight: 'bold' }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }

  // Carregar cifra via URL
  const handleContentCifra = async (url: string) => {
    try {
      const response = await fetch(`/api/cifra?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Erro ao buscar a cifra');
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const arrFinalCifra: Line[] = data.cifra
        .split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string, i: number) => ({
          index: i,
          value: line,
          type: i % 2 === 0 ? 'Acorde' : 'Letra',
        }));

      setLines(arrFinalCifra);
      return data.cifra;
    } catch (error) {
      console.error('Erro ao buscar a cifra:', error);
    }
  };

  // Efeito para URLs
  useEffect(() => {
    if (urls.length === 0) return;

    urls.forEach(async (url) => {
      const content = await handleContentCifra(url);
      if (content) {
        setCifras(prev => [...prev, content]);
      }
    });
  }, [urls]);

  // Render
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2">
      <div className="flex w-full max-w-5xl gap-4 mb-6">
        {/* Editor */}
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Editor</h2>
          <div className="w-full">
            {lines.map((line) => (
              <div key={line.index} className="flex items-center bg-gray-50 rounded px-2 mb-1">
                <input
                  type="text"
                  value={line.value}
                  onChange={(e) => updateLineValue(line.index, e.target.value)}
                  className={`flex-1 min-h-[50px] px-3 rounded whitespace-pre bg-transparent focus:outline-none
                    ${line.type === 'Acorde' ? 'text-orange-500 font-bold' : 'text-gray-800'}`}
                  placeholder="+"
                />
                <select
                  value={line.type}
                  onChange={(e) =>
                    updateLineType(line.index, e.target.value as Line['type'])
                  }
                  className="ml-2 border text-sm rounded p-1"
                >
                  <option value="Letra">Letra</option>
                  <option value="Acorde">Acorde</option>
                  <option value="Grupo">Grupo</option>
                </select>
                <button
                  onClick={() => deleteLine(line.index)}
                  className="ml-2 text-red-500 hover:text-red-600 text-xl"
                  title="Remover linha"
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={() => addLine('Letra')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md flex items-center justify-center gap-2 mt-2"
            >
              ➕ Adicionar nova linha
            </button>

            <button
              onClick={() => addLine('Grupo')}
              className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-md flex items-center justify-center gap-2"
            >
              ➕ Adicionar grupo
            </button>
          </div>
        </div>

        {/* Visualização */}
        <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Visualização</h2>
          <div className="whitespace-pre-wrap">
            {lines.map((line) => {
              if (line.type === 'Grupo') {
                return (
                  <div
                    key={line.index}
                    className="text-center text-sm text-gray-600 font-semibold mt-4 mb-2 border-t border-b py-1"
                  >
                    {line.value || '--- Grupo sem nome ---'}
                  </div>
                );
              }

              if (line.type === 'Acorde') {
                return (
                  <div key={line.index} className="text-orange-500 font-bold">
                    {line.value}
                  </div>
                );
              }

              return (
                <div key={line.index} className="text-gray-800">
                  {line.value}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <FloatingButton onClick={() => setModalOpen(true)} />
      <AddUrlsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddUrls}
      />
    </div>
  );
}

// Modal para URLs
function AddUrlsModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (urls: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = input.split('\n').map((url) => url.trim()).filter(Boolean);
    onSubmit(urls);
    setInput('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg min-w-[320px] shadow-lg">
        <h2 className="text-xl font-bold mb-2">Adicionar URLs de cifras</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            placeholder="Cole uma ou mais URLs, uma por linha"
            className="w-full mb-4 p-2 border rounded resize-y"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Botão flutuante
function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-8 bottom-8 w-14 h-14 bg-yellow-400 text-black rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-yellow-300"
      aria-label="Adicionar URLs"
    >
      +
    </button>
  );
}
