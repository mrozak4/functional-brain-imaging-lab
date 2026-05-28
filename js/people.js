// js/people.js
document.addEventListener('DOMContentLoaded', async () => {
    const currentMembersContainer = document.getElementById('current-members');
    const alumniContainer = document.getElementById('alumni-members');
    
    if (!currentMembersContainer && !alumniContainer) return; // Not on people page

    try {
        const prefix = I18n.locale === 'fr' ? '../' : './';
        let response = await fetch(`${prefix}data/people.json`);
        if (!response.ok) {
            response = await fetch(`/data/people.json`);
        }
        const data = await response.json();
        
        const langBio = `bio_${I18n.locale}`;
        const langQuote = `quote_${I18n.locale}`;
        const langResearch = `research_${I18n.locale}`;
        
        const rolesOrder = [
            "Principal Investigator",
            "Postdoctoral Fellows",
            "PhD Student",
            "Master's Student",
            "Research Staff / Technicians",
            "Administrative Assistant",
            "Undergraduate Student"
        ];

        // Map data roles to i18n keys for display
        const roleI18nMap = {
            "Principal Investigator": "people.roles.pi",
            "Postdoctoral Fellows": "people.roles.postdoc",
            "PhD Student": "people.roles.phd",
            "Master's Student": "people.roles.msc",
            "Research Staff / Technicians": "people.roles.staff",
            "Administrative Assistant": "people.roles.admin",
            "Undergraduate Student": "people.roles.undergrad",
            "Research Assistant": "people.roles.ra"
        };

        const translateRole = (role) => {
            const key = roleI18nMap[role];
            return key ? I18n.t(key) : role;
        };

        // Roles that get the featured horizontal layout
        const featuredRoles = ["Principal Investigator", "Postdoctoral Fellows"];
        
        const getRoleOrder = (role) => {
            const index = rolesOrder.indexOf(role);
            return index === -1 ? 99 : index;
        };

        // Build link icons HTML
        function buildLinksHtml(member) {
            const links = member.links || {};
            let html = '';
            if (links.scholar) html += `<a href="${links.scholar}" target="_blank" class="link-icon" title="Google Scholar"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/></svg></a>`;
            if (links.orcid) html += `<a href="${links.orcid}" target="_blank" class="link-icon" title="ORCID"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-1.894-1.284-3.722-3.978-3.722h-2.341z"/></svg></a>`;
            if (links.wikipedia) html += `<a href="${links.wikipedia}" target="_blank" class="link-icon" title="Wikipedia"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.991-1.532.144-1.373-2.873-3.06-7.074-4.75-11.3-.158-.398-.352-.584-.597-.584-.163 0-.383.08-.704.248l-.445-.623c.496-.39 1.124-.86 1.86-1.397.806-.583 1.326-.864 1.756-.864.774 0 1.266.536 1.482 1.625.605 3.053 1.261 5.539 1.97 7.487 1.103-2.093 2.474-4.483 3.192-5.877.41-.8.314-1.269-.29-1.406-.375-.086-.478-.228-.478-.39 0-.163.104-.39.314-.682h3.193c.16.228.19.546.095.95-.137.574-.408.998-.816 1.27-1.202.8-2.15 1.825-2.84 3.065z"/></svg></a>`;
            if (links.email) html += `<a href="mailto:${links.email}" class="link-icon" title="Email"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></a>`;
            return html;
        }

        if (currentMembersContainer) {
            const current = data.members.filter(m => m.status === 'current');
            current.sort((a, b) => {
                const roleSort = getRoleOrder(a.role) - getRoleOrder(b.role);
                if (roleSort !== 0) return roleSort;
                return (a.yearJoined || 9999) - (b.yearJoined || 9999);
            });
            
            let html = '';
            let currentRole = '';
            
            current.forEach(member => {
                const isFeatured = featuredRoles.includes(member.role);

                // Add role group header when role changes
                if (member.role !== currentRole) {
                    currentRole = member.role;
                    html += `<div class="role-group-header"><h3>${translateRole(member.role)}</h3></div>`;
                }

                const quoteText = member[langQuote] || member.quote_en;
                const quoteAuthor = member.quote_author;
                const quoteHtml = quoteText ? `
                    <blockquote class="person-quote">
                        <span class="quote-mark">\u201C</span>${quoteText}<span class="quote-mark">\u201D</span>
                        ${quoteAuthor ? `<cite>— ${quoteAuthor}</cite>` : ''}
                    </blockquote>
                ` : '';

                const researchText = member[langResearch] || member.research_en;
                const researchLabel = I18n.t('people.research');
                const researchHtml = researchText ? `
                    <div class="research-summary">
                        <h4 class="research-heading"><span class="research-icon">🔬</span> ${researchLabel}</h4>
                        <p>${researchText}</p>
                    </div>
                ` : '';

                const linksHtml = buildLinksHtml(member);

                if (isFeatured) {
                    // Horizontal featured card (PI / Postdocs)
                    html += `
                        <div class="person-card person-card--featured">
                            <div class="person-photo-wrapper">
                                <img src="${prefix}${member.photo}" alt="${member.name}" class="person-photo person-photo--circle" onerror="this.src='${prefix}images/people/placeholder.jpg'">
                            </div>
                            <div class="person-details">
                                <h3>${member.name}</h3>
                                <p class="role">${translateRole(member.role)}</p>
                                ${member.yearJoined ? `<p class="year-joined">${I18n.t('people.joined')} ${member.yearJoined}</p>` : ''}
                                ${member.titles ? `<p class="titles">${member.titles}</p>` : ''}
                                ${member.education ? `<p class="education">${member.education}</p>` : ''}
                                ${researchHtml}
                                <p class="bio">${member[langBio] || member.bio_en}</p>
                                ${quoteHtml}
                                <div class="person-links">${linksHtml}</div>
                            </div>
                        </div>
                    `;
                } else {
                    // Standard grid card (students, staff, etc.)
                    html += `
                        <div class="person-card person-card--grid">
                            <img src="${prefix}${member.photo}" alt="${member.name}" class="person-photo person-photo--circle" onerror="this.src='${prefix}images/people/placeholder.jpg'">
                            <div class="person-details">
                                <h3>${member.name}</h3>
                                <p class="role">${translateRole(member.role)}</p>
                                ${member.yearJoined ? `<p class="year-joined">${I18n.t('people.joined')} ${member.yearJoined}</p>` : ''}
                                ${researchHtml}
                                <p class="bio">${member[langBio] || member.bio_en}</p>
                                ${quoteHtml}
                                <div class="person-links">${linksHtml}</div>
                            </div>
                        </div>
                    `;
                }
            });
            currentMembersContainer.innerHTML = html;
        }

        if (alumniContainer) {
            const alumni = data.members.filter(m => m.status === 'alumni');
            alumni.sort((a, b) => {
                const yearSort = (b.yearLeft || 0) - (a.yearLeft || 0);
                if (yearSort !== 0) return yearSort;
                return getRoleOrder(a.role) - getRoleOrder(b.role);
            });
            
            let html = '';
            alumni.forEach(member => {
                const quoteText = member[langQuote] || member.quote_en;
                const quoteAuthor = member.quote_author;
                const quoteHtml = quoteText ? `
                    <blockquote class="person-quote">
                        <span class="quote-mark">\u201C</span>${quoteText}<span class="quote-mark">\u201D</span>
                        ${quoteAuthor ? `<cite>— ${quoteAuthor}</cite>` : ''}
                    </blockquote>
                ` : '';

                const researchText = member[langResearch] || member.research_en;
                const researchHtml = researchText ? `
                    <div class="research-summary">
                        <h4 class="research-heading"><span class="research-icon">🔬</span> Research</h4>
                        <p>${researchText}</p>
                    </div>
                ` : '';

                html += `
                    <div class="alumni-card">
                        <img src="${prefix}${member.photo}" alt="${member.name}" class="person-photo person-photo--circle" onerror="this.src='${prefix}images/people/placeholder.jpg'">
                        <div class="person-details">
                            <h3>${member.name}</h3>
                            <p class="role">${member.role}</p>
                            <p class="year-left">${member.yearJoined ? member.yearJoined + ' \u2013 ' : ''}${member.yearLeft}</p>
                            ${member.currentPosition ? `<p class="current-position"><strong>${I18n.t('people.currentPosition')}:</strong> ${member.currentPosition}</p>` : ''}
                            ${researchHtml}
                            <p class="bio">${member[langBio] || member.bio_en}</p>
                            ${quoteHtml}
                        </div>
                    </div>
                `;
            });
            alumniContainer.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error loading people data:', error);
    }
});
