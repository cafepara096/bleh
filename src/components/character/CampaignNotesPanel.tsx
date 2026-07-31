import { useState } from 'react';
import type { Character } from '../../types/dnd';
import { Plus, Trash2, Download, Upload } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

export function CampaignNotesPanel({ character, onUpdate }: Props) {
  const notes = character.campaignNotes || [];
  const [title, setTitle] = useState('');

  const setNotes = (campaignNotes: Character['campaignNotes']) =>
    onUpdate({ campaignNotes });

  const addPanel = () => {
    const t = title.trim() || `Nota ${notes.length + 1}`;
    setNotes([
      ...notes,
      { id: crypto.randomUUID(), title: t, body: '', updatedAt: new Date().toISOString() },
    ]);
    setTitle('');
  };

  const updatePanel = (id: string, patch: Partial<(typeof notes)[0]>) => {
    setNotes(
      notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const removePanel = (id: string) => setNotes(notes.filter((n) => n.id !== id));

  const exportTxt = () => {
    const text = notes
      .map((n) => `## ${n.title}\n\n${n.body}\n`)
      .join('\n---\n\n');
    const blob = new Blob([text || '(sin notas)'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'campaña'}-notas.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTxt = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parts = text.split(/\n---\n/).map((p) => p.trim()).filter(Boolean);
      const parsed = parts.map((part, i) => {
        const lines = part.split('\n');
        let t = `Nota ${i + 1}`;
        let body = part;
        if (lines[0]?.startsWith('## ')) {
          t = lines[0].replace(/^##\s+/, '');
          body = lines.slice(1).join('\n').trim();
        }
        return {
          id: crypto.randomUUID(),
          title: t,
          body,
          updatedAt: new Date().toISOString(),
        };
      });
      if (parsed.length) setNotes([...(notes || []), ...parsed]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold">Notas de campaña</h3>
        <button type="button" onClick={exportTxt} className="flex items-center gap-1 text-xs px-2 py-1 border border-ink-300 rounded bg-white">
          <Download className="w-3 h-3" /> Exportar TXT
        </button>
        <label className="flex items-center gap-1 text-xs px-2 py-1 border border-ink-300 rounded bg-white cursor-pointer">
          <Upload className="w-3 h-3" /> Importar TXT
          <input
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importTxt(e.target.files[0])}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del panel…"
          className="flex-1 px-2 py-1 border border-ink-300 rounded text-sm"
        />
        <button type="button" onClick={addPanel} className="flex items-center gap-1 px-3 py-1 bg-crimson-600 text-white rounded text-sm">
          <Plus className="w-4 h-4" /> Panel
        </button>
      </div>
      <div className="space-y-3">
        {notes.length === 0 && (
          <p className="text-sm text-ink-500 italic">Crea paneles con título para anotar la campaña.</p>
        )}
        {notes.map((n) => (
          <div key={n.id} className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={n.title}
                onChange={(e) => updatePanel(n.id, { title: e.target.value })}
                className="flex-1 font-bold bg-transparent border-b border-ink-300 focus:border-crimson-600 outline-none"
              />
              <button type="button" onClick={() => removePanel(n.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={n.body}
              onChange={(e) => updatePanel(n.id, { body: e.target.value })}
              rows={5}
              className="w-full text-sm px-2 py-1 border border-ink-200 rounded bg-white"
              placeholder="Escribe aquí…"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
