import { Hito } from './hito.model';

export interface LineaTiempo {
  idLineaTiempo?: number;
  titulo: string;
  tema?: string;
  descripcion?: string;
  url?: string;
  palabrasClave?: string;
  estadoPrivacidad?: 'P' | 'N';
  hitos: Hito[];
}
