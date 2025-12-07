import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { LoginSuccessComponent } from './auth/login-success/login-success';
import { CompleteProfileComponent } from './auth/complete-profile/complete-profile';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { creatorGuard } from './auth/creator-guard';
import { RegistroComponent } from './auth/registro/registro';
import { InicioSesionComponent } from './auth/inicio-sesion/inicio-sesion';
import { SidebarComponent } from './dashboard/sidebar/sidebar';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { CrearLineaTiempoComponent } from './dashboard/lineas-tiempo/crear-linea-tiempo/crear-linea-tiempo';
import { ListarLineaTiempoComponent } from './dashboard/lineas-tiempo/listar-linea-tiempo/listar-linea-tiempo';
import { RenderPlantillaComponent } from './dashboard/lineas-tiempo/render-plantilla/render-plantilla';
import { RecentsComponent } from './dashboard/pages/recents/recents';
import { ComunidadComponent } from './dashboard/pages/comunidad/comunidad';
import { FavoritosComponent } from './dashboard/pages/favoritos/favoritos';
import { GuardadosComponent } from './dashboard/pages/guardados/guardados';
import { LineaVistaComponent } from './dashboard/lineas-tiempo/linea-vista/linea-vista';
import { VerLineaPublicaComponent } from './dashboard/lineas-tiempo/ver-linea-publica/ver-linea-publica';
import { EliminadosComponent } from './dashboard/pages/eliminados/eliminados';
import { AjustesComponent } from './dashboard/pages/ajustes/ajustes';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login-success', component: LoginSuccessComponent },
  { path: 'inicio-sesion', component: InicioSesionComponent }, // login tradicional
  { path: 'auth/complete-profile', component: CompleteProfileComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, creatorGuard] },  
  { path: 'registro', component: RegistroComponent },

  {
    path: 'crear-linea-tiempo',
    component: CrearLineaTiempoComponent,
    canActivate: [authGuard, creatorGuard], // solo usuarios autenticados y creadores
  },
  //despues de guarda la linea muestra los datos de la misma
  { path: 'linea/:id', component: LineaVistaComponent }, 
  { path: 'render-plantilla/:id', component: RenderPlantillaComponent }, 
  {
    path: 'listar-linea-tiempo',
    component: ListarLineaTiempoComponent,
  },
  {
    path: 'ver/:token',
    component: VerLineaPublicaComponent
  },
      //  Rutas de Recuperación de Contraseña
  { path: 'forgot-password', component: ForgotPasswordComponent }, 
  { path: 'reset-password', component: ResetPasswordComponent }, 

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, creatorGuard],
    children: [
      { path: 'recientes', component: RecentsComponent },
      { path: 'comunidad', component: ComunidadComponent },
      { path: 'favoritos', component: FavoritosComponent },
      { path: 'guardados', component: GuardadosComponent },
      { path: 'eliminados', component: EliminadosComponent }, 
      { path: 'ajustes', component: AjustesComponent},
      { path: '', redirectTo: 'recientes', pathMatch: 'full' }, // default hijo
    ],
  },
  { path: '**', redirectTo: '' }
];
