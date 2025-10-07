import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="loading-state" [class]="containerClass">
      <div class="loading-content">
        <mat-spinner 
          [diameter]="spinnerSize" 
          [color]="spinnerColor">
        </mat-spinner>
        
        <div class="loading-text" *ngIf="message">
          <h3 *ngIf="title">{{title}}</h3>
          <p>{{message}}</p>
        </div>
        
        <div class="loading-details" *ngIf="details">
          <small>{{details}}</small>
        </div>
        
        <div class="loading-animation" *ngIf="showAnimation">
          <div class="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      min-height: 200px;
    }

    .loading-state.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(2px);
      z-index: 1000;
      min-height: 100vh;
    }

    .loading-state.inline {
      min-height: 120px;
      padding: 20px;
    }

    .loading-state.compact {
      min-height: 80px;
      padding: 16px;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
    }

    .loading-text h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }

    .loading-text p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .loading-details {
      color: #888;
      font-size: 12px;
      font-style: italic;
    }

    .loading-animation {
      margin-top: 8px;
    }

    .dots {
      display: flex;
      gap: 4px;
    }

    .dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #1976d2;
      animation: loading-dots 1.4s infinite ease-in-out both;
    }

    .dots span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .dots span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes loading-dots {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .loading-state {
        padding: 20px;
        min-height: 150px;
      }

      .loading-text h3 {
        font-size: 1.1rem;
      }

      .loading-text p {
        font-size: 13px;
      }
    }
  `]
})
export class LoadingStateComponent {
  @Input() message = 'Chargement...';
  @Input() title?: string;
  @Input() details?: string;
  @Input() spinnerSize: number = 50;
  @Input() spinnerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() containerClass: 'default' | 'fullscreen' | 'inline' | 'compact' = 'default';
  @Input() showAnimation = true;
}