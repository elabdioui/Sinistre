// src/app/core/services/chart.service.ts

import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  // Palette de couleurs pour les graphiques
  private readonly colors = {
    primary: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6',
    gray: '#6b7280'
  };

  constructor() {}

  /**
   * Configuration pour un graphique en barres
   */
  getBarChartConfiguration(
    labels: string[],
    datasets: { label: string; data: number[]; backgroundColor?: string }[]
  ): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, index) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || this.getColorByIndex(index),
          borderRadius: 8,
          borderWidth: 0
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              padding: 15,
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        }
      }
    };
  }

  /**
   * Configuration pour un graphique en ligne
   */
  getLineChartConfiguration(
    labels: string[],
    datasets: { label: string; data: number[]; borderColor?: string; backgroundColor?: string }[]
  ): ChartConfiguration<'line'> {
    return {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, index) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.borderColor || this.getColorByIndex(index),
          backgroundColor: ds.backgroundColor || this.getColorByIndex(index, 0.1),
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: ds.borderColor || this.getColorByIndex(index)
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              padding: 15,
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        }
      }
    };
  }

  /**
   * Configuration pour un graphique en doughnut
   */
  getDoughnutChartConfiguration(
    labels: string[],
    data: number[],
    colors?: string[]
  ): ChartConfiguration<'doughnut'> {
    const backgroundColors = colors || labels.map((_, index) => this.getColorByIndex(index));

    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    };
  }

  /**
   * Obtient une couleur par index
   */
  private getColorByIndex(index: number, alpha: number = 1): string {
    const colorArray = [
      this.colors.primary,
      this.colors.success,
      this.colors.warning,
      this.colors.danger,
      this.colors.info,
      this.colors.purple,
      this.colors.pink,
      this.colors.teal,
      this.colors.gray
    ];

    const color = colorArray[index % colorArray.length];

    // Si alpha < 1, convertir en rgba
    if (alpha < 1) {
      return this.hexToRgba(color, alpha);
    }

    return color;
  }

  /**
   * Convertit une couleur hex en rgba
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Palette de couleurs pour les statuts de sinistres
   */
  getSinistreStatusColors(): { [key: string]: string } {
    return {
      'DECLARE': this.colors.info,
      'EN_COURS': this.colors.warning,
      'VALIDE': this.colors.success,
      'REJETE': this.colors.danger,
      'INDEMNISE': this.colors.purple
    };
  }
}
