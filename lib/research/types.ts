export interface ResearchInput {
  industryId: string;
  regionId: string;
  radiusKm: number;
  maxResults: number;
  sourceSlug?: string;
}

export interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OSMResponse {
  elements: OSMElement[];
  remark?: string;
}

export interface ResearchResultDraft {
  company_name: string;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  source_ref: string;
  raw_data: OSMElement;
  has_website: boolean;
  status: "new";
  url_normalized: string | null;
}
