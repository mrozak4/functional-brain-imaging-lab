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
        
        const rolesOrder = [
            "Principal Investigator",
            "Postdoctoral Fellows",
            "PhD Student",
            "Master's Student",
            "Research Staff / Technicians",
            "Undergraduate Student"
        ];
        
        const getRoleOrder = (role) => {
            const index = rolesOrder.indexOf(role);
            return index === -1 ? 99 : index;
        };

        if (currentMembersContainer) {
            const current = data.members.filter(m => m.status === 'current');
            current.sort((a, b) => getRoleOrder(a.role) - getRoleOrder(b.role));
            
            let html = '';
            current.forEach(member => {
                html += `
                    <div class="person-card">
                        <img src="${prefix}${member.photo}" alt="${member.name}" class="person-photo" onerror="this.src='${prefix}images/people/placeholder.jpg'">
                        <h3>${member.name}</h3>
                        <p class="role">${member.role}</p>
                        ${member.education ? `<p class="education">${member.education}</p>` : ''}
                        <p class="bio">${member[langBio] || member.bio_en}</p>
                        <div class="links">
                            ${member.links?.scholar ? `<a href="${member.links.scholar}" target="_blank">Google Scholar</a>` : ''}
                            ${member.links?.orcid ? `<a href="${member.links.orcid}" target="_blank">ORCID</a>` : ''}
                            ${member.links?.email ? `<a href="mailto:${member.links.email}">Email</a>` : ''}
                        </div>
                    </div>
                `;
            });
            currentMembersContainer.innerHTML = html;
        }

        if (alumniContainer) {
            const alumni = data.members.filter(m => m.status === 'alumni');
            alumni.sort((a, b) => (b.yearLeft || 0) - (a.yearLeft || 0));
            
            let html = '';
            alumni.forEach(member => {
                html += `
                    <div class="alumni-card">
                        <img src="${prefix}${member.photo}" alt="${member.name}" class="person-photo" onerror="this.src='${prefix}images/people/placeholder.jpg'">
                        <h3>${member.name}</h3>
                        <p class="role">${member.role}</p>
                        <p class="year-left">Left: ${member.yearLeft}</p>
                        <p class="current-position"><strong>${I18n.t('people.currentPosition')}:</strong> ${member.currentPosition}</p>
                        <p class="bio">${member[langBio] || member.bio_en}</p>
                    </div>
                `;
            });
            alumniContainer.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error loading people data:', error);
    }
});
