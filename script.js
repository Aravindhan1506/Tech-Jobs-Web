// DevJobs - Interactive Filtering and UI Enhancement
document.addEventListener('DOMContentLoaded', function() {
    console.log('DevJobs Tech Job Board loaded successfully!');
    
    // Get all filter elements
    const roleFilters = document.querySelectorAll('input[type="checkbox"][id$="end"], input[type="checkbox"][id$="ack"], input[type="checkbox"][id$="ull"], input[type="checkbox"][id$="ops"], input[type="checkbox"][id$="ile"]');
    const techFilters = document.querySelectorAll('input[type="checkbox"][id$="ipt"], input[type="checkbox"][id$="act"], input[type="checkbox"][id$="ejs"], input[type="checkbox"][id$="hon"], input[type="checkbox"][id$="ava"]');
    const locationFilter = document.getElementById('locationFilter');
    const experienceFilters = document.querySelectorAll('input[name="experience"]');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const mainSearch = document.getElementById('mainSearch');
    const sortBy = document.getElementById('sortBy');
    const jobCount = document.getElementById('jobCount');
    const jobGrid = document.getElementById('jobGrid');
    const loadMoreBtn = document.getElementById('loadMore');
    
    // Get all job cards
    let allJobCards = Array.from(document.querySelectorAll('.job-card'));
    let visibleJobCards = [...allJobCards];
    let currentFilters = {
        roles: [],
        techs: [],
        location: '',
        experience: '',
        search: ''
    };
    
    // Initialize the application
    init();
    
    function init() {
        updateJobCount();
        attachEventListeners();
        animateJobCards();
    }
    
    function attachEventListeners() {
        // Role filter listeners
        roleFilters.forEach(filter => {
            filter.addEventListener('change', handleRoleFilter);
        });
        
        // Tech filter listeners
        techFilters.forEach(filter => {
            filter.addEventListener('change', handleTechFilter);
        });
        
        // Location filter listener
        locationFilter.addEventListener('change', handleLocationFilter);
        
        // Experience filter listeners
        experienceFilters.forEach(filter => {
            filter.addEventListener('change', handleExperienceFilter);
        });
        
        // Search listener
        mainSearch.addEventListener('input', debounce(handleSearch, 300));
        
        // Sort listener
        sortBy.addEventListener('change', handleSort);
        
        // Clear filters listener
        clearFiltersBtn.addEventListener('click', clearAllFilters);
        
        // Apply button listeners
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', handleApply);
        });
        
        // Load more listener
        loadMoreBtn.addEventListener('click', handleLoadMore);
    }
    
    function handleRoleFilter(event) {
        const role = event.target.value;
        if (event.target.checked) {
            if (!currentFilters.roles.includes(role)) {
                currentFilters.roles.push(role);
            }
        } else {
            currentFilters.roles = currentFilters.roles.filter(r => r !== role);
        }
        applyFilters();
    }
    
    function handleTechFilter(event) {
        const tech = event.target.value;
        if (event.target.checked) {
            if (!currentFilters.techs.includes(tech)) {
                currentFilters.techs.push(tech);
            }
        } else {
            currentFilters.techs = currentFilters.techs.filter(t => t !== tech);
        }
        applyFilters();
    }
    
    function handleLocationFilter(event) {
        currentFilters.location = event.target.value;
        applyFilters();
    }
    
    function handleExperienceFilter(event) {
        currentFilters.experience = event.target.value;
        applyFilters();
    }
    
    function handleSearch(event) {
        currentFilters.search = event.target.value.toLowerCase();
        applyFilters();
    }
    
    function handleSort(event) {
        const sortType = event.target.value;
        sortJobs(sortType);
    }
    
    function applyFilters() {
        visibleJobCards = allJobCards.filter(card => {
            // Role filter
            if (currentFilters.roles.length > 0) {
                const cardRole = card.getAttribute('data-role');
                if (!currentFilters.roles.includes(cardRole)) {
                    return false;
                }
            }
            
            // Tech filter
            if (currentFilters.techs.length > 0) {
                const cardTechs = card.getAttribute('data-tech').split(',');
                const hasMatchingTech = currentFilters.techs.some(tech => 
                    cardTechs.some(cardTech => cardTech.includes(tech))
                );
                if (!hasMatchingTech) {
                    return false;
                }
            }
            
            // Location filter
            if (currentFilters.location) {
                const cardLocation = card.getAttribute('data-location');
                if (cardLocation !== currentFilters.location) {
                    return false;
                }
            }
            
            // Experience filter
            if (currentFilters.experience) {
                const cardExperience = card.getAttribute('data-experience');
                if (cardExperience !== currentFilters.experience) {
                    return false;
                }
            }
            
            // Search filter
            if (currentFilters.search) {
                const jobTitle = card.querySelector('.job-title').textContent.toLowerCase();
                const companyName = card.querySelector('.company-name').textContent.toLowerCase();
                const description = card.querySelector('.job-description p').textContent.toLowerCase();
                const tags = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
                
                const searchText = `${jobTitle} ${companyName} ${description} ${tags}`;
                if (!searchText.includes(currentFilters.search)) {
                    return false;
                }
            }
            
            return true;
        });
        
        updateJobDisplay();
        updateJobCount();
    }
    
    function updateJobDisplay() {
        // Hide all cards first
        allJobCards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('fade-in');
            card.classList.add('fade-out');
        });
        
        // Show filtered cards with animation
        setTimeout(() => {
            visibleJobCards.forEach((card, index) => {
                card.style.display = 'block';
                setTimeout(() => {
                    card.classList.remove('fade-out');
                    card.classList.add('fade-in');
                }, index * 100);
            });
            
            // Show empty state if no results
            if (visibleJobCards.length === 0) {
                showEmptyState();
            } else {
                hideEmptyState();
            }
        }, 300);
    }
    
    function updateJobCount() {
        const count = visibleJobCards.length;
        jobCount.textContent = `Showing ${count} job${count !== 1 ? 's' : ''}`;
    }
    
    function sortJobs(sortType) {
        switch (sortType) {
            case 'newest':
                // Simulate newest first (reverse current order)
                visibleJobCards.reverse();
                break;
            case 'oldest':
                // Simulate oldest first (original order)
                visibleJobCards.sort((a, b) => {
                    return allJobCards.indexOf(a) - allJobCards.indexOf(b);
                });
                break;
            case 'salary':
                // Sort by salary (extract numbers from salary text)
                visibleJobCards.sort((a, b) => {
                    const salaryA = extractSalary(a.querySelector('.job-salary').textContent);
                    const salaryB = extractSalary(b.querySelector('.job-salary').textContent);
                    return salaryB - salaryA;
                });
                break;
            case 'company':
                // Sort by company name alphabetically
                visibleJobCards.sort((a, b) => {
                    const companyA = a.querySelector('.company-name').textContent;
                    const companyB = b.querySelector('.company-name').textContent;
                    return companyA.localeCompare(companyB);
                });
                break;
        }
        updateJobDisplay();
    }
    
    function extractSalary(salaryText) {
        // Extract the first number from salary text (e.g., "$120k - $160k" -> 120)
        const match = salaryText.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }
    
    function clearAllFilters() {
        // Clear all filter inputs
        roleFilters.forEach(filter => filter.checked = false);
        techFilters.forEach(filter => filter.checked = false);
        locationFilter.value = '';
        experienceFilters.forEach(filter => filter.checked = false);
        mainSearch.value = '';
        
        // Reset filter state
        currentFilters = {
            roles: [],
            techs: [],
            location: '',
            experience: '',
            search: ''
        };
        
        // Reset visible jobs
        visibleJobCards = [...allJobCards];
        updateJobDisplay();
        updateJobCount();
        
        // Show success feedback
        showNotification('All filters cleared!', 'success');
    }
    
    function handleApply(event) {
        event.preventDefault();
        const jobCard = event.target.closest('.job-card');
        const jobTitle = jobCard.querySelector('.job-title').textContent;
        const companyName = jobCard.querySelector('.company-name').textContent;
        
        // Simulate application process
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Applying...';
        event.target.disabled = true;
        
        setTimeout(() => {
            event.target.innerHTML = '<i class="fas fa-check me-1"></i>Applied!';
            event.target.classList.remove('btn-success');
            event.target.classList.add('btn-secondary');
            
            showNotification(`Application submitted for ${jobTitle} at ${companyName}!`, 'success');
        }, 2000);
    }
    
    function handleLoadMore() {
        // Simulate loading more jobs
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            loadMoreBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Load More Jobs';
            loadMoreBtn.disabled = false;
            showNotification('No more jobs to load at the moment.', 'info');
        }, 1500);
    }
    
    function showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.id = 'emptyState';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h4>No jobs found</h4>
            <p>Try adjusting your filters or search terms to find more opportunities.</p>
            <button class="btn btn-primary" onclick="document.getElementById('clearFilters').click()">
                Clear All Filters
            </button>
        `;
        
        if (!document.getElementById('emptyState')) {
            jobGrid.appendChild(emptyState);
        }
    }
    
    function hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.remove();
        }
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} notification`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close ms-2" onclick="this.parentElement.remove()"></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    function animateJobCards() {
        // Add staggered animation to job cards on initial load
        allJobCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Utility function for debouncing search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            animation: slideInRight 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(event) {
        // Press 'f' to focus on search
        if (event.key === 'f' && !event.ctrlKey && !event.metaKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                event.preventDefault();
                mainSearch.focus();
            }
        }
        
        // Press 'c' to clear filters
        if (event.key === 'c' && !event.ctrlKey && !event.metaKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                event.preventDefault();
                clearAllFilters();
            }
        }
    });
    
    console.log('DevJobs interactive features initialized successfully!');
});