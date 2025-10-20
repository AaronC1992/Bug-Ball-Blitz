// particles.js - Particle effects system

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    // Create kick dust cloud
    createKickDust(x, y, velocityX) {
        const numParticles = 8;
        const direction = velocityX > 0 ? -1 : 1; // Dust flies opposite to kick direction
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: direction * (Math.random() * 3 + 2),
                vy: -Math.random() * 3 - 1,
                size: Math.random() * 4 + 2,
                life: 1.0,
                decay: 0.02,
                color: `rgba(200, 180, 140, ${0.6})`,
                type: 'dust'
            });
        }
    }
    
    // Create goal explosion
    createGoalExplosion(x, y, color = '#7ed321') {
        const numParticles = 30;
        
        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 * i) / numParticles;
            const speed = Math.random() * 8 + 4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                life: 1.0,
                decay: 0.015,
                color: color,
                type: 'explosion'
            });
        }
    }
    
    // Create impact sparks
    createImpactSparks(x, y, intensity = 1) {
        const numParticles = Math.floor(5 * intensity);
        
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * 3 + 1,
                life: 1.0,
                decay: 0.04,
                color: `rgba(255, 255, 100, ${0.8})`,
                type: 'spark'
            });
        }
    }
    
    // Create bounce particles
    createBounceDust(x, y) {
        const numParticles = 5;
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 2 - 1,
                size: Math.random() * 3 + 1,
                life: 1.0,
                decay: 0.03,
                color: `rgba(180, 160, 120, ${0.5})`,
                type: 'dust'
            });
        }
    }
    
    // Create trail effect (for fast-moving ball)
    createBallTrail(x, y, vx, vy) {
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed < 15) return; // Only create trail for fast balls
        
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            size: 8,
            life: 1.0,
            decay: 0.08,
            color: `rgba(255, 255, 255, ${0.3})`,
            type: 'trail'
        });
    }
    
    update(deltaTime = 0.016) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity (except for trails)
            if (p.type !== 'trail') {
                p.vy += 0.3;
            }
            
            // Apply friction
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Update life
            p.life -= p.decay;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            
            if (p.type === 'trail') {
                // Render trail as circle
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'spark') {
                // Render sparks as stars
                ctx.fillStyle = p.color;
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - p.size);
                ctx.lineTo(p.x, p.y + p.size);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(p.x - p.size, p.y);
                ctx.lineTo(p.x + p.size, p.y);
                ctx.stroke();
            } else {
                // Render dust/explosion as circles
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    clear() {
        this.particles = [];
    }
}
