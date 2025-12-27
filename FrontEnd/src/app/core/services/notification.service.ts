// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private idCounter = 0;

  constructor() {}

  /**
   * Affiche une notification de succès
   */
  success(message: string): void {
    this.addNotification(NotificationType.SUCCESS, message);
  }

  /**
   * Affiche une notification d'erreur
   */
  error(message: string): void {
    this.addNotification(NotificationType.ERROR, message);
  }

  /**
   * Affiche une notification d'information
   */
  info(message: string): void {
    this.addNotification(NotificationType.INFO, message);
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(message: string): void {
    this.addNotification(NotificationType.WARNING, message);
  }

  /**
   * Demande de confirmation avec Promise
   */
  confirmAction(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const result = confirm(message);
      resolve(result);
    });
  }

  /**
   * Ajoute une notification
   */
  private addNotification(type: NotificationType, message: string): void {
    const notification: Notification = {
      id: `notif-${++this.idCounter}-${Date.now()}`,
      type,
      message,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-dismiss après 5 secondes
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  /**
   * Supprime une notification
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filtered = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filtered);
  }

  /**
   * Efface toutes les notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}
