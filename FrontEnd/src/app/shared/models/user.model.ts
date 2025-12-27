export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  telephone?: string;
  adresse?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUser {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
}
