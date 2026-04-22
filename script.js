// Advanced 3D Portfolio JavaScript
// Three.js Particle System & Advanced 3D Interactions

class Portfolio3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.geometryShapes = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.setupScene();
        this.createParticles();
        this.createGeometryShapes();
        this.setupLighting();
        this.setupEventListeners();
        this.animate();
        this.initUIInteractions();
    }

    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0f, 1, 1000);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('bg-canvas'), 
            alpha: true, 
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x0a0a0f, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    createParticles() {
        // Create particle system
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

            // Color
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5 + Math.random() * 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        // Add particle glow effect
        const glowMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            color: 0x00d4ff
        });

        this.particlesGlow = new THREE.Points(particlesGeometry, glowMaterial);
        this.scene.add(this.particlesGlow);
    }

    createGeometryShapes() {
        // Floating geometric shapes
        const shapes = [
            { type: 'icosahedron', color: 0x00d4ff, position: [-8, 3, -10] },
            { type: 'torusKnot', color: 0xff00ff, position: [6, -2, -8] },
            { type: 'octahedron', color: 0x0099ff, position: [0, 5, -12] },
            { type: 'tetrahedron', color: 0x00d4ff, position: [-4, -3, -6] }
        ];

        shapes.forEach((shape, index) => {
            let geometry;
            switch (shape.type) {
                case 'icosahedron':
                    geometry = new THREE.IcosahedronGeometry(1.5, 1);
                    break;
                case 'torusKnot':
                    geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
                    break;
                case 'octahedron':
                    geometry = new THREE.OctahedronGeometry(1.2, 0);
                    break;
                case 'tetrahedron':
                    geometry = new THREE.TetrahedronGeometry(1.5, 0);
                    break;
            }

            const material = new THREE.MeshPhongMaterial({
                color: shape.color,
                wireframe: true,
                transparent: true,
                opacity: 0.6,
                emissive: shape.color,
                emissiveIntensity: 0.2,
                shininess: 100
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...shape.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.geometryShapes.push(mesh);
            this.scene.add(mesh);
        });
    }

    setupLighting() {
        // Ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point lights
        const pointLight1 = new THREE.PointLight(0x00d4ff, 1, 100);
        pointLight1.position.set(5, 5, 5);
        pointLight1.castShadow = true;
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 100);
        pointLight2.position.set(-5, -5, 5);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x0099ff, 0.6, 100);
        pointLight3.position.set(0, 0, -10);
        pointLight3.castShadow = true;
        this.scene.add(pointLight3);

        // Add light helpers
        const sphereSize = 0.5;
        const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, sphereSize);
        const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, sphereSize);
        const pointLightHelper3 = new THREE.PointLightHelper(pointLight3, sphereSize);

        this.scene.add(pointLightHelper1);
        this.scene.add(pointLightHelper2);
        this.scene.add(pointLightHelper3);
    }

    setupEventListeners() {
        // Mouse move tracking
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Scroll-based camera movement
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollY / maxScroll;
            
            this.camera.position.z = 5 + scrollProgress * 10;
            this.camera.position.y = scrollProgress * 5;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
            
            // Mouse interaction with particles
            this.particles.position.x = this.mouse.x * 2;
            this.particles.position.y = this.mouse.y * 2;
        }

        if (this.particlesGlow) {
            this.particlesGlow.rotation.y -= 0.0003;
            this.particlesGlow.rotation.x += 0.0001;
        }

        // Animate geometric shapes
        this.geometryShapes.forEach((shape, index) => {
            shape.rotation.x += 0.01 * (index + 1);
            shape.rotation.y += 0.008 * (index + 1);
            shape.rotation.z += 0.005 * (index + 1);

            // Floating motion
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
            shape.position.x += Math.cos(Date.now() * 0.0005 + index) * 0.01;

            // Mouse interaction
            const distance = Math.sqrt(
                Math.pow(this.mouse.x - shape.position.x, 2) + 
                Math.pow(this.mouse.y - shape.position.y, 2)
            );
            
            if (distance < 3) {
                shape.scale.setScalar(1.2 + Math.sin(Date.now() * 0.01) * 0.1);
            } else {
                shape.scale.setScalar(1);
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    initUIInteractions() {
        this.init3DCards();
        this.initNavigation();
        this.initScrollAnimations();
        this.initFormInteractions();
    }

    init3DCards() {
        // Profile cube interaction
        const profile3D = document.querySelector('.profile-3d');
        if (profile3D) {
            this.makeInteractive(profile3D);
        }

        // Skill cards
        document.querySelectorAll('.skill-3d').forEach(card => {
            this.makeInteractive(card);
        });

        // Project cards
        document.querySelectorAll('.project-3d').forEach(card => {
            this.makeInteractive(card);
        });

        // Timeline cards
        document.querySelectorAll('.content-3d-card').forEach(card => {
            this.makeInteractive(card);
        });

        // Contact card
        document.querySelectorAll('.contact-3d-card').forEach(card => {
            this.makeInteractive(card);
        });
    }

    makeInteractive(element) {
        let isMouseDown = false;
        let startX = 0;
        let startY = 0;
        let currentRotationX = 0;
        let currentRotationY = 0;

        element.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.clientX;
            startY = e.clientY;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            currentRotationY += deltaX * 0.5;
            currentRotationX += deltaY * 0.5;

            element.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;

            startX = e.clientX;
            startY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            isMouseDown = false;
            element.style.cursor = 'grab';
        });

        // Touch support
        element.addEventListener('touchstart', (e) => {
            isMouseDown = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isMouseDown) return;

            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;

            currentRotationY += deltaX * 0.5;
            currentRotationX += deltaY * 0.5;

            element.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;

            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', () => {
            isMouseDown = false;
        });
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        // Mobile navigation
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            const lines = navToggle.querySelectorAll('.toggle-line');
            lines.forEach((line, index) => {
                if (navMenu.classList.contains('active')) {
                    line.style.transform = index === 1 ? 'scale(0)' : `rotate(${index === 0 ? 45 : -45}deg)`;
                } else {
                    line.style.transform = 'none';
                }
            });
        });

        // Smooth scrolling
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }

                // Close mobile menu
                navMenu.classList.remove('active');
                const lines = navToggle.querySelectorAll('.toggle-line');
                lines.forEach(line => {
                    line.style.transform = 'none';
                });
            });
        });

        // Active link highlighting
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === current) {
                    link.classList.add('active');
                }
            });
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements
        const animateElements = document.querySelectorAll(
            '.skill-3d-item, .timeline-item-3d, .project-3d-card, .contact-3d-card, .text-3d-card'
        );
        
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
    }

    initFormInteractions() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            if (!name || !email || !subject || !message) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!this.isValidEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalContent = submitButton.innerHTML;
            
            submitButton.innerHTML = '<span class="btn-content"><i class="fas fa-spinner fa-spin"></i> Sending...</span>';
            submitButton.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
            }, 2000);
        });

        // Input focus effects
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 15px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 350px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #00d4ff, #0099ff)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ff00ff, #ff0066)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #00d4ff, #ff00ff)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0) scale(1)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%) scale(0.8)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 4000);
    }

    // Loading screen management
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }, 1500);
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio3D().hideLoader();
});

// Console welcome message
console.log('%c🚀 Welcome to Shahebaz\'s Advanced 3D Portfolio! ', 'background: linear-gradient(135deg, #00d4ff, #ff00ff); color: white; font-size: 16px; padding: 15px; border-radius: 10px; font-weight: bold;');
console.log('%c✨ Experience the future of web development with stunning 3D effects! ', 'background: #00d4ff; color: white; font-size: 14px; padding: 10px; border-radius: 8px;');
