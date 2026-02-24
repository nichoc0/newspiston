/**
 * NewsPiston v2 - Piston Solutions Intelligence Digest
 * 4-Section Format: Tech | Events | Business | MTL Research
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
            <div class="highlight-card priority-${h.priority || 'medium'}">
                <div class="highlight-category">${h.category}</div>
                <div class="highlight-title">${h.title}</div>
                <div class="highlight-summary">${h.summary}</div>
                <div class="item-meta">
                    <span class="priority-badge ${h.priority || 'medium'}">${h.priority?.toUpperCase() || 'MEDIUM'}</span>
                    ${h.url ? `<span class="item-source"><a href="${h.url}" target="_blank" rel="noopener">${h.source || 'Link'}</a></span>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        highlightsEl.innerHTML = '<div class="empty-state">No highlights for today.</div>';
    }
    
    // Render 4 main sections
    renderTechSection(digest.tech_research || []);
    renderEventsSection(digest.events || []);
    renderBusinessSection(digest.business_opportunities || []);
    renderResearchSection(digest.research_montreal || []);
}

// Render Tech & Research section
function renderTechSection(items) {
    const listEl = document.getElementById('tech-list');
    const countEl = document.getElementById('tech-count');
    
    countEl.textContent = items.length;
    
    if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No tech/research items today.</div>`;
        return;
    }
    
    listEl.innerHTML = items.map((item, index) => `
        <div class="news-item">
            <div class="item-content">
                <div class="item-title">
                    <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
                </div>
                <div class="item-summary">${item.summary}</div>
                <div class="item-meta">
                    <span class="source-tag">${item.source}</span>
                    <span class="priority-badge ${item.priority || 'medium'}">${item.priority?.toUpperCase() || 'MEDIUM'}</span>
                    ${item.relevance ? `<span class="relevance-text">→ ${item.relevance}</span>` : ''}
                </div>
            </div>
            <div class="item-time">${item.time || ''}</div>
        </div>
    `).join('');
}

// Render Events section
function renderEventsSection(items) {
    const listEl = document.getElementById('events-list');
    const countEl = document.getElementById('events-count');
    
    countEl.textContent = items.length;
    
    if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No events today.</div>`;
        return;
    }
    
    listEl.innerHTML = items.map(item => `
        <div class="news-item">
            <div class="item-content">
                <div class="item-title">
                    <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
                </div>
                <div class="item-summary">${item.summary}</div>
                <div class="item-meta">
                    <span class="source-tag">${item.source}</span>
                    ${item.date ? `<span class="date-tag">${item.date}</span>` : ''}
                    <span class="priority-badge ${item.priority || 'medium'}">${item.priority?.toUpperCase() || 'MEDIUM'}</span>
                    ${item.relevance ? `<span class="relevance-text">→ ${item.relevance}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Render Business Opportunities section
function renderBusinessSection(items) {
    const listEl = document.getElementById('business-list');
    const countEl = document.getElementById('business-count');
    
    countEl.textContent = items.length;
    
    if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No business opportunities today.</div>`;
        return;
    }
    
    listEl.innerHTML = items.map(item => `
        <div class="news-item">
            <div class="item-content">
                <div class="item-title">
                    <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
                </div>
                <div class="item-summary">${item.summary}</div>
                <div class="item-meta">
                    <span class="source-tag">${item.source}</span>
                    ${item.size ? `<span class="size-tag">${item.size}</span>` : ''}
                    <span class="priority-badge ${item.priority || 'medium'}">${item.priority?.toUpperCase() || 'MEDIUM'}</span>
                    ${item.relevance ? `<span class="relevance-text">→ ${item.relevance}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Render Montreal Research section
function renderResearchSection(items) {
    const listEl = document.getElementById('research-list');
    const countEl = document.getElementById('research-count');
    
    countEl.textContent = items.length;
    
    if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No research opportunities today.</div>`;
        return;
    }
    
    listEl.innerHTML = items.map(item => `
        <div class="news-item research-card">
            <div class="item-content">
                <div class="item-title">${item.name}</div>
                <div class="research-title">${item.title}</div>
                ${item.affiliation ? `<div class="research-affiliation">${item.affiliation}</div>` : ''}
                <div class="item-summary">${item.research}</div>
                <div class="item-meta">
                    <span class="source-tag">${item.source || 'Research'}</span>
                    <span class="priority-badge ${item.priority || 'medium'}">${item.priority?.toUpperCase() || 'MEDIUM'}</span>
                </div>
                ${item.relevance ? `<div class="relevance-box">→ ${item.relevance}</div>` : ''}
                ${item.action ? `<div class="action-box">Action: ${item.action}</div>` : ''}
            </div>
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
        </p>
    `;
    
    ['tech', 'events', 'business', 'research'].forEach(section => {
        const listEl = document.getElementById(`${section}-list`);
        const countEl = document.getElementById(`${section}-count`);
        if (listEl) listEl.innerHTML = `<div class="empty-state">Waiting for data...</div>`;
        if (countEl) countEl.textContent = '0';
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
