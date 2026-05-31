import type { LayerType } from '../types';
import { getTypeLabel, getTypeIcon } from '../utils/helpers';

interface LayerToggleProps {
  activeLayers: Record<LayerType, boolean>;
  onToggle: (layer: LayerType) => void;
}

const layers: LayerType[] = ['cctv', 'facial_recognition', 'data_collection', 'safe_zone'];

export default function LayerToggle({ activeLayers, onToggle }: LayerToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {layers.map((layer) => (
        <button
          key={layer}
          onClick={() => onToggle(layer)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeLayers[layer]
              ? 'bg-cyan-400/15 text-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700 hover:text-slate-300'
          }`}
        >
          <span>{getTypeIcon(layer)}</span>
          {getTypeLabel(layer)}
        </button>
      ))}
    </div>
  );
}
