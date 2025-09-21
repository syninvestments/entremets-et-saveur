// Mobile Detection and Redirection Script
// Détecte si l'utilisateur est sur mobile et redirige automatiquement

(function() {
    'use strict';

    // Fonction pour détecter si l'utilisateur est sur mobile
    function isMobileDevice() {
        // Vérifier la largeur de l'écran
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        
        // Vérifier le user agent
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'mobile', 'iphone', 'ipod', 'android', 'blackberry', 
            'opera mini', 'windows ce', 'nokia', 'palm'
        ];
        
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        
        // Vérifier si c'est un écran tactile
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Critères pour considérer comme mobile :
        // 1. Largeur d'écran <= 768px ET tactile
        // 2. OU user agent mobile
        // 3. OU largeur d'écran <= 480px (petits écrans)
        return (screenWidth <= 768 && isTouchDevice) || isMobileUA || screenWidth <= 480;
    }

    // Fonction pour obtenir l'URL mobile correspondante
    function getMobileURL() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();
        
        // Mapping des pages vers leurs versions mobiles
        const mobileMapping = {
            'index.html': 'index-mobile.html',
            'formules.html': 'formules-mobile.html',
            'boutique.html': 'boutique-mobile.html',
            '': 'index-mobile.html', // page racine
            '/': 'index-mobile.html'
        };
        
        // Si c'est déjà une page mobile, ne pas rediriger
        if (currentFile.includes('-mobile.html')) {
            return null;
        }
        
        // Chercher la version mobile correspondante
        const mobileFile = mobileMapping[currentFile] || mobileMapping[currentPath];
        
        if (mobileFile) {
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            return basePath + mobileFile;
        }
        
        // Si pas de mapping trouvé, essayer d'ajouter -mobile avant .html
        if (currentFile.endsWith('.html')) {
            const nameWithoutExt = currentFile.replace('.html', '');
            return currentPath.replace(currentFile, nameWithoutExt + '-mobile.html');
        }
        
        return null;
    }

    // Fonction principale de redirection
    function redirectToMobile() {
        // Ne pas rediriger si :
        // 1. L'utilisateur a explicitement choisi la version desktop (paramètre URL)
        // 2. C'est déjà une page mobile
        // 3. L'utilisateur vient de la version mobile (éviter les boucles)
        
        const urlParams = new URLSearchParams(window.location.search);
        const forceDesktop = urlParams.get('desktop') === 'true';
        const fromMobile = document.referrer.includes('-mobile.html');
        
        if (forceDesktop || fromMobile) {
            return;
        }
        
        const mobileURL = getMobileURL();
        
        if (mobileURL && isMobileDevice()) {
            // Ajouter un petit délai pour éviter les redirections trop rapides
            setTimeout(() => {
                window.location.href = mobileURL;
            }, 100);
        }
    }

    // Fonction pour ajouter un lien vers la version desktop sur les pages mobiles
    function addDesktopLink() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();
        
        if (currentFile.includes('-mobile.html')) {
            // C'est une page mobile, ajouter le lien vers la version desktop
            const desktopFile = currentFile.replace('-mobile.html', '.html');
            const desktopURL = currentPath.replace(currentFile, desktopFile) + '?desktop=true';
            
            // Créer le lien vers la version desktop
            const desktopLink = document.createElement('div');
            desktopLink.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                background: rgba(241, 130, 100, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            `;
            
            desktopLink.innerHTML = '<i class="fas fa-desktop" style="margin-right: 5px;"></i>Version PC';
            
            desktopLink.addEventListener('click', () => {
                window.location.href = desktopURL;
            });
            
            desktopLink.addEventListener('mouseenter', () => {
                desktopLink.style.transform = 'scale(1.05)';
            });
            
            desktopLink.addEventListener('mouseleave', () => {
                desktopLink.style.transform = 'scale(1)';
            });
            
            document.body.appendChild(desktopLink);
        }
    }

    // Exécuter la détection quand le DOM est chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            redirectToMobile();
            addDesktopLink();
        });
    } else {
        redirectToMobile();
        addDesktopLink();
    }

    // Écouter les changements de taille d'écran (orientation, redimensionnement)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Ne rediriger que si on change vraiment de catégorie d'appareil
            const wasMobile = sessionStorage.getItem('wasMobile') === 'true';
            const isMobileNow = isMobileDevice();
            
            if (wasMobile !== isMobileNow) {
                sessionStorage.setItem('wasMobile', isMobileNow.toString());
                redirectToMobile();
            }
        }, 250);
    });

    // Sauvegarder l'état mobile actuel
    sessionStorage.setItem('wasMobile', isMobileDevice().toString());

})();
