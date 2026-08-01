import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Upload, Download, Trash2, Bookmark } from 'lucide-react';
import {
  MAX_PDF_BYTES,
  listPdfs,
  getPdf,
  putPdf,
  deletePdf,
} from '../utils/pdfStore';

type PdfMark = {
  id: string;
  pdfId: string;
  page: number;
  note: string;
};

const MARKS_KEY = 'dnd-homebrew-pdf-marks';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfVaultPage() {
  const [docs, setDocs] = useState<{ id: string; name: string; addedAt: string; size: number }[]>([]);
  const [marks, setMarks] = useState<PdfMark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshDocs = useCallback(async () => {
    try {
      const list = await listPdfs();
      setDocs(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refreshDocs();
    try {
      const m = localStorage.getItem(MARKS_KEY);
      if (m) setMarks(JSON.parse(m));
    } catch { /* ignore */ }
  }, [refreshDocs]);

  useEffect(() => {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
  }, [marks]);

  useEffect(() => {
    let revoked: string | null = null;
    (async () => {
      if (!selectedId) {
        setObjectUrl(null);
        return;
      }
      const doc = await getPdf(selectedId);
      if (!doc) {
        setObjectUrl(null);
        return;
      }
      const url = URL.createObjectURL(doc.blob);
      revoked = url;
      setObjectUrl(url);
    })();
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [selectedId]);

  const docMarks = useMemo(
    () => marks.filter((m) => m.pdfId === selectedId).sort((a, b) => a.page - b.page),
    [marks, selectedId]
  );

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          alert(`${file.name} no es PDF`);
          continue;
        }
        if (file.size > MAX_PDF_BYTES) {
          alert(`${file.name} supera el límite de 150 MB (${formatBytes(file.size)}).`);
          continue;
        }
        await putPdf({
          id: crypto.randomUUID(),
          name: file.name,
          blob: file,
          addedAt: new Date().toISOString(),
        });
      }
      await refreshDocs();
    } catch (e) {
      console.error(e);
      alert('Error al guardar el PDF (¿espacio en el navegador?).');
    } finally {
      setBusy(false);
    }
  };

  const removeDoc = async (id: string) => {
    await deletePdf(id);
    setMarks((p) => p.filter((m) => m.pdfId !== id));
    if (selectedId === id) setSelectedId(null);
    await refreshDocs();
  };

  const addMark = () => {
    if (!selectedId || !note.trim()) return;
    setMarks((p) => [
      ...p,
      { id: crypto.randomUUID(), pdfId: selectedId, page, note: note.trim() },
    ]);
    setNote('');
  };

  const exportAll = async () => {
    setBusy(true);
    try {
      const payload: {
        version: 2;
        marks: PdfMark[];
        docs: { id: string; name: string; addedAt: string; dataBase64: string }[];
        exportedAt: string;
      } = {
        version: 2,
        marks,
        docs: [],
        exportedAt: new Date().toISOString(),
      };
      for (const meta of docs) {
        const full = await getPdf(meta.id);
        if (!full) continue;
        const buf = await full.blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        payload.docs.push({
          id: full.id,
          name: full.name,
          addedAt: full.addedAt,
          dataBase64: btoa(binary),
        });
      }
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dnd-pdf-vault.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('No se pudo exportar (archivo muy grande para JSON).');
    } finally {
      setBusy(false);
    }
  };

  const importAll = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data.marks)) setMarks(data.marks);
      if (Array.isArray(data.docs)) {
        for (const d of data.docs) {
          let blob: Blob;
          if (d.dataBase64) {
            const binary = atob(d.dataBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            blob = new Blob([bytes], { type: 'application/pdf' });
          } else if (d.dataUrl) {
            const res = await fetch(d.dataUrl);
            blob = await res.blob();
          } else continue;
          await putPdf({
            id: d.id || crypto.randomUUID(),
            name: d.name || 'documento.pdf',
            blob,
            addedAt: d.addedAt || new Date().toISOString(),
          });
        }
      }
      await refreshDocs();
      alert('Vault importado.');
    } catch (e) {
      console.error(e);
      alert('Archivo inválido');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" /> Lector de PDF
        </h2>
        <label className={`flex items-center gap-1 text-xs px-3 py-1.5 bg-crimson-600 text-white rounded-lg cursor-pointer ${busy ? 'opacity-50' : ''}`}>
          <Upload className="w-3.5 h-3.5" /> Cargar PDF
          <input type="file" accept="application/pdf,.pdf" multiple className="hidden" disabled={busy}
            onChange={(e) => addFiles(e.target.files)} />
        </label>
        <button type="button" disabled={busy} onClick={exportAll}
          className="flex items-center gap-1 text-xs px-3 py-1.5 border border-ink-300 rounded-lg bg-white disabled:opacity-50">
          <Download className="w-3.5 h-3.5" /> Exportar vault
        </button>
        <label className="flex items-center gap-1 text-xs px-3 py-1.5 border border-ink-300 rounded-lg bg-white cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> Importar vault
          <input type="file" accept="application/json,.json" className="hidden" disabled={busy}
            onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
        </label>
        {busy && <span className="text-xs text-ink-500">Procesando…</span>}
      </div>
      <p className="text-xs text-ink-500">
        Límite por archivo: <strong>150 MB</strong>. Se guardan en IndexedDB de este navegador (no en la nube).
        Exportar vault con PDFs muy grandes puede fallar por memoria; en ese caso conserva los PDF originales aparte.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-2 max-h-[35vh] md:max-h-[75vh] overflow-y-auto space-y-1">
          <h3 className="font-bold text-sm px-2 py-1">Índice</h3>
          {docs.length === 0 && <p className="text-xs text-ink-500 px-2">Sin PDFs.</p>}
          {docs.map((d) => (
            <div key={d.id} className={`flex items-center gap-1 rounded px-2 py-1.5 text-sm ${selectedId === d.id ? 'bg-parchment-200' : 'hover:bg-white'}`}>
              <button type="button" className="flex-1 text-left truncate" onClick={() => setSelectedId(d.id)}>
                {d.name}
                <span className="block text-[10px] text-ink-400">{formatBytes(d.size)}</span>
              </button>
              <button type="button" className="p-1 text-red-600" onClick={() => removeDoc(d.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 space-y-2">
          {selectedId && objectUrl ? (
            <>
              <iframe title="pdf" src={objectUrl} className="w-full h-[45vh] sm:h-[55vh] border-2 border-ink-800 rounded-xl bg-white" />
              <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Bookmark className="w-4 h-4" />
                  <span className="font-bold">Marcadores</span>
                  <label className="text-xs">
                    Página{' '}
                    <input type="number" min={1} value={page}
                      onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                      className="w-16 px-1 border border-ink-300 rounded" />
                  </label>
                  <input value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Nota del marcador…"
                    className="flex-1 min-w-[120px] px-2 py-1 border border-ink-300 rounded text-sm" />
                  <button type="button" onClick={addMark} className="px-2 py-1 bg-ink-800 text-white rounded text-xs">
                    Añadir
                  </button>
                </div>
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {docMarks.map((m) => (
                    <li key={m.id} className="flex gap-2 bg-white border border-ink-200 rounded px-2 py-1">
                      <span className="font-mono shrink-0">p.{m.page}</span>
                      <span className="flex-1">{m.note}</span>
                      <button type="button" className="text-red-600"
                        onClick={() => setMarks((p) => p.filter((x) => x.id !== m.id))}>×</button>
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
