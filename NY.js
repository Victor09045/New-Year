$(document).ready(function() {
    const canvas = document.getElementById('fireworks');
    const ctx = canvas.getContext('2d');
    
    // Funcție pentru redimensionare automată
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let dots = [];
    let fireworks = [];
    let timeLeft = 10;
    let textToDisplay = "10";
    let isNewYear = false;

    // Culori Neon/Matrix
    const colors = ["#ff00ff", "#00ffff", "#ffff00", "#00ff00", "#ffffff"];

    // --- 1. EFECTUL DE MATRIX (FUNDAL) ---
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(0);

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ff00ff"; 
        ctx.font = "15px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = String.fromCharCode(0x30A0 + Math.random() * 33);
            ctx.fillText(text, i * 20, drops[i] * 20);
            
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // --- 2. CLASA PENTRU ARTIFICII ---
    class Firework {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.particles = [];
            // Generăm 30 de scântei pentru fiecare explozie
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    alpha: 1
                });
            }
        }
        draw() {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.01; // Scade vizibilitatea treptat
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }

    // --- 3. TRANSFORMARE TEXT ÎN PARTICULE (CU SCALARE) ---
    function createTextParticles(text) {
        dots = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculăm dimensiunea fontului să încapă pe ecran (maxim 160px)
        let fontSize = Math.min(canvas.width * 0.10, 160);
        ctx.font = `bold ${fontSize}px Arial`; 
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Scanăm pixelii albi pentru a-i transforma în puncte colorate
        for (let y = 0; y < canvas.height; y += 4) { 
            for (let x = 0; x < canvas.width; x += 4) {
                const index = (y * canvas.width + x) * 4;
                if (data[index] > 128) {
                    dots.push({
                        x: x,
                        y: y,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: Math.random() * 2 + 1
                    });
                }
            }
        }
    }

    // --- LOGICA NUMĂRĂTORII ---
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            createTextParticles(timeLeft.toString());
        } else if (timeLeft === 0) {
            isNewYear = true;
            createTextParticles("La mulți ani! 2026");
            // Prima explozie de bucurie
            for(let i=0; i<10; i++) {
                fireworks.push(new Firework(Math.random()*canvas.width, Math.random()*canvas.height, colors[i%5]));
            }
        } else if (timeLeft < -15) { // Se oprește după 15 secunde
            clearInterval(timer);
        }
    }, 1000);

    // Pornim cu cifra 10
    createTextParticles("10");

    function animate() {
        drawMatrix();

        // Desenăm particulele textului (cu vibrație digitală)
        dots.forEach(dot => {
            ctx.fillStyle = dot.color;
            ctx.beginPath();
            const jitterX = (Math.random() - 0.5) * 2;
            const jitterY = (Math.random() - 0.5) * 2;
            ctx.arc(dot.x + jitterX, dot.y + jitterY, dot.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Gestionăm artificiile
        if (isNewYear) {
            if (Math.random() > 0.85) { // Probabilitate de a lansa artificii noi
                fireworks.push(new Firework(
                    Math.random() * canvas.width, 
                    Math.random() * canvas.height, 
                    colors[Math.floor(Math.random() * colors.length)]
                ));
            }
            fireworks.forEach((fw, index) => {
                fw.draw();
                if (fw.particles[0].alpha <= 0) fireworks.splice(index, 1);
            });
        }

        requestAnimationFrame(animate);
    }

    animate();
});