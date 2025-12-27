// src/app/shared/components/notification/notification.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification, NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  // Expose enum to template
  NotificationType = NotificationType;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Ferme une notification manuellement
   */
  close(id: string): void {
    this.notificationService.removeNotification(id);
  }

  /**
   * Obtient l'icône pour chaque type de notification
   */
  getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return '✓';
      case NotificationType.ERROR:
        return '✗';
      case NotificationType.INFO:
        return 'ℹ';
      case NotificationType.WARNING:
        return '⚠';
      default:
        return 'ℹ';
    }
  }

  /**
   * Obtient la classe CSS pour chaque type
   */
  getNotificationClass(type: NotificationType): string {
    return `notification notification--${type}`;
  }
}
