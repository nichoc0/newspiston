/**
 * NewsPiston v3 - Piston Solutions Intelligence Digest
 * Modern UI with animations
 */

const API_BASE = './content';

// State
let currentDigest = null;
let archiveData = [];

// Initialize
async function init() {
    updateTimestamps();
    setInterval(updateTimestamps, 1000);
    
    await loadTodayDigest();
    await loadArchive();
    setupNavigation();
    updateHeroStats();
}

// Update timestamps
function updateTimestamps() {
    const now = new Date();
    const utc = now.toISOString().split('T')[1].split('.')[0];
    
    const timestampEl = document.getElementById('timestamp');
    const heroDateEl = document.getElementById('hero-date');
    const footerTimeEl = document.getElementById('footer-time');
    
    if (timestampEl) timestampEl.textContent = `${utc} UTC`;
    if (heroDateEl) heroDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    if (footerTimeEl) footerTimeEl.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

// Update hero stats
function updateHeroStats() {
    const statHighlights = document.getElementById('stat-highlights');
    const statItems = document.getElementById('stat-items');
    
    if (!currentDigest) {
        if (statHighlights) statHighlights.textContent = '0';
        if (statItems) statItems.textContent = '0';
        return;
    }
    
    const highlights = currentDigest.highlights || [];
    const tech = currentDigest.tech_research || [];
    const events = currentDigest.events || [];
    const business = currentDigest.business_opportunities || [];
    const research = currentDigest.research_montreal || [];
    const totalItems = tech.length + events.length + business.length + research.length;
    
    if (statHighlights) statHighlights.textContent = highlights.length;
    if (statItems) statItems.textContent = totalItems;
}

// Load today's digest
async function loadTodayDigest() {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${API_BASE}/${today}.json?v=${cacheBuster}`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            // Try sample.json as fallback
            const sampleResponse = await fetch(`${API_BASE}/sample.json?v=${cacheBuster}`);
            if (sampleResponse.ok) {
                currentDigest = await sampleResponse.json();
                renderDigest(currentDigest);
                return;
            }
            throw new Error('No digest available');
        }
        
        currentDigest = await response.json();
        renderDigest(currentDigest);
    } catch (error) {
        console.error('Failed to load digest:', error);
        renderEmptyState();
    }
}

// Render digest
function renderDigest(digest) {
    // Executive summary
    const summaryEl = document.getElementById('summary-text');
    if (summaryEl) {
        summaryEl.textContent = digest.summary || 'No summary available for today.';
    }
    
    // Update hero stats
    updateHeroStats();
    
    // Highlights
    renderHighlights(digest.highlights || []);
    
    // Render 4 main sections
    renderTechSection(digest.tech_research || []);
    renderEventsSection(digest.events || []);
    renderBusinessSection(digest.business_opportunities || []);
    renderResearchSection(digest.research_montreal || []);
}

// Render highlights
function renderHighlights(highlights) {
    const highlightsEl = document.getElementById('highlights-grid');
    if (!highlightsEl) return;
    
    if (highlights.length === 0) {
        highlightsEl.innerHTML = `
            <div class="highlight-card" style="--card-color: var(--accent-primary)">
                <div class="highlight-header">
                    <div class="highlight-icon tech">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span class="highlight-category tech">Welcome</span>
                </div>
                <h3 class="highlight-title">NewsPiston is Live</h3>
                <p class="highlight-excerpt">Your intelligence digest is ready. Content will appear here when available.</p>
            </div>
        `;
        return;
    }
    
    highlightsEl.innerHTML = highlights.map((h, index) => {
        const colors = {
            tech: 'var(--tech)',
            events: 'var(--events)',
            business: 'var(--business)',
            research: 'var(--research)',
            'tech_research': 'var(--tech)',
            'business_opportunities': 'var(--business)',
            'research_montreal': 'var(--research)'
        };
        const color = colors[h.category?.toLowerCase()] || 'var(--accent-primary)';
        const icons = {
            tech: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
            events: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
            business: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
            research: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
        };
        const icon = icons[h.category?.toLowerCase()] || icons.tech;
        
        return `
            <div class="highlight-card" style="--card-color: ${color}; animation-delay: ${index * 0.1}s">
                <div class="highlight-header">
                    <div class="highlight-icon ${h.category?.toLowerCase()}">
                        ${icon}
                    </div>
                    <span class="highlight-category ${h.category?.toLowerCase()}">${h.category}</span>
                </div>
                <h3 class="highlight-title">${h.title}</h3>
                <p class="highlight-excerpt">${h.summary}</p>
                ${h.url ? `
                    <div class="highlight-actions">
                        <a href="${h.url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
                            Read More
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 17L17 7M17 7H7M17 7V17"/>
                            </svg>
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Render Tech & Research section
function renderTechSection(items) {
    const listEl = document.getElementById('tech-list');
    const countEl = document.getElementById('tech-count');
    
    if (countEl) countEl.textContent = items.length;
    if (!listEl) return;
    
    if (items.length === 0) {
        listEl.innerHTML = renderEmptyStateHTML('No tech/research items today.');
        return;
    }
    
    listEl.innerHTML = items.map((item, index) => `
        <div class="item-card" style="animation-delay: ${index * 0.05}s">
            <div class="item-header">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-priority ${item.priority || 'medium'}">${item.priority || 'medium'}</span>
            </div>
            <p class="item-description">${item.summary}</p>
            <div class="item-meta">
                <span class="item-source">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                    </svg>
                    ${item.source || 'Unknown'}
                </span>
                ${item.time ? `<span class="item-date">${item.time}</span>` : ''}
                ${item.relevance ? `<span class="item-tag">→ ${item.relevance}</span>` : ''}
                ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View Source</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Render Events section
function renderEventsSection(items) {
    const listEl = document.getElementById('events-list');
    const countEl = document.getElementById('events-count');
    
    if (countEl) countEl.textContent = items.length;
    if (!listEl) return;
    
    if (items.length === 0) {
        listEl.innerHTML = renderEmptyStateHTML('No events today.');
        return;
    }
    
    listEl.innerHTML = items.map((item, index) => `
        <div class="item-card" style="animation-delay: ${index * 0.05}s">
            <div class="item-header">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-priority ${item.priority || 'medium'}">${item.priority || 'medium'}</span>
            </div>
            <p class="item-description">${item.summary}</p>
            <div class="item-meta">
                <span class="item-source">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    ${item.source || 'Unknown'}
                </span>
                ${item.date ? `<span class="item-date">${item.date}</span>` : ''}
                ${item.relevance ? `<span class="item-tag">→ ${item.relevance}</span>` : ''}
                ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View Details</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Render Business Opportunities section
function renderBusinessSection(items) {
    const listEl = document.getElementById('business-list');
    const countEl = document.getElementById('business-count');
    
    if (countEl) countEl.textContent = items.length;
    if (!listEl) return;
    
    if (items.length === 0) {
        listEl.innerHTML = renderEmptyStateHTML('No business opportunities today.');
        return;
    }
    
    listEl.innerHTML = items.map((item, index) => `
        <div class="item-card" style="animation-delay: ${index * 0.05}s">
            <div class="item-header">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-priority ${item.priority || 'medium'}">${item.priority || 'medium'}</span>
            </div>
            <p class="item-description">${item.summary}</p>
            <div class="item-meta">
                <span class="item-source">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                    ${item.source || 'Unknown'}
                </span>
                ${item.size ? `<span class="item-tag">${item.size}</span>` : ''}
                ${item.relevance ? `<span class="item-tag">→ ${item.relevance}</span>` : ''}
                ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View Opportunity</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Render Montreal Research section
function renderResearchSection(items) {
    const listEl = document.getElementById('research-list');
    const countEl = document.getElementById('research-count');
    
    if (countEl) countEl.textContent = items.length;
    if (!listEl) return;
    
    if (items.length === 0) {
        listEl.innerHTML = renderEmptyStateHTML('No research opportunities today.');
        return;
    }
    
    listEl.innerHTML = items.map((item, index) => `
        <div class="item-card" style="animation-delay: ${index * 0.05}s">
            <div class="item-header">
                <h3 class="item-title">${item.name || item.title}</h3>
                <span class="item-priority ${item.priority || 'medium'}">${item.priority || 'medium'}</span>
            </div>
            ${item.title && item.name ? `<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${item.title}</p>` : ''}
            ${item.affiliation ? `<p style="font-size: 13px; color: var(--accent-primary); margin-bottom: 8px;">${item.affiliation}</p>` : ''}
            <p class="item-description">${item.research || item.summary}</p>
            ${item.relevance ? `<p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">→ ${item.relevance}</p>` : ''}
            ${item.action ? `<p style="font-size: 13px; color: var(--events); margin-top: 8px;">Action: ${item.action}</p>` : ''}
            <div class="item-meta" style="margin-top: 12px;">
                <span class="item-source">${item.source || 'Research'}</span>
                ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View Profile</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Render empty state HTML
function renderEmptyStateHTML(message) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
            </div>
            <h3>No Data Available</h3>
            <p>${message}</p>
        </div>
    `;
}

// Render empty state for entire digest
function renderEmptyState() {
    const summaryEl = document.getElementById('summary-text');
    if (summaryEl) {
        summaryEl.textContent = 'No digest available for today. Content is ingested via JSON files in the content/ directory.';
    }
    
    ['tech', 'events', 'business', 'research'].forEach(section => {
        const listEl = document.getElementById(`${section}-list`);
        const countEl = document.getElementById(`${section}-count`);
        if (listEl) listEl.innerHTML = renderEmptyStateHTML('Waiting for data...');
        if (countEl) countEl.textContent = '0';
    });
    
    const highlightsEl = document.getElementById('highlights-grid');
    if (highlightsEl) {
        highlightsEl.innerHTML = `
            <div class="highlight-card" style="--card-color: var(--accent-primary)">
                <div class="highlight-header">
                    <div class="highlight-icon tech">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <span class="highlight-category tech">Status</span>
                </div>
                <h3 class="highlight-title">No Digest Available</h3>
                <p class="highlight-excerpt">Content will appear here when JSON files are added to the content directory.</p>
            </div>
        `;
    }
    
    updateHeroStats();
}

// Load archive
async function loadArchive() {
    try {
        const response = await fetch(`${API_BASE}/archive.json`);
        if (response.ok) {
            archiveData = await response.json();
        }
    } catch (error) {
        console.log('No archive data available');
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
