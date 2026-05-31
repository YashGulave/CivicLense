import type { SurveillanceNode } from '../types';
import { getRiskColor, getTypeLabel, getTypeIcon } from '../utils/helpers';

interface NodeDetailPanelProps {
  node: SurveillanceNode | null;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  return (
    <div className="animate-slide-in absolute right-0 top-0 z-[1000] h-full w-full max-w-sm overflow-y-auto border-l border-slate-700 bg-slate-900/95 p-5 backdrop-blur-md sm:w-80">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="text-2xl">{getTypeIcon(node.type)}</span>
          <h3 className="mt-1 text-lg font-semibold text-white">{node.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-slate-800/60 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Type</p>
          <p className="font-medium text-cyan-400">{getTypeLabel(node.type)}</p>
        </div>

        <div className="rounded-lg bg-slate-800/60 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Risk Level</p>
          <p className="font-medium" style={{ color: getRiskColor(node.risk_level) }}>
            {node.risk_level.toUpperCase()}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/60 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Operator</p>
          <p>{node.operator}</p>
        </div>

        <div className="rounded-lg bg-slate-800/60 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Data Retention</p>
          <p>{node.retention_days === 0 ? 'None (Safe Zone)' : `${node.retention_days} days`}</p>
        </div>

        {node.district_name && (
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">District</p>
            <p>{node.district_name}</p>
          </div>
        )}

        <div className="rounded-lg bg-slate-800/60 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Description</p>
          <p className="text-sm text-slate-300">{node.description}</p>
        </div>

        <div className="rounded-lg border border-slate-700 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Coordinates</p>
          <p className="font-mono text-xs text-slate-400">
            {node.lat.toFixed(5)}, {node.lng.toFixed(5)}
          </p>
        </div>
      </div>
    </div>
  );
}
