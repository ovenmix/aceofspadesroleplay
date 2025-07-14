function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    
    // Show selected page
    document.getElementById(pageId + '-page').style.display = 'block';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add parallax effect to banner
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const banner = document.querySelector('.banner');
    if (banner) {
        banner.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});