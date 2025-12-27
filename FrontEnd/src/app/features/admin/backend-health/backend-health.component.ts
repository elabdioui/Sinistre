import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface HealthCheck {
  service: string;
  url: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

@Component({
  selector: 'app-backend-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-check-container">
      <h2>🏥 État des Services Backend</h2>

      <div class="refresh-section">
        <button (click)="checkAllServices()" [disabled]="checking" class="btn-refresh">
          {{ checking ? '⏳ Vérification...' : '🔄 Rafraîchir' }}
        </button>
      </div>

      <div class="services-grid">
        <div *ngFor="let check of healthChecks"
             class="service-card"
             [ngClass]="{
               'status-loading': check.status === 'loading',
               'status-success': check.status === 'success',
               'status-error': check.status === 'error'
             }">
          <div class="service-header">
            <span class="service-name">{{ check.service }}</span>
            <span class="status-icon">
              <span *ngIf="check.status === 'loading'">⏳</span>
              <span *ngIf="check.status === 'success'">✅</span>
              <span *ngIf="check.status === 'error'">❌</span>
            </span>
          </div>
          <div class="service-url">{{ check.url }}</div>
          <div class="service-message" [ngClass]="'message-' + check.status">
            {{ check.message }}
          </div>
          <div *ngIf="check.responseTime" class="response-time">
            ⚡ {{ check.responseTime }}ms
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>� Utilisateur Connecté</h3>
        <div class="user-info-card">
          <div class="info-grid">
            <div class="info-item">
              <strong>👤 Nom:</strong>
              <span class="highlight">{{ username || 'Non disponible' }}</span>
            </div>
            <div class="info-item">
              <strong>📧 Email:</strong>
              <span>{{ userEmail || 'Non disponible' }}</span>
            </div>
            <div class="info-item">
              <strong>🆔 User ID:</strong>
              <span>{{ userId || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>🎭 Rôle:</strong>
              <span class="role-badge" [ngClass]="getRoleClass()">{{ userRole || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>🔑 Token:</strong>
              <span [class.present]="hasToken" [class.absent]="!hasToken">
                {{ hasToken ? '✅ Présent' : '❌ Absent' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .health-check-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .refresh-section {
      margin-bottom: 2rem;
    }

    .btn-refresh {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .service-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .status-loading {
      border-left: 4px solid #f39c12;
    }

    .status-success {
      border-left: 4px solid #27ae60;
    }

    .status-error {
      border-left: 4px solid #e74c3c;
    }

    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .service-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .status-icon {
      font-size: 1.5rem;
    }

    .service-url {
      font-size: 0.85rem;
      color: #7f8c8d;
      font-family: 'Courier New', monospace;
      margin-bottom: 0.5rem;
    }

    .service-message {
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .message-loading {
      background: #fff9e6;
      color: #856404;
    }

    .message-success {
      background: #d4edda;
      color: #155724;
    }

    .message-error {
      background: #f8d7da;
      color: #721c24;
    }

    .response-time {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #27ae60;
      font-weight: 600;
    }

    .info-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .info-section h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .info-item strong {
      color: #495057;
    }

    .present {
      color: #27ae60;
      font-weight: 600;
    }

    .absent {
      color: #e74c3c;
      font-weight: 600;
    }

    .user-info-card {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .highlight {
      color: #667eea;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .role-client {
      background: #3498db;
      color: white;
    }

    .role-gestionnaire {
      background: #f39c12;
      color: white;
    }

    .role-admin {
      background: #e74c3c;
      color: white;
    }
  `]
})
export class BackendHealthComponent implements OnInit {
  healthChecks: HealthCheck[] = [
    {
      service: 'Service Sinistres',
      url: 'http://localhost:8080/sinistres/health',
      status: 'loading',
      message: 'Vérification en cours...'
    },
    {
      service: 'API Sinistres (GET)',
      url: 'http://localhost:8080/sinistres',
      status: 'loading',
      message: 'Vérification en cours...'
    },
    {
      service: 'API Contrats',
      url: 'http://localhost:8080/contracts',
      status: 'loading',
      message: 'Vérification en cours...'
    },
    {
      service: 'API Contrats Actifs',
      url: 'http://localhost:8080/contracts/actifs',
      status: 'loading',
      message: 'Vérification en cours...'
    }
  ];

  checking = false;
  hasToken = false;
  userId: string | null = null;
  userRole: string | null = null;
  userEmail: string | null = null;
  username: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkAllServices();
  }

  loadUserInfo(): void {
    this.hasToken = !!localStorage.getItem('token');
    this.userId = localStorage.getItem('userId');
    this.userRole = localStorage.getItem('userRole');
    this.userEmail = localStorage.getItem('userEmail');
    this.username = localStorage.getItem('username');

    console.log('👤 Backend Health - Utilisateur:', {
      userId: this.userId,
      userRole: this.userRole,
      userEmail: this.userEmail,
      username: this.username,
      hasToken: this.hasToken
    });
  }

  getRoleClass(): string {
    if (this.userRole === 'CLIENT') return 'role-client';
    if (this.userRole === 'GESTIONNAIRE') return 'role-gestionnaire';
    if (this.userRole === 'ADMIN') return 'role-admin';
    return '';
  }

  checkAllServices(): void {
    this.checking = true;
    this.healthChecks.forEach(check => {
      check.status = 'loading';
      check.message = 'Vérification en cours...';
      this.checkService(check);
    });
  }

  checkService(check: HealthCheck): void {
    const startTime = Date.now();

    this.http.get(check.url, { responseType: 'text' }).subscribe({
      next: (response) => {
        const endTime = Date.now();
        check.status = 'success';
        check.message = `✅ Service disponible`;
        check.responseTime = endTime - startTime;
        this.checking = false;
      },
      error: (error) => {
        const endTime = Date.now();
        check.status = 'error';
        check.responseTime = endTime - startTime;

        if (error.status === 0) {
          check.message = '❌ Impossible de contacter le serveur (CORS ou serveur éteint)';
        } else if (error.status === 401) {
          check.message = '⚠️ Non autorisé (token manquant ou invalide)';
        } else if (error.status === 403) {
          check.message = '⚠️ Accès refusé (droits insuffisants)';
        } else if (error.status === 404) {
          check.message = '❌ Endpoint non trouvé';
        } else if (error.status === 500) {
          check.message = `❌ Erreur serveur 500: ${error.error || error.message}`;
        } else {
          check.message = `❌ Erreur ${error.status}: ${error.message}`;
        }

        this.checking = false;
      }
    });
  }
}
