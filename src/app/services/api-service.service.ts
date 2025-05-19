import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, of, forkJoin } from 'rxjs';
import { ApiResponse, Ejercicio, Usuarios, Rutina, DiaRutina, Registro, RegistroEjercicio } from '../models/user.interfaces';
import { map, tap, switchMap } from 'rxjs/operators';


interface ApiCollectionResponse<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    'hydra:first': string;
    'hydra:last': string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBaseUrl = 'http://127.0.0.1:8000/api';
  private apiUser = `${this.apiBaseUrl}/usuarios`;
  private apiEjercicio = `${this.apiBaseUrl}/ejercicios`;
  private apiRutinas = `${this.apiBaseUrl}/rutinas`;
  private apiDiaRutina = `${this.apiBaseUrl}/dia_rutinas`;
  private apiRegistro = `${this.apiBaseUrl}/registros`;
  private apiRegistroEjercicio = `${this.apiBaseUrl}/registro_ejercicios`;

  constructor(public http: HttpClient) { }

  
  private handleApiError(errorMsg: string) {
    return (error: any) => {
      console.error(errorMsg, error);

     
      if (error.error?.['hydra:description']) {
        return throwError(() => new Error(error.error['hydra:description']));
      }

      return throwError(() => new Error(
        error.error?.detail || errorMsg
      ));
    };
  }


  private getJsonLdHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json'
    });
  }

  
  public registerUsuario(userData: Usuarios): Observable<Usuarios> {
    const headers = this.getJsonLdHeaders();

    const userDataToSend: any = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      password: userData.password,
      rol: userData.rol || 'usuario',
    };

    console.log('Enviando datos de usuario:', userDataToSend);

    return this.http.post<Usuarios>(this.apiUser, userDataToSend, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error en registro:', error);

        if (
          error.error?.violations?.some((v: any) =>
            v.propertyPath === 'email' && v.message?.toLowerCase().includes('ya existe')) ||
          error.error?.['hydra:description']?.toLowerCase().includes('email') ||
          error.error?.detail?.toLowerCase().includes('email ya registrado')
        ) {
          return throwError(() => ({
            code: 'EMAIL_DUPLICADO',
            message: 'Este email ya está registrado en el sistema.',
            originalError: error
          }));
        }

        return throwError(() => new Error(
          error.error?.['hydra:description'] ||
          error.error?.detail ||
          'Error en el registro del usuario.'
        ));
      })
    );
  }

  public getUsuarios(): Observable<ApiResponse<Usuarios>> {
    return this.http.get<ApiResponse<Usuarios>>(this.apiUser)
      .pipe(catchError(this.handleApiError('Error al obtener usuarios')));
  }

  public getUsuarioById(id: number): Observable<Usuarios> {
    return this.http.get<Usuarios>(`${this.apiUser}/${id}`)
      .pipe(catchError(this.handleApiError('Error al obtener el usuario')));
  }

  public actualizarUsuario(id: number, userData: Partial<Usuarios>): Observable<Usuarios> {
    return this.http.patch<Usuarios>(`${this.apiUser}/${id}`, userData, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json'
      }
    }).pipe(catchError(this.handleApiError('Error al actualizar el usuario')));
  }

  public eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUser}/${id}`)
      .pipe(catchError(this.handleApiError('Error al eliminar el usuario')));
  }

  
  login(credentials: { email: string; password: string }): Observable<any> {
    if (!credentials.email || !credentials.password) {
      console.error(" ERROR: El email o la contraseña están vacíos");
      return throwError(() => new Error("El email y la contraseña son obligatorios."));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json'
    });

    const formattedCredentials = {
      correo: credentials.email,
      password: credentials.password
    };

    console.log(' Enviando credenciales a la API:', formattedCredentials);

    return this.http.post<any>(`${this.apiUser}/login`, formattedCredentials, { headers }).pipe(
      tap(response => console.log(" Respuesta de la API:", response)),
      switchMap(response => {
        if (response.success) {
         
          return this.http.get<any>(`${this.apiUser}?email=${credentials.email}`, { headers }).pipe(
            map(userResponse => {
           
              const usuario = userResponse['hydra:member']?.[0] || userResponse[0] || userResponse;
              if (usuario?.id) {
                localStorage.setItem('userId', usuario.id.toString());
              }
              return usuario;
            }),
            tap(usuario => {
              console.log(" Usuario autenticado:", usuario);
            })
          );
        } else {
          return throwError(() => new Error("Error en la autenticación"));
        }
      }),
      catchError((error) => {
        console.error(' Error en el inicio de sesión:', error);
        return throwError(() => new Error(error.error?.error || 'Error en el servidor, intente nuevamente.'));
      })
    );
  }

  getCurrentUser(): Observable<Usuarios | null> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn("No hay ID de usuario en LocalStorage, redirigiendo a login.");
      return throwError(() => new Error("No hay usuario autenticado."));
    }

    return this.http.get<Usuarios>(`${this.apiUser}/${userId}`).pipe(
      tap(response => console.log("✅ Usuario autenticado recibido:", response)), 
      catchError(error => {
        console.error("🚨 Error al obtener los datos del usuario:", error);
        return throwError(() => new Error("No se pudo cargar el usuario."));
      })
    );
  }

  
  public agregarEjercicio(ejercicioData: Ejercicio): Observable<Ejercicio> {
    const headers = this.getJsonLdHeaders();

    const ejercicioDataToSend: any = {
      nombre: ejercicioData.nombre,
      series: ejercicioData.series,
      repeticiones: ejercicioData.repeticiones,
      descanso: ejercicioData.descanso,
      rutinas: ejercicioData.rutinas || [], 
      registroEjercicios: ejercicioData.registroEjercicios || []
    };

    console.log('Enviando datos de ejercicio:', ejercicioDataToSend);

    return this.http.post<Ejercicio>(this.apiEjercicio, ejercicioDataToSend, { headers })
      .pipe(catchError(this.handleApiError('Error al agregar el ejercicio')));
  }

  public getEjercicios(): Observable<ApiCollectionResponse<Ejercicio>> {
    return this.http.get<ApiCollectionResponse<Ejercicio>>(this.apiEjercicio)
      .pipe(catchError(this.handleApiError('Error al obtener ejercicios')));
  }

  public getEjercicioById(id: number): Observable<Ejercicio> {
    return this.http.get<Ejercicio>(`${this.apiEjercicio}/${id}`)
      .pipe(catchError(this.handleApiError('Error al obtener el ejercicio')));
  }

  public actualizarEjercicio(id: number, ejercicio: Partial<Ejercicio>): Observable<Ejercicio> {
    return this.http.patch<Ejercicio>(`${this.apiEjercicio}/${id}`, ejercicio, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json'
      }
    }).pipe(catchError(this.handleApiError('Error al actualizar el ejercicio')));
  }

  public eliminarEjercicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiEjercicio}/${id}`)
      .pipe(catchError(this.handleApiError('Error al eliminar el ejercicio')));
  }

  
  public agregarRutina(rutinasData: Rutina): Observable<Rutina> {

    const headers = this.getJsonLdHeaders();

    const rutinaDataToSend: any = {
      nombre: rutinasData.nombre,
      descripcion: rutinasData.descripcion,
      usuario: rutinasData.usuario,
      ejercicios: rutinasData.ejercicios,
      diaRutinas: rutinasData.diaRutinas || []
    };

    console.log('Enviando datos de rutina:', rutinaDataToSend);

    return this.http.post<Rutina>(this.apiRutinas, rutinaDataToSend, { headers })
      .pipe(catchError(this.handleApiError('Error al agregar la rutina')));
  }

  public getRutinas(): Observable<ApiCollectionResponse<Rutina>> {
    return this.http.get<ApiCollectionResponse<Rutina>>(this.apiRutinas)
      .pipe(catchError(this.handleApiError('Error al obtener rutinas')));
  }

  public getRutinasByUsuario(userId: string | number) {
    const usuarioParam = `/api/usuarios/${userId}`;
    return this.http.get<ApiCollectionResponse<Rutina>>(`${this.apiRutinas}?usuario=${encodeURIComponent(usuarioParam)}`)
      .pipe(catchError(this.handleApiError('Error al obtener rutinas del usuario')));
  }

  public getRutinaById(id: number): Observable<Rutina> {
    return this.http.get<Rutina>(`${this.apiRutinas}/${id}`)
      .pipe(catchError(this.handleApiError('Error al obtener la rutina')));
  }

  public actualizarRutina(id: number, rutina: Partial<Rutina>): Observable<Rutina> {
    return this.http.patch<Rutina>(`${this.apiRutinas}/${id}`, rutina, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json'
      }
    }).pipe(catchError(this.handleApiError('Error al actualizar la rutina')));
  }

  public eliminarRutina(id: number): Observable<any> {
    return this.http.delete(`${this.apiRutinas}/${id}`)
      .pipe(catchError(this.handleApiError('Error al eliminar la rutina')));
  }

  public agregarDia(userDia: DiaRutina): Observable<DiaRutina>{
    const headers = this.getJsonLdHeaders();
    const userDiaData: any = {
      diaSemana: userDia.diaSemana,
      rutina: userDia.rutina,
    };

    console.log('Enviando datos de usuario:', userDiaData);
    return this.http.post<DiaRutina>(this.apiDiaRutina, userDiaData, { headers })
      .pipe(catchError(this.handleApiError('Error al agregar el día de rutina')));
  }

  public getDiaRutinas(): Observable<ApiCollectionResponse<DiaRutina>> {
    return this.http.get<ApiCollectionResponse<DiaRutina>>(this.apiDiaRutina)
      .pipe(catchError(this.handleApiError('Error al obtener días de rutina')));
  }

  public getDiaRutinaById(id: number): Observable<DiaRutina> {
    return this.http.get<DiaRutina>(`${this.apiDiaRutina}/${id}`)
      .pipe(catchError(this.handleApiError('Error al obtener el día de rutina')));
  }

  public actualizarDiaRutina(id: number, data: Partial<DiaRutina>): Observable<DiaRutina> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/merge-patch+json',
      'Accept': 'application/ld+json'
    });
    return this.http.patch<DiaRutina>(`${this.apiDiaRutina}/${id}`, data, { headers })
      .pipe(catchError(this.handleApiError('Error al actualizar el día de rutina')));
  }

  public eliminarDiaRutina(id: number): Observable<any> {
    return this.http.delete(`${this.apiDiaRutina}/${id}`)
      .pipe(catchError(this.handleApiError('Error al eliminar el día de rutina')));
  }

  public agregarRegistro(registroData: Registro): Observable<Registro> {
    const headers = this.getJsonLdHeaders();
    const registroDataToSend: any = {
      fecha: registroData.fecha,
      sensaciones: registroData.sensaciones,
      observaciones: registroData.observaciones,
      usuario: `/api/usuarios/${registroData.usuario}`,
      registroEjercicios: registroData.registroEjercicios.map((ejercicioId) => `/api/ejercicios/${ejercicioId}`)
    };

    console.log('Enviando datos de registro:', registroDataToSend);
    return this.http.post<Registro>(this.apiRegistro, registroDataToSend, { headers })
      .pipe(catchError(this.handleApiError('Error al agregar el registro')));
  }

  public getRegistros(): Observable<ApiCollectionResponse<Registro>> {
    return this.http.get<ApiCollectionResponse<Registro>>(this.apiRegistro)
      .pipe(catchError(this.handleApiError('Error al obtener registros diarios')));
  }

  public getRegistroById(id: number): Observable<Registro> {
    return this.http.get<Registro>(`${this.apiRegistro}/${id}`)
      .pipe(catchError(this.handleApiError('Error al obtener el registro diario')));
  }

  public actualizarRegistro(id: number, registro: Partial<Registro>): Observable<Registro> {
    return this.http.patch<Registro>(`${this.apiRegistro}/${id}`, registro, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json'
      }
    }).pipe(catchError(this.handleApiError('Error al actualizar el registro diario')));
  }

  public eliminarRegistro(id: number): Observable<any> {
    return this.http.delete(`${this.apiRegistro}/${id}`)
      .pipe(catchError(this.handleApiError('Error al eliminar el registro diario')));
  }

  public agregarRegistroEjercicio(registroEjercicioData: RegistroEjercicio): Observable<RegistroEjercicio> {
    const headers = this.getJsonLdHeaders();
    // Permitir tanto número como IRI
    const toIri = (val: any, resource: string) => {
      if (typeof val === 'string' && val.startsWith(`/api/${resource}/`)) return val;
      return `/api/${resource}/${val}`;
    };
    const registroEjercicioDataToSend: any = {
      comentario: registroEjercicioData.comentario,
      dolor: registroEjercicioData.dolor,
      registro: toIri(registroEjercicioData.registro, 'registros'),
      ejercicio: toIri(registroEjercicioData.ejercicio, 'ejercicios')
    };

    console.log('Enviando datos de registro de ejercicio:', registroEjercicioDataToSend);
    return this.http.post<RegistroEjercicio>(this.apiRegistroEjercicio, registroEjercicioDataToSend, { headers })
      .pipe(catchError(this.handleApiError('Error al agregar el registro de ejercicio')));
  }

  public getRegistroEjercicios(): Observable<ApiCollectionResponse<RegistroEjercicio>> {
    return this.http.get<ApiCollectionResponse<RegistroEjercicio>>(this.apiRegistroEjercicio)
      .pipe(catchError(this.handleApiError('Error al obtener registros de ejercicio')));
  }

  public getRegistroEjercicioById(id: number): Observable<RegistroEjercicio> {
    return this.http.get<RegistroEjercicio>(`${this.apiRegistroEjercicio}/${id}`)
      .pipe(catchError(this.handleApiError('Error al obtener el registro de ejercicio')));
  }

  public actualizarRegistroEjercicio(id: number, data: Partial<RegistroEjercicio>): Observable<RegistroEjercicio> {
    return this.http.patch<RegistroEjercicio>(`${this.apiRegistroEjercicio}/${id}`, data, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json'
      }
    }).pipe(catchError(this.handleApiError('Error al actualizar el registro de ejercicio')));
  }

  public eliminarRegistroEjercicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiRegistroEjercicio}/${id}`)
      .pipe(catchError(this.handleApiError('Error al eliminar el registro de ejercicio')));
  }
}