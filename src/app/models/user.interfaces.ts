export interface ApiResponse<T> {
    "@context": string;
    "@id": string;
    "@type": string;
    totalItems: number;
    member: T[];
}

export interface Usuarios {
    member: any;
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: string;
}

export interface Rutina {
    id: number;
    nombre:      string;
    descripcion: string;
    usuario:     string;
    ejercicios:  string[];
    diaRutinas:  string[];
}

export interface RegistroEjercicio {
    id: number;
    comentario: string;
    dolor:      number;
    registro:   string;
    ejercicio:  string;
}

export interface Registro {
    id: number;
    fecha:              Date;
    sensaciones:        number;
    observaciones:      string;
    usuario:            string;
    registroEjercicios: string[];
}

export interface Ejercicio {
    id: number;
    nombre:             string;
    series:             number;
    repeticiones:       number;
    descanso:           number;
    rutinas?: string[];
    registroEjercicios: string[];
}

export interface DiaRutina {
    id?: number;
    diaSemana: string;
    rutina:    string;
}



