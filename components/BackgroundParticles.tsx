import React, { useEffect, useRef } from 'react';

export const BackgroundParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Particle Class
        class Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                // Digital squares: 1px to 3px
                this.size = Math.random() * 2 + 1;
                // Float upwards slowly
                this.speedY = Math.random() * 0.5 + 0.1;
                // Subtle opacity
                this.opacity = Math.random() * 0.3 + 0.05;
            }

            update() {
                this.y -= this.speedY;
                if (this.y < 0) {
                    this.y = canvas!.height;
                    this.x = Math.random() * canvas!.width;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(100, 150, 255, ${this.opacity})`;
                // Draw square for "tech" feel
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        // Init
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            // Density: ~1 particle per 4000px²
            const count = Math.floor((canvas.width * canvas.height) / 4000);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        // Setup
        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-60"
        />
    );
};
