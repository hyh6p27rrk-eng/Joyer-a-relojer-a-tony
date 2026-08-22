// ===========================
// FUNCIONALIDADES JAVASCRIPT
// ===========================

// Navegación responsiva
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animación de aparición al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.category-card, .product-card, .feature, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Carrito de compras (simulado)
const cartItems = [];

document.querySelectorAll('.btn-add-cart').forEach((button, index) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('.product-info h3').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;

        // Agregar al carrito
        cartItems.push({
            id: index,
            name: productName,
            price: productPrice
        });

        // Animación visual
        button.style.transform = 'scale(1.2)';
        button.textContent = '✓';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        }, 1000);

        // Notificación
        showNotification(`${productName} agregado al carrito`);
    });
});

// Notificación temporal
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37 0%, #c89b34 100%);
        color: #1a1a1a;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Formulario de suscripción
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        newsletterForm.reset();
        showNotification(`¡Gracias por suscribirte! Confirma en ${email}`);
    });
}

// Formulario de contacto
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('¡Mensaje enviado! Nos pondremos en contacto pronto.');
        contactForm.reset();
    });
}

// Efecto de parallax en el hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrollPosition = window.scrollY;
        const circles = document.querySelectorAll('.circle');
        circles.forEach((circle, index) => {
            circle.style.transform = `translateY(${scrollPosition * (0.3 + index * 0.1)}px)`;
        });
    }
});

// Contador de productos en el carrito (opcional)
function updateCartCount() {
    const count = cartItems.length;
    if (count > 0) {
        let cartBadge = document.querySelector('.cart-badge');
        if (!cartBadge) {
            cartBadge = document.createElement('span');
            cartBadge.className = 'cart-badge';
            cartBadge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #f44336;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
            `;
            document.querySelector('.logo').appendChild(cartBadge);
        }
        cartBadge.textContent = count;
    }
}

// Animación de scroll para header
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;

    if (scrollTop > 100) {
        header.style.boxShadow = '0 4px 30px rgba(212, 175, 55, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
    }

    lastScrollTop = scrollTop;
});

// Preloader (opcional)
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 300);
    }
});

// Rating interactivo en testimios
const testimonialRatings = document.querySelectorAll('.testimonial-rating');
testimonialRatings.forEach(rating => {
    const stars = rating.querySelectorAll('i');
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.style.color = 'var(--primary-color)';
                } else {
                    s.style.color = '#666';
                }
            });
        });
    });

    rating.addEventListener('mouseleave', () => {
        stars.forEach(star => {
            star.style.color = 'var(--primary-color)';
        });
    });
});

// Animación de aparición de números (si hay)
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Gallería de productos simulada
document.querySelectorAll('.product-image img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.backgroundColor = '#2d2d2d';
        this.style.display = 'none';
        this.parentElement.style.display = 'flex';
        this.parentElement.style.alignItems = 'center';
        this.parentElement.style.justifyContent = 'center';
        const placeholder = document.createElement('i');
        placeholder.className = 'fas fa-gem';
        placeholder.style.fontSize = '3rem';
        placeholder.style.color = '#d4af37';
        this.parentElement.appendChild(placeholder);
    });
});

// Búsqueda (función de ejemplo)
function searchProducts(query) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const name = product.querySelector('.product-info h3').textContent.toLowerCase();
        if (name.includes(query.toLowerCase())) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Filtrado de productos por categoría
function filterByCategory(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const desc = product.querySelector('.product-description').textContent.toLowerCase();
        if (desc.includes(category.toLowerCase())) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Estilos CSS para animaciones adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(26, 26, 26, 0.98);
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
            border-radius: 0 0 10px 10px;
        }
    }
`;
document.head.appendChild(style);

console.log('🎀 Joyería Toni - Script cargado correctamente');
