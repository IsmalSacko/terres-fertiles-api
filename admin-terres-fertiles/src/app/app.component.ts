import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, RouterOutlet, NavbarComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  images: string[] = [];
  currentBgIndex = 0;
  backgroundImage = '';
  private intervalId: any;

  ngOnInit() {
    fetch('/assets/photos.json')
      .then(res => res.json())
      .then((files: string[]) => {
        this.images = files.map(f => '/assets/PHOTOS_REFERENCES/' + f);
        if (this.images.length > 0) {
          this.backgroundImage = this.images[0];
          this.intervalId = setInterval(() => {
            this.currentBgIndex = (this.currentBgIndex + 1) % this.images.length;
            this.backgroundImage = this.images[this.currentBgIndex];
          }, 20000); // 20 secondes
        }
      });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
