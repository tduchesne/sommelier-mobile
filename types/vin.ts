export interface Vin {
  id: string;
  nom: string;
  region: string;
  prix: number;
  cepage?: string;
}

export interface VinDetail extends Vin {
  description?: string;
}


