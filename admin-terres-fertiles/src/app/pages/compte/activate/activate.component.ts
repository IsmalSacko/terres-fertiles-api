import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {
  success = false;
  error: string | null = null;
  
  constructor(private route: ActivatedRoute, private router: Router) {}
  private readonly base = environment.apiUrl;
  async ngOnInit() {
    const uid = this.route.snapshot.paramMap.get('uid');
    const token = this.route.snapshot.paramMap.get('token');
    

    if (uid && token) {
      try {
        // Eviter le double slash si `environment.apiUrl` se termine par `/`
        await axios.post(`${this.base}auth/users/activation/`, {
          uid,
          token
        });
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
        setTimeout(() => this.launchConfetti(), 200); // lance les confettis après succès
      } catch (err: any) {
        // Log complet pour diagnostiquer côté backend
        console.error('Activation error response:', err.response || err);
        this.error = err.response?.data?.detail || err.response?.data || 'Lien invalide ou expiré.';
      }
    } else {
      this.error = "Lien d'activation incomplet.";
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  launchConfetti() {
    // Confettis simples sans dépendance externe
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const confettis = Array.from({length: 80}, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: Math.random() * 6 + 4,
      d: Math.random() * 80 + 40,
      color: `hsl(${Math.random()*360},80%,60%)`,
      tilt: Math.random() * 10 - 10
    }));
    let angle = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < confettis.length; i++) {
        const c = confettis[i];
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.r, c.r/2, c.tilt, 0, 2 * Math.PI);
        ctx.fillStyle = c.color;
        ctx.fill();
      }
      update();
    }
    function update() {
      angle += 0.01;
      for (let i = 0; i < confettis.length; i++) {
        const c = confettis[i];
        c.y += (Math.cos(angle + c.d) + 1 + c.r/2) * 0.8;
        c.x += Math.sin(angle) * 2;
        c.tilt += Math.sin(angle) * 0.2;
        if (c.y > H) {
          c.x = Math.random() * W;
          c.y = -10;
        }
      }
    }
    let anim: number;
    function loop() {
      draw();
      anim = requestAnimationFrame(loop);
    }
    loop();
    setTimeout(() => cancelAnimationFrame(anim), 1800);
  }
}
