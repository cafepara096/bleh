import { useEffect, useMemo, useState } from 'react';
import { FileText, Upload, Download, Trash2, Bookmark } from 'lucide-react';

type PdfDoc = {
  id: string;
  name: string;
  /** base64 data URL */
  dataUrl: string;
  addedAt: string;
};

type PdfMark = {
  id: string;
  pdfId: string;
  page: number;
  note: string;
};

const DOCS_KEY = 'dnd-homebrew-pdfs';
const MARKS_KEY = 'dnd-homebrew-pdf-marks';

export function PdfVaultPage() {
  const [docs, setDocs] = useState<PdfDoc[]>([]);
  const [marks, setMarks] = useState<PdfMark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      const d = localStorage.getItem(DOCS_KEY);
      const m = localStorage.getItem(MARKS_KEY);
      if (d) setDocs(JSON.parse(d));
      if (m) setMarks(JSON.parse(m));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }, [docs]);
  useEffect(() => {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
  }, [marks]);

  const selected = docs.find((d) => d.id === selectedId) || null;
  const docMarks = useMemo(
    () => marks.filter((m) => m.pdfId === selectedId).sort((a, b) => a.page - b.page),
    [marks, selectedId]
  );

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert(`${file.name} no es PDF`);
        continue;
      }
      if (file.size > 4_500_000) {
        alert(`${file.name} supera ~4.5MB (límite del navegador). Usa un PDF más ligero.`);
        continue;
      }
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      setDocs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl,
          addedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const addMark = () => {
    if (!selectedId || !note.trim()) return;
    setMarks((p) => [
      ...p,
      { id: crypto.randomUUID(), pdfId: selectedId, page, note: note.trim() },
    ]);
    setNote('');
  };

  const exportAll = () => {
    const payload = { version: 1, docs, marks, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dnd-pdf-vault.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result));
        if (Array.isArray(data.docs)) setDocs(data.docs);
        if (Array.isArray(data.marks)) setMarks(data.marks);
        alert('Vault importado.');
      } catch {
        alert('Archivo inválido');
      }
    };
    r.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" /> Lector de PDF
        </h2>
        <label className="flex items-center gap-1 text-xs px-3 py-1.5 bg-crimson-600 text-white rounded-lg cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> Cargar PDF
          <input type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </label>
        <button type="button" onClick={exportAll} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-ink-300 rounded-lg bg-white">
          <Download className="w-3.5 h-3.5" /> Exportar vault
        </button>
        <label className="flex items-center gap-1 text-xs px-3 py-1.5 border border-ink-300 rounded-lg bg-white cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> Importar vault
          <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
        </label>
      </div>
      <p className="text-xs text-ink-500">
        Los PDF se guardan en este navegador (límite práctico ~4.5MB por archivo). Exporta el vault para respaldar PDFs + marcadores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-2 max-h-[75vh] overflow-y-auto space-y-1">
          <h3 className="font-bold text-sm px-2 py-1">Índice</h3>
          {docs.length === 0 && <p className="text-xs text-ink-500 px-2">Sin PDFs.</p>}
          {docs.map((d) => (
            <div key={d.id} className={`flex items-center gap-1 rounded px-2 py-1.5 text-sm ${selectedId === d.id ? 'bg-parchment-200' : 'hover:bg-white'}`}>
              <button type="button" className="flex-1 text-left truncate" onClick={() => setSelectedId(d.id)}>
                {d.name}
              </button>
              <button
                type="button"
                className="p-1 text-red-600"
                onClick={() => {
                  setDocs((p) => p.filter((x) => x.id !== d.id));
                  setMarks((p) => p.filter((m) => m.pdfId !== d.id));
                  if (selectedId === d.id) setSelectedId(null);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 space-y-2">
          {selected ? (
            <>
              <iframe title={selected.name} src={selected.dataUrl} className="w-full h-[55vh] border-2 border-ink-800 rounded-xl bg-white" />
              <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Bookmark className="w-4 h-4" />
                  <span className="font-bold">Marcadores</span>
                  <label className="text-xs">
                    Página{' '}
                    <input
                      type="number"
                      min={1}
                      value={page}
                      onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                      className="w-16 px-1 border border-ink-300 rounded"
                    />
                  </label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nota del marcador…"
                    className="flex-1 min-w-[120px] px-2 py-1 border border-ink-300 rounded text-sm"
                  />
                  <button type="button" onClick={addMark} className="px-2 py-1 bg-ink-800 text-white rounded text-xs">
                    Añadir
                  </button>
                </div>
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {docMarks.map((m) => (
                    <li key={m.id} className="flex gap-2 bg-white border border-ink-200 rounded px-2 py-1">
                      <span className="font-mono shrink-0">p.{m.page}</span>
                      <span className="flex-1">{m.note}</span>
                      <button type="button" className="text-red-600" onClick={() => setMarks((p) => p.filter((x) => x.id !== m.id))}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-500">Elige un PDF del índice.</p>
          )}
        </div>
      </div>
    </div>
  );
}
