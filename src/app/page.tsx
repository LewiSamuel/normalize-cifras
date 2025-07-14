'use client';
import { url } from "inspector";
import React, { useEffect, useState } from "react";


function Navbar() {
  return (
    <nav style={{
      width: "100%",
      padding: "1rem",
      background: "#FFD600",
      color: "#222",
      fontWeight: "bold",
      fontSize: "1.5rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      CifraClub
    </nav>
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

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [cifras, setCifras] = useState<string[]>([]);

  const handleAddUrls = (newUrls: string[]) => {
    setUrls(prev => [...prev, ...newUrls]);
  };

  // Regex simples para identificar acordes: C, D, E, F, G, A, B com variações (#, b, m, 7, etc.)
  const chordRegex = /\b([A-G][#b]?m?(aj7|sus|dim|aug|add)?[0-9]?([/][A-G][#b]?)?)\b/g;

  function highlightChords(text:string) {
    const parts = text.split(chordRegex);

    return parts.map((part, index) => {
      if (chordRegex.test(part)) {
        return (
          <span key={index} style={{ color: 'orange', fontWeight: 'bold' }}>
            {part}
          </span>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }

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
    <>
      <Navbar />
      <main style={{ padding: "2rem" }}>
        <h1>Minhas cifras</h1>
        {cifras.length === 0 ? (
          <p>Nenhuma cifra adicionada ainda.</p>
        ) : (
          <ul>
            {cifras.map((content, idx) => (
              <li key={idx} style={{ whiteSpace: 'pre-wrap' }}>
                {highlightChords(content)}
              </li>
            ))}
          </ul>
        )}
      </main>
      <FloatingButton onClick={() => setModalOpen(true)} />
      <AddUrlsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddUrls}
      />
    </>
  );
}