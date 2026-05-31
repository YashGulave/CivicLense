import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { SurveillanceNode, District, LayerType } from '../types';
import { getRiskColor, getTypeLabel, getTypeIcon } from '../utils/helpers';

const defaultIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#38bdf8;border:2px solid white;box-shadow:0 0 6px rgba(56,189,248,0.6)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function createNodeIcon(color: string, type: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}88;display:flex;align-items:center;justify-content:center;font-size:8px">${getTypeIcon(type)}</div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

interface SurveillanceMapProps {
  nodes: SurveillanceNode[];
  districts: District[];
  cityCenter: { lat: number; lng: number };
  activeLayers: Record<LayerType, boolean>;
  onNodeSelect?: (node: SurveillanceNode) => void;
  routePoints?: Array<{ lat: number; lng: number }>;
  onMapClick?: (lat: number, lng: number) => void;
  clickMode?: 'none' | 'start' | 'end' | 'report';
  height?: string;
}

function ClickHandler({ onMapClick, clickMode }: { onMapClick?: (lat: number, lng: number) => void; clickMode?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick || clickMode === 'none') return;
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onMapClick, clickMode]);
  return null;
}

export default function SurveillanceMap({
  nodes,
  districts,
  cityCenter,
  activeLayers,
  onNodeSelect,
  routePoints,
  onMapClick,
  clickMode = 'none',
  height = '600px',
}: SurveillanceMapProps) {
  const filteredNodes = nodes.filter((n) => activeLayers[n.type]);

  const routeLine: [number, number][] | null =
    routePoints && routePoints.length >= 2
      ? routePoints.map((p) => [p.lat, p.lng] as [number, number])
      : null;

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-xl ring-1 ring-slate-700">
      <MapContainer
        center={[cityCenter.lat, cityCenter.lng]}
        zoom={14}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={[cityCenter.lat, cityCenter.lng]} zoom={14} />
        <ClickHandler onMapClick={onMapClick} clickMode={clickMode} />

        {districts.map((d) => (
          <Circle
            key={`district-${d.id}`}
            center={[d.center_lat, d.center_lng]}
            radius={d.radius_m}
            pathOptions={{
              color: getRiskColor(d.risk_level),
              fillColor: getRiskColor(d.risk_level),
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6 4',
            }}
          >
            <Popup>
              <div className="space-y-1">
                <strong>{d.name}</strong>
                <p className="text-xs text-slate-400">Risk: {d.risk_level.toUpperCase()}</p>
                <p className="text-xs">{d.description}</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {filteredNodes.map((node) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={createNodeIcon(getRiskColor(node.risk_level), node.type)}
            eventHandlers={{
              click: () => onNodeSelect?.(node),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <strong className="text-cyan-400">{node.name}</strong>
                <p><span className="text-slate-400">Type:</span> {getTypeLabel(node.type)}</p>
                <p><span className="text-slate-400">Operator:</span> {node.operator}</p>
                <p><span className="text-slate-400">Retention:</span> {node.retention_days} days</p>
                <p><span className="text-slate-400">Risk:</span>{' '}
                  <span style={{ color: getRiskColor(node.risk_level) }}>
                    {node.risk_level.toUpperCase()}
                  </span>
                </p>
                {node.district_name && (
                  <p><span className="text-slate-400">District:</span> {node.district_name}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#38bdf8', weight: 4, opacity: 0.8, dashArray: '8 6' }}
          />
        )}

        {routePoints?.map((p, i) => (
          <Marker
            key={`route-${i}`}
            position={[p.lat, p.lng]}
            icon={defaultIcon}
          >
            <Popup>{i === 0 ? 'Start' : i === 1 ? 'End' : `Point ${i + 1}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
