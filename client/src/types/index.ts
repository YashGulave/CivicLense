export interface District {
  id: number;
  name: string;
  risk_level: 'low' | 'medium' | 'high';
  description: string;
  center_lat: number;
  center_lng: number;
  radius_m: number;
  legal_framework: string;
  node_count?: number;
}

export interface SurveillanceNode {
  id: number;
  name: string;
  type: 'cctv' | 'facial_recognition' | 'data_collection' | 'safe_zone';
  operator: string;
  retention_days: number;
  lat: number;
  lng: number;
  district_id: number;
  risk_level: 'low' | 'medium' | 'high';
  description: string;
  district_name?: string;
  legal_framework?: string;
}

export interface ZonesResponse {
  nodes: SurveillanceNode[];
  districts: District[];
  cityCenter: { lat: number; lng: number };
}

export interface Report {
  id: number;
  submission_hash: string;
  incident_type: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface ScoreResult {
  score: number;
  riskLabel: string;
  routeDistanceM: number;
  intersectedNodeCount: number;
  intersectedDistrictCount: number;
  breakdown: {
    nodes: Array<{
      id: number;
      name: string;
      type: string;
      risk_level: string;
      operator: string;
      contribution: number;
    }>;
    districts: Array<{
      id: number;
      name: string;
      risk_level: string;
      contribution: number;
    }>;
    byType: Record<string, number>;
  };
  recommendations: string[];
}

export type LayerType = 'cctv' | 'facial_recognition' | 'data_collection' | 'safe_zone';
