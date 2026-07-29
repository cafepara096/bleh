interface Props {
  successes: number;
  failures: number;
  onChange: (successes: number, failures: number) => void;
}

export function DeathSaves({ successes, failures, onChange }: Props) {
  const toggleSuccess = (index: number) => {
    const newSuccesses = successes > index ? index : index + 1;
    onChange(newSuccesses, failures);
  };

  const toggleFailure = (index: number) => {
    const newFailures = failures > index ? index : index + 1;
    onChange(successes, newFailures);
  };

  return (
    <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm">
      <h3 className="font-bold text-sm mb-2 text-center">Tiradas de Muerte</h3>
      <div className="flex justify-around">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-green-700 font-medium">Éxitos</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <button
                key={`s-${i}`}
                onClick={() => toggleSuccess(i)}
                className={`w-5 h-5 rounded-full border-2 border-green-700 transition-colors ${
                  successes > i ? 'bg-green-600' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-red-700 font-medium">Fallos</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <button
                key={`f-${i}`}
                onClick={() => toggleFailure(i)}
                className={`w-5 h-5 rounded-full border-2 border-red-700 transition-colors ${
                  failures > i ? 'bg-red-600' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
