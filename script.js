document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Mobile Navigation Menu Toggle
    // ==========================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger / close icon
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close mobile menu when links are clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.className = 'fa-solid fa-bars';
            });
        });
    }

    // ==========================================
    // 2. Navigation Active Links on Scroll
    // ==========================================
    const sections = document.querySelectorAll('section, header');
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        // Navbar shrink effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlight
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Offset for fixed nav
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // 3. Dynamic Reviews Loading & Filter
    // ==========================================
    const reviewsList = document.getElementById('reviews-list');
    const btnLoadMore = document.getElementById('btn-load-more');
    const reviewSearch = document.getElementById('review-search');
    const displayedCountEl = document.getElementById('displayed-count');
    const totalCountEl = document.getElementById('total-count');

    let allReviews = [];
    let filteredReviews = [];
    let displayedReviewsCount = 8;
    const loadIncrement = 10;

    // Fetch and Initialize Reviews
    fetch('reviews.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then(data => {
            allReviews = data;
            filteredReviews = [...allReviews];
            
            // Update counts in DOM
            totalCountEl.textContent = allReviews.length;
            
            // Initial Render
            renderReviews();
        })
        .catch(err => {
            console.error('Error fetching reviews:', err);
            if (reviewsList) {
                reviewsList.innerHTML = `
                    <div class="loading-reviews" style="color: #991b1b;">
                        <i class="fa-solid fa-circle-exclamation"></i> 
                        후기를 불러오는 도중 오류가 발생했습니다. 나중에 다시 시도해 주세요.
                    </div>
                `;
            }
        });

    // Helper: Create stars string based on rating
    function getStarsHTML(rating) {
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                starsHTML += '<i class="fa-solid fa-star"></i> ';
            } else {
                starsHTML += '<i class="fa-regular fa-star"></i> ';
            }
        }
        return starsHTML;
    }

    // Render Reviews list
    function renderReviews() {
        if (!reviewsList) return;
        reviewsList.innerHTML = '';

        const reviewsToRender = filteredReviews.slice(0, displayedReviewsCount);
        displayedCountEl.textContent = reviewsToRender.length;
        totalCountEl.textContent = filteredReviews.length;

        if (reviewsToRender.length === 0) {
            reviewsList.innerHTML = `
                <div class="loading-reviews" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-magnifying-glass"></i> 검색 결과에 일치하는 후기가 없습니다.
                </div>
            `;
            if (btnLoadMore) btnLoadMore.style.display = 'none';
            return;
        }

        reviewsToRender.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            // Format meta info (Lessons count / Date)
            let metaText = '';
            if (review.lessons && review.date) {
                metaText = `${review.lessons} • ${review.date}`;
            } else if (review.lessons) {
                metaText = review.lessons;
            } else if (review.date) {
                metaText = review.date;
            } else {
                metaText = 'Verified Student';
            }

            card.innerHTML = `
                <div class="review-header">
                    <div class="student-info">
                        <span class="student-name">${review.name}</span>
                        <span class="student-meta">${metaText}</span>
                    </div>
                    <div class="review-rating">
                        ${getStarsHTML(review.rating || 5)}
                    </div>
                </div>
                <p class="review-body">${review.content}</p>
            `;
            reviewsList.appendChild(card);
        });

        // Toggle Load More button visibility
        if (btnLoadMore) {
            if (displayedReviewsCount >= filteredReviews.length) {
                btnLoadMore.style.display = 'none';
            } else {
                btnLoadMore.style.display = 'inline-flex';
            }
        }
    }

    // Load More click handler
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            displayedReviewsCount += loadIncrement;
            renderReviews();
        });
    }

    // Search/Filter Input handler
    if (reviewSearch) {
        reviewSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            filteredReviews = allReviews.filter(review => {
                const nameMatch = review.name.toLowerCase().includes(searchTerm);
                const contentMatch = review.content.toLowerCase().includes(searchTerm);
                return nameMatch || contentMatch;
            });

            // Reset view count back to initial
            displayedReviewsCount = 8;
            renderReviews();
        });
    }

    // ==========================================
    // 4. Contact Form Handling
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Check formspree connection or placeholder
            const action = contactForm.getAttribute('action');
            if (action.includes('placeholder')) {
                // If placeholder, handle with local success message
                e.preventDefault();
                
                const name = document.getElementById('form-name').value;
                const email = document.getElementById('form-email').value;
                const message = document.getElementById('form-message').value;

                // Simple validation check
                if (name && email && message) {
                    // Create an elegant custom notification alert
                    const notification = document.createElement('div');
                    notification.style.position = 'fixed';
                    notification.style.bottom = '24px';
                    notification.style.right = '24px';
                    notification.style.backgroundColor = '#1A3038';
                    notification.style.color = '#FFFFFF';
                    notification.style.padding = '16px 24px';
                    notification.style.borderRadius = '8px';
                    notification.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                    notification.style.zIndex = '9999';
                    notification.style.display = 'flex';
                    notification.style.alignItems = 'center';
                    notification.style.gap = '12px';
                    notification.style.fontFamily = 'Inter, sans-serif';
                    notification.style.fontSize = '0.95rem';
                    notification.innerHTML = `
                        <i class="fa-solid fa-circle-check" style="color: #B88E4F; font-size: 1.2rem;"></i>
                        <span>메시지가 전송되었습니다! 곧 이메일로 회신해 드리겠습니다.</span>
                    `;
                    document.body.appendChild(notification);

                    // Reset form
                    contactForm.reset();

                    // Remove notification after 4 seconds
                    setTimeout(() => {
                        notification.style.opacity = '0';
                        notification.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => notification.remove(), 500);
                    }, 4000);
                }
            }
        });
    }
});
