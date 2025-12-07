import { TipoUsuario } from './tipo-usuario.model';
import { Nacionalidad } from './nacionalidad.model';

export interface Usuario {
  idUsuario?: number;       
  googleId?: string;
  email: string;
  nombre?: string;
  contrasena?: string;
  fotoPerfil?: string;
  fotoGoogle?: string;
  tipoUsuario?: TipoUsuario;
  nacionalidad?: Nacionalidad;
  genero?: string;         
}
