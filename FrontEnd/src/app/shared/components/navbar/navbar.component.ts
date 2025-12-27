// src/app/components/navbar/navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Vérifier l'état de connexion initial
    this.checkLoginStatus();

    // Écouter les changements de route pour mettre à jour l'état
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginStatus();
        this.closeMenu(); // Fermer le menu mobile après navigation
      });
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout(): Promise<void> {
    const confirmed = await this.notificationService.confirmAction('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (confirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Supprimer aussi les données utilisateur
      this.isLoggedIn = false;
      this.isMenuOpen = false;
      this.notificationService.info('Vous avez été déconnecté');
      this.router.navigate(['/login']);
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
