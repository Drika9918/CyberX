// Arquivo: login.js - Certifique-se de que este é o conteúdo completo do seu JS.

document.addEventListener("DOMContentLoaded", () => {
    const logo = document.getElementById('floating-logo-target');
    const shadow = document.getElementById('logo-shadow-target');
    
    if (!logo || !shadow) return;

    let t = 0;  // Variável de tempo para o movimento e brilho

    function animate() {
        // Velocidade suave para a flutuação
        t += 0.02; 

        // 1. Flutuação Vertical: Math.sin(t) cria um movimento suave e contínuo.
        // O valor `25` controla a altura da flutuação (amplitude).
        const floatY = Math.sin(t) * 25; 

        // 2. A imagem permanece RETA e PARADA (sem floatX ou rotação)
        
        // Aplica o movimento: apenas o movimento vertical (translateY)
        logo.style.transform =
            // Centraliza | Move verticalmente (floatY)
            `translate(-50%, -50%) translateY(${floatY}px)`;

        // Sombra acompanha o movimento vertical (encolhe quando a logo sobe)
        // O valor 80 controla a variação da escala da sombra.
        const shadowScale = 1 - (floatY / 80); 
        shadow.style.transform = `translateX(-50%) scale(${shadowScale})`;

        // Brilho pulsante dinâmico da logo
        const pulse = 0.8 + Math.sin(t * 2.5) * 0.2; 
        logo.style.filter = `drop-shadow(0 0 45px rgba(255,50,50,${pulse}))`;

        requestAnimationFrame(animate);
    }

    animate();
    
});