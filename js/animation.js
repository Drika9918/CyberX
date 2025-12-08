// ============================================
// ANIMAÇÃO CINEMATOGRÁFICA - GSAP COMPLETA
// ============================================

/**
 * INICIA A ANIMAÇÃO CINEMATOGRÁFICA COMPLETA
 * @param {Object} config - Configurações da animação
 * @returns {Promise} Promise que resolve quando a animação termina
 */
function startCinematicAnimation(config = {}) {
    return new Promise((resolve) => {
        console.log('🎬 Iniciando animação cinematográfica...');
        
        // Configurações padrão
        const defaultConfig = {
            eyeOriginX: '60%',
            eyeOriginY: '45%',
            durations: {
                logoAppear: 0.9,
                zoomIn: 1.1,
                zoomOut: 0.8,
                slideToRight: 0.9,
                cardFadeIn: 0.7,
                borderPulse: 0.3
            },
            intensities: {
                glow: 0.7,
                blur: 2,
                vignette: 0.6
            },
            scales: {
                initial: 1.0,
                peak: 4.0,
                final: 0.5
            }
        };
        
        // Mesclar configurações
        const CONFIG = { ...defaultConfig, ...config };
        
        // Elementos DOM
        const cinematicOverlay = document.getElementById('cinematic-overlay');
        const zoomWrapper = document.getElementById('zoom-wrapper');
        const cinematicLogo = document.getElementById('cinematic-logo');
        const vignette = document.getElementById('cinematic-vignette');
        const radialBlur = document.getElementById('radial-blur');
        const mainContent = document.getElementById('main-content');
        const loginCard = document.getElementById('login-card');
        const finalLogo = document.getElementById('final-logo');
        
        // Verificar se todos os elementos existem
        if (!cinematicLogo || !zoomWrapper) {
            console.error('❌ Elementos da animação não encontrados');
            showMainContentFallback();
            resolve();
            return;
        }
        
        // Aplicar coordenadas do olho ao CSS
        if (zoomWrapper) {
            zoomWrapper.style.setProperty('--eye-origin-x', CONFIG.eyeOriginX);
            zoomWrapper.style.setProperty('--eye-origin-y', CONFIG.eyeOriginY);
        }
        
        if (cinematicLogo) {
            cinematicLogo.style.transformOrigin = `${CONFIG.eyeOriginX} ${CONFIG.eyeOriginY}`;
        }
        
        // Timeline principal
        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            onStart: () => {
                console.log('🚀 Animação iniciada');
            },
            onComplete: () => {
                console.log('✅ Animação concluída');
                
                // Aplicar pulso na borda do card
                if (loginCard) {
                    loginCard.classList.add('border-pulse');
                    
                    // Remover classe após animação
                    setTimeout(() => {
                        loginCard.classList.remove('border-pulse');
                    }, 600);
                }
                
                // Limpar overlay após animação
                setTimeout(() => {
                    if (cinematicOverlay) {
                        cinematicOverlay.style.opacity = '0';
                        cinematicOverlay.style.pointerEvents = 'none';
                        
                        // Remover completamente após transição
                        setTimeout(() => {
                            cinematicOverlay.style.display = 'none';
                        }, 500);
                    }
                }, 300);
                
                // Resolver a promise
                resolve();
            }
        });
        
        // === ETAPA 1: LOGO APARECE NO CENTRO ===
        tl.fromTo(cinematicLogo,
            {
                opacity: 0,
                scale: 0.6,
                filter: `drop-shadow(0 0 0px rgba(214, 0, 0, 0))`
            },
            {
                opacity: 1,
                scale: 1.1,
                duration: CONFIG.durations.logoAppear * 0.6,
                filter: `drop-shadow(0 0 40px rgba(214, 0, 0, ${CONFIG.intensities.glow}))`,
                ease: "power2.out"
            },
            0
        );
        
        // Logo volta ao tamanho normal com brilho
        tl.to(cinematicLogo,
            {
                scale: CONFIG.scales.initial,
                duration: CONFIG.durations.logoAppear * 0.4,
                filter: `drop-shadow(0 0 30px rgba(214, 0, 0, ${CONFIG.intensities.glow * 1.2}))`
            },
            `-=${CONFIG.durations.logoAppear * 0.3}`
        );
        
        // === ETAPA 2: ZOOM CINEMATOGRÁFICO NO OLHO ===
        // Zoom in dramático no ponto do olho
        tl.to(cinematicLogo,
            {
                scale: CONFIG.scales.peak,
                duration: CONFIG.durations.zoomIn,
                ease: "expo.out",
                filter: `drop-shadow(0 0 60px rgba(214, 0, 0, ${CONFIG.intensities.glow * 1.5}))`
            },
            "+=0.2"
        );
        
        // Aplicar blur durante o zoom
        tl.to(cinematicLogo,
            {
                filter: `drop-shadow(0 0 60px rgba(214, 0, 0, ${CONFIG.intensities.glow * 1.5})) blur(${CONFIG.intensities.blur}px)`,
                duration: CONFIG.durations.zoomIn * 0.5
            },
            `-=${CONFIG.durations.zoomIn * 0.5}`
        );
        
        // Vinheta aparece durante o zoom
        tl.to(vignette,
            {
                opacity: CONFIG.intensities.vignette,
                duration: CONFIG.durations.zoomIn * 0.8
            },
            `-=${CONFIG.durations.zoomIn}`
        );
        
        // Blur radial aparece
        tl.to(radialBlur,
            {
                opacity: 1,
                backdropFilter: `blur(${CONFIG.intensities.blur}px)`,
                WebkitBackdropFilter: `blur(${CONFIG.intensities.blur}px)`,
                duration: CONFIG.durations.zoomIn * 0.6
            },
            `-=${CONFIG.durations.zoomIn * 0.7}`
        );
        
        // === ETAPA 3: RECUO E TRANSIÇÃO ===
        // Zoom out suave
        tl.to(cinematicLogo,
            {
                scale: CONFIG.scales.initial,
                duration: CONFIG.durations.zoomOut,
                ease: "power2.inOut",
                filter: `drop-shadow(0 0 30px rgba(214, 0, 0, ${CONFIG.intensities.glow})) blur(0px)`
            },
            "+=0.3"
        );
        
        // Vinheta desaparece
        tl.to(vignette,
            {
                opacity: 0,
                duration: CONFIG.durations.zoomOut * 0.6
            },
            `-=${CONFIG.durations.zoomOut * 0.8}`
        );
        
        // Blur radial desaparece
        tl.to(radialBlur,
            {
                opacity: 0,
                backdropFilter: 'blur(0px)',
                WebkitBackdropFilter: 'blur(0px)',
                duration: CONFIG.durations.zoomOut * 0.4
            },
            `-=${CONFIG.durations.zoomOut * 0.6}`
        );
        
        // === ETAPA 4: LOGO DESLIZA PARA DIREITA ===
        // Animar logo para posição final (coluna direita)
        tl.to(cinematicLogo,
            {
                x: '50vw', // Move para coluna direita
                scale: CONFIG.scales.final,
                duration: CONFIG.durations.slideToRight,
                ease: "power2.inOut"
            },
            "+=0.2"
        );
        
        // Fade out da logo animada
        tl.to(cinematicLogo,
            {
                opacity: 0,
                duration: 0.4
            },
            "-=0.2"
        );
        
        // Fade in da logo final
        tl.to(finalLogo,
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: "back.out(1.7)"
            },
            "-=0.3"
        );
        
        // === ETAPA 5: MOSTRAR CONTEÚDO PRINCIPAL ===
        tl.to(mainContent,
            {
                opacity: 1,
                duration: 0.5
            },
            "-=0.4"
        );
        
        // === ETAPA 6: CARD DE LOGIN APARECE ===
        // Animação de entrada do card
        tl.fromTo(loginCard,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: CONFIG.durations.cardFadeIn,
                ease: "power3.out"
            },
            "-=0.3"
        );
        
        // Animação dos inputs em sequência
        tl.fromTo('.field',
            {
                opacity: 0,
                y: 20
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: "power2.out"
            },
            "-=0.4"
        );
        
        // Animação do botão
        tl.fromTo('.cinematic-btn',
            {
                opacity: 0,
                y: 15
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out"
            },
            "-=0.3"
        );
        
        // Animação dos links
        tl.fromTo('.forgot-password, .switch-link',
            {
                opacity: 0,
                y: 10
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: "power2.out"
            },
            "-=0.2"
        );
        
        // === ETAPA 7: PULSO NA BORDA DO CARD ===
        tl.to(loginCard,
            {
                boxShadow: '0 8px 30px rgba(214, 0, 0, 0.08), 0 0 12px rgba(214, 0, 0, 0.12) inset, 0 0 0 8px rgba(214, 0, 0, 0.2)',
                duration: CONFIG.durations.borderPulse * 0.5,
                ease: "power2.out"
            },
            "-=0.1"
        );
        
        tl.to(loginCard,
            {
                boxShadow: '0 8px 30px rgba(214, 0, 0, 0.08), 0 0 12px rgba(214, 0, 0, 0.12) inset, 0 0 0 0px rgba(214, 0, 0, 0)',
                duration: CONFIG.durations.borderPulse * 0.5,
                ease: "power2.in"
            }
        );
    });
}

/**
 * ANIMAÇÃO PÓS-LOGIN (versão mais rápida)
 * @returns {Promise} Promise que resolve quando a animação termina
 */
function startPostLoginAnimation() {
    console.log('🎬 Iniciando animação pós-login...');
    
    const config = {
        durations: {
            logoAppear: 0.6,
            zoomIn: 0.8,
            zoomOut: 0.6,
            slideToRight: 0.7,
            cardFadeIn: 0.5,
            borderPulse: 0.2
        }
    };
    
    return startCinematicAnimation(config);
}

/**
 * MOSTRA O CONTEÚDO PRINCIPAL (FALLBACK)
 */
function showMainContentFallback() {
    console.log('🔄 Usando fallback de conteúdo');
    
    const mainContent = document.getElementById('main-content');
    const cinematicOverlay = document.getElementById('cinematic-overlay');
    const finalLogo = document.getElementById('final-logo');
    const loginCard = document.getElementById('login-card');
    
    if (cinematicOverlay) {
        cinematicOverlay.style.display = 'none';
    }
    
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.transition = 'opacity 0.5s ease';
    }
    
    if (finalLogo) {
        finalLogo.style.opacity = '1';
        finalLogo.style.transform = 'scale(1)';
        finalLogo.style.transition = 'all 0.5s ease';
    }
    
    if (loginCard) {
        loginCard.style.opacity = '1';
        loginCard.style.transform = 'translateY(0)';
        loginCard.style.transition = 'all 0.5s ease';
        
        // Aplicar pulso na borda
        loginCard.classList.add('border-pulse');
        setTimeout(() => {
            loginCard.classList.remove('border-pulse');
        }, 600);
    }
}

/**
 * REINICIAR ANIMAÇÃO (PARA TESTES)
 */
function restartAnimation() {
    const cinematicOverlay = document.getElementById('cinematic-overlay');
    const mainContent = document.getElementById('main-content');
    const finalLogo = document.getElementById('final-logo');
    const loginCard = document.getElementById('login-card');
    
    if (cinematicOverlay) {
        cinematicOverlay.style.display = 'flex';
        cinematicOverlay.style.opacity = '1';
        cinematicOverlay.style.pointerEvents = 'auto';
    }
    
    if (mainContent) {
        mainContent.style.opacity = '0';
    }
    
    if (finalLogo) {
        finalLogo.style.opacity = '0';
        finalLogo.style.transform = 'scale(0.5)';
    }
    
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(30px)';
    }
    
    // Reiniciar após breve delay
    setTimeout(() => {
        if (window.startCinematicAnimation && window.CINEMATIC_CONFIG) {
            window.startCinematicAnimation(window.CINEMATIC_CONFIG);
        }
    }, 300);
}

// Exportar funções globalmente
window.startCinematicAnimation = startCinematicAnimation;
window.startPostLoginAnimation = startPostLoginAnimation;
window.showMainContentFallback = showMainContentFallback;
window.restartAnimation = restartAnimation;

// Iniciar automaticamente se configurado
if (typeof window.CINEMATIC_CONFIG !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.startCinematicAnimation && !sessionStorage.getItem('cinematicAnimationShown')) {
                window.startCinematicAnimation(window.CINEMATIC_CONFIG);
                sessionStorage.setItem('cinematicAnimationShown', 'true');
            }
        }, 300);
    });
}