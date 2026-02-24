/**
 * NewsPiston - Piston Solutions Intelligence Digest
 * Lightweight vanilla JS - no frameworks
 */

const API_BASE = './content';

// State
let currentDigest = null;
let archiveData = [];

// Initialize
async function init() {
    updateTimestamps();
    setInterval(updateTimestamps, 1000);
    
    // Try to load today's digest
    await loadTodayDigest();
    
    // Load archive
    await loadArchive();
    
    // Setup navigation
    setupNavigation();
}

// Update timestamps
function updateTimestamps() {
    const now = new Date();
    const utc = now.toISOString().split('T')[1].split('.')[0];
    document.getElementById('timestamp').textContent = `${utc} UTC`;
    document.getElementById('footer-time').textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

// Load today's digest
async function loadTodayDigest() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('today-date').textContent = today;
    
    try {
        const response = await fetch(`${API_BASE}/${today}.json`);
        if (!response.ok) throw new Error('No digest for today');
        
        currentDigest = await response.json();
        renderDigest(currentDigest);
    } catch (error) {
        // Try sample data
        try {
            const sample = await fetch(`${API_BASE}/sample.json`);
            if (sample.ok) {
                currentDigest = await sample.json();
                renderDigest(currentDigest);
                return;
            }
        } catch (e) {}
        
        // Show empty state
        renderEmptyState();
    }
}

// Render digest
function renderDigest(digest) {
    // Executive summary
    const summaryEl = document.getElementById('digest-summary');
    summaryEl.innerHTML = `<p class="executive-summary">${digest.summary || 'No summary available.'}</p>`;
    
    // Highlights
    const highlightsEl = document.getElementById('highlights-grid');
    const highlights = digest.highlights || [];
    
    if (highlights.length > 0) {
        highlightsEl.innerHTML = highlights.map(h => `
            <div class="highlight-card">
                <div class="highlight-category">${h.category}</div>
                <div class="highlight-title">${h.title}</div>
                <div class="highlight-summary">${h.summary}</div>
                <div class="item-meta">
                    <span class="relevance-tag tag-${h.priority || 'medium'}">${h.priority?.toUpperCase() || 'MEDIUM'}</span>
                    ${h.source ? `<span class="item-source"><a href="${h.url}" target="_blank" rel="noopener">${h.source}</a></span>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        highlightsEl.innerHTML = '<div class="empty-state">No highlights for today.</div>';
    }
    
    // Render sections
    renderSection('arxiv', digest.arxiv || []);
    renderSection('launches', digest.launches || []);
    renderSection('procurement', digest.procurement || []);
    renderSection('competitors', digest.competitors || []);
    renderSection('academic', digest.academic || []);
    renderSection('industry', digest.industry || []);
}

// Render section
function renderSection(sectionId, items) {
    const listEl = document.getElementById(`${sectionId}-list`);
    const countEl = document.getElementById(`${sectionId}-count`);
    
    countEl.textContent = items.length;
    
    if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No items in this section today.</div>`;
        return;
    }
    
    listEl.innerHTML = items.map((item, index) => `
        <div class="news-item">
            <div class="item-score">${index + 1}</div>
            <div class="item-content">
                <div class="item-title">
                    <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
                </div>
                <div class="item-summary">${item.summary}</div>
                <div class="item-meta">
                    <span class="item-source">
                        <a href="${item.url}" target="_blank" rel="noopener">${item.source}</a>
                    </span>
                    <span class="relevance-tag tag-${item.priority || 'medium'}">${item.priority?.toUpperCase() || 'MEDIUM'}</span>
                    ${item.relevance ? `<span class="relevance-tag tag-${item.priority || 'medium'}">${item.relevance}</span>` : ''}
                </div>
            </div>
            <div class="item-time">${item.time || ''}</div>
        </div>
    `).join('');
}

// Render empty state
function renderEmptyState() {
    const summary = document.getElementById('digest-summary');
    summary.innerHTML = `
        <p class="executive-summary">
            <strong>Status:</strong> No digest available for today. 
            Content is ingested via JSON files in the <code>content/</code> directory. 
            Add <code>YYYY-MM-DD.json</code> to publish.
        </p>
    `;
    
    ['arxiv', 'launches', 'procurement', 'competitors', 'academic', 'industry'].forEach(section => {
        document.getElementById(`${section}-list`).innerHTML = 
            `<div class="empty-state">Waiting for data ingestion...</div>`;
    });
}

// Load archive
async function loadArchive() {
    try {
        const response = await fetch(`${API_BASE}/archive.json`);
        if (response.ok) {
            archiveData = await response.json();
            renderArchive();
        }
    } catch (error) {
        console.log('No archive data');
    }
}

// Render archive
function renderArchive() {
    const archiveEl = document.getElementById('archive-grid');
    
    if (archiveData.length === 0) {
        archiveEl.innerHTML = '<div class="empty-state">Archive will appear here.</div>';
        return;
    }
    
    archiveEl.innerHTML = archiveData.slice(0, 12).map(day => `
        <a href="#" class="archive-card" data-date="${day.date}">
            <div class="archive-date">${day.date}</div>
            <div class="archive-count">${day.count} items</div>
        </a>
    `).join('');
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
