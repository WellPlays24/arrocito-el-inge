import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  cedula?: string | null;
  date_of_birth?: string | null;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = '/api/auth'; // gracias al proxy

  private _currentUser: AuthUser | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((res) => {
          // guardar token en localStorage
          localStorage.setItem('token', res.token);
          this._currentUser = res.user;
          return res.user;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this._currentUser = null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  get currentUser(): AuthUser | null {
    return this._currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
