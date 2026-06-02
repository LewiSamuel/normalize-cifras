'use client'
import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';

type Cell = {
  row: number;
  col: number;
  value: string;
  type: 'Acorde' | 'Letra';
};

export default function MatrixPage() {
  const [matrix, setMatrix] = useState<Cell[][]>([
    [{ row: 0, col: 0, value: '', type: 'Letra' }],
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [cifras, setCifras] = useState<string[]>([]);

  const openModal = (cell: Cell) => {
    setSelectedCell({ ...cell });
    setIsModalOpen(true);
  };
  const handleAddUrls = (newUrls: string[]) => {
    setUrls(prev => [...prev, ...newUrls]);
  };


  const updateCell = () => {
    if (!selectedCell) return;
    const updated = matrix.map((row) =>
      row.map((cell) =>
        cell.row === selectedCell.row && cell.col === selectedCell.col
          ? selectedCell
          : cell
      )
    );
    setMatrix(updated);
    setIsModalOpen(false);
  };

  const addColumnToRow = (rowIndex: number) => {
    const newMatrix = [...matrix];
    const newColIndex = newMatrix[rowIndex].length;
    newMatrix[rowIndex].push({
      row: rowIndex,
      col: newColIndex,
      value: '',
      type: 'Letra',
    });
    setMatrix(newMatrix);
  };

  const addRowBelow = (rowIndex: number) => {
    const newRowIndex = rowIndex + 1;
    const newRow: Cell[] = matrix[rowIndex].map((_, col) => ({
      row: newRowIndex,
      col,
      value: '',
      type: 'Letra',
    }));

    const newMatrix = [
      ...matrix.slice(0, newRowIndex),
      newRow,
      ...matrix.slice(newRowIndex),
    ];

    // Recalcular os índices de todas as linhas abaixo
    for (let i = newRowIndex + 1; i < newMatrix.length; i++) {
      newMatrix[i] = newMatrix[i].map((cell) => ({ ...cell, row: i }));
    }

    setMatrix(newMatrix);
  };


  const handleContentCifra = async (url: string) => {
    try {
      const response = await fetch(`/api/cifra?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar a cifra");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // Aqui você pode fazer algo com o conteúdo da cifra, como exibi-lo em um modal ou redirecionar para outra página
      // console.log(data.cifra);
      return data.cifra;
    } catch (error) {
      console.error("Erro ao buscar a cifra:", error);
    }
  };

  useEffect(() => {

    urls.forEach(url => {
      handleContentCifra(url).then((data) => {
        setCifras(prev => [...prev, data])
      })
    })

  }, [urls]);


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col gap-1">
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-2">
            {/* botão para adicionar linha abaixo */}
            <button
              onClick={() => addRowBelow(rowIndex)}
              className="bg-green-500 text-white rounded px-2 h-[50px] hover:bg-green-600"
              title="Adicionar linha abaixo"
            >
              +
            </button>

            {/* célula + botão de adicionar coluna */}
            <div className="flex gap-1">
              {row.map((cell) => (
                <div
                  key={`${cell.row}-${cell.col}`}
                  onClick={() => openModal(cell)}
                  className="min-w-[50px] min-h-[50px] p-2 border border-gray-300 bg-white rounded-md cursor-pointer hover:bg-blue-50"
                >
                  {cell.value ? (
                    <span
                      className={`${cell.type === 'Acorde'
                        ? 'text-orange-500 font-bold'
                        : 'text-gray-800'
                        }`}
                    >
                      {cell.value}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xl">+</span>
                  )}
                </div>
              ))}

              {/* botão para adicionar coluna */}
              <button
                onClick={() => addColumnToRow(rowIndex)}
                className="bg-blue-600 text-white rounded px-2 hover:bg-blue-700"
                title="Adicionar coluna"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen bg-black/30">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">Editar Célula</Dialog.Title>
            <div className="mb-2 text-sm text-gray-500">
              Coordenadas: ({selectedCell?.row}, {selectedCell?.col})
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Conteúdo"
                value={selectedCell?.value || ''}
                onChange={(e) =>
                  setSelectedCell((prev) =>
                    prev ? { ...prev, value: e.target.value } : prev
                  )
                }
                className="w-full border rounded p-2"
              />
              <select
                value={selectedCell?.type || 'Letra'}
                onChange={(e) =>
                  setSelectedCell((prev) =>
                    prev ? { ...prev, type: e.target.value as 'Acorde' | 'Letra' } : prev
                  )
                }
                className="w-full border rounded p-2"
              >
                <option value="Letra">Letra</option>
                <option value="Acorde">Acorde</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:underline"
              >
                Cancelar
              </button>
              <button
                onClick={updateCell}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <FloatingButton onClick={() => setModalOpen(true)} />
      <AddUrlsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddUrls}
      />
    </div>
  );
}



function AddUrlsModal({ open, onClose, onSubmit }: { open: boolean, onClose: () => void, onSubmit: (urls: string[]) => void }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = input.split("\n").map(url => url.trim()).filter(Boolean);
    onSubmit(urls);
    setInput("");
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        minWidth: "320px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
      }}>
        <h2>Adicionar URLs de cifras</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={6}
            placeholder="Cole uma ou mais URLs, uma por linha"
            style={{ width: "100%", marginBottom: "1rem", resize: "vertical" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>Cancelar</button>
            <button type="submit" style={{ padding: "0.5rem 1rem", background: "#FFD600", border: "none", fontWeight: "bold" }}>Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );
}


function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        right: "2rem",
        bottom: "2rem",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#FFD600",
        color: "#222",
        border: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        fontSize: "2rem",
        cursor: "pointer",
        zIndex: 1001
      }}
      aria-label="Adicionar URLs"
    >
      +
    </button>
  );
}