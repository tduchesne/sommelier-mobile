export interface Vin {
  id: number;
  nom: string;
  region: string;
  prix: number;
  cepage?: string;
  couleur?: string;
}

export interface VinDetail extends Vin {
  notesDegustation?: string;
}