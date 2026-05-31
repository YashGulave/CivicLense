import { useEffect, useState } from 'react';
import { fetchZones } from '../api';
import type { SurveillanceNode, District, LayerType, ZonesResponse } from '../types';
import SurveillanceMap from '../components/SurveillanceMap';
import LayerToggle from '../components/LayerToggle';
import NodeDetailPanel from '../components/NodeDetailPanel';
import { getRiskColor } from '../utils/helpers';

const defaultLayers: Record<LayerType, boolean> = {
  cctv: true,
  facial_recognition: true,
  data_collection: true,
  safe_zone: true,
};

export default function MapPage() {
  const [data, setData] = useState<ZonesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLayers, setActiveLayers] = useState(defaultLayers);
  const [selectedNode, setSelectedNode] = useState<SurveillanceNode | null>(null);

  useEffect(() => {
    fetchZones()
      .then(setData)
      .catch(() => setError('Failed to load surveillance data. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  const toggleLayer = (layer: LayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const visibleCount = data?.nodes.filter((n) => activeLayers[n.type]).length ?? 0;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading surveillance map...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-red-500">{error || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Surveillance Map</h1>
          <p className="mt-1 text-sm text-slate-400">
            Metrovale City — {data.nodes.length} nodes across {data.districts.length} districts
          </p>
        </div>
        <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-500" /> High Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" /> Medium Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> Low Risk / Safe Zone
        </span>
        <span className="ml-auto text-slate-500">{visibleCount} markers visible</span>
      </div>

      <div className="relative">
        <SurveillanceMap
          nodes={data.nodes}
          districts={data.districts}
          cityCenter={data.cityCenter}
          activeLayers={activeLayers}
          onNodeSelect={setSelectedNode}
          height="calc(100vh - 280px)"
        />
        <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {data.districts.map((d: District) => (
          <div
            key={d.id}
            className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getRiskColor(d.risk_level) }}
              />
              <span className="text-sm font-medium text-white">{d.name}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 capitalize">{d.risk_level} risk district</p>
          </div>
        ))}
      </div>
    </div>
  );
}
