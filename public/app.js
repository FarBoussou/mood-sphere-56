// Configuration Supabase
const SUPABASE_URL = 'https://ctsfsnagodamibycfnii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c2ZzbmFnb2RhbWlieWNmbmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzY0NzAsImV4cCI6MjA3NDc1MjQ3MH0.ne7aK-4arXRXfgO_KDQ5WsA6NC5shnPDaknYMX0XPEE';

// Initialiser le client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

// Get energy color and label
function getEnergyInfo(level) {
    const labels = ["Très faible", "Faible", "Modérée", "Élevée", "Très élevée"];
    const colors = ["energy-low", "energy-low", "energy-medium", "energy-high", "energy-high"];
    
    return {
        label: labels[level - 1] || "Inconnue",
        color: colors[level - 1] || "energy-medium"
    };
}

// Page d'accueil - Formulaire
if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
    const form = document.getElementById('mood-form');
    const textarea = document.getElementById('mood-text');
    const charCounter = document.getElementById('char-counter');
    const slider = document.getElementById('energy-slider');
    const energyDisplay = document.getElementById('energy-display');
    const submitBtn = document.getElementById('submit-btn');

    // Compteur de caractères
    textarea.addEventListener('input', () => {
        charCounter.textContent = textarea.value.length;
    });

    // Mise à jour du slider
    slider.addEventListener('input', () => {
        energyDisplay.textContent = `${slider.value}%`;
    });

    // Soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const moodText = textarea.value.trim();
        const energyLevel = parseInt(slider.value);

        if (!moodText) {
            showToast('Veuillez décrire votre humeur', 'error');
            return;
        }

        // Convertir 0-100 en 1-5
        const convertedEnergy = Math.ceil((energyLevel / 100) * 5);
        const finalEnergy = Math.max(1, Math.min(5, convertedEnergy));

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi...';

        try {
            const { error } = await supabase
                .from('mood_responses')
                .insert({
                    mood_text: moodText,
                    energy_level: finalEnergy
                });

            if (error) throw error;

            showToast('Humeur partagée !', 'success');
            textarea.value = '';
            slider.value = 50;
            energyDisplay.textContent = '50%';
            charCounter.textContent = '0';
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Impossible de partager votre humeur', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Partager mon humeur';
        }
    });
}

// Page des humeurs
async function loadMoods() {
    const container = document.getElementById('moods-container');
    
    try {
        const { data, error } = await supabase
            .from('mood_responses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                    </svg>
                    <h3>Aucune humeur pour le moment</h3>
                    <p>Soyez le premier à partager votre ressenti</p>
                    <a href="index.html" class="btn btn-primary">Partager mon humeur</a>
                </div>
            `;
            return;
        }

        renderMoods(data);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Impossible de charger les humeurs', 'error');
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Erreur de chargement</p>';
    }
}

function renderMoods(moods) {
    const container = document.getElementById('moods-container');
    
    container.innerHTML = moods.map((mood, index) => {
        const energy = getEnergyInfo(mood.energy_level);
        return `
            <div class="mood-card" style="animation-delay: ${index * 0.05}s">
                <div class="mood-content">
                    <p class="mood-text">${escapeHtml(mood.mood_text)}</p>
                    <div class="mood-energy ${energy.color}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect width="18" height="12" x="3" y="8" rx="1"/>
                            <path d="M3 12h-.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H3"/>
                        </svg>
                        <span>${energy.label}</span>
                    </div>
                </div>
                <div class="mood-meta">
                    <span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                        </svg>
                        ${formatDate(mood.created_at)}
                    </span>
                    <span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect width="18" height="12" x="3" y="8" rx="1"/>
                            <path d="M3 12h-.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H3"/>
                        </svg>
                        Niveau ${mood.energy_level}/5
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Subscribe to realtime updates
function subscribeToMoods() {
    const channel = supabase
        .channel('mood_changes')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'mood_responses'
            },
            (payload) => {
                // Recharger toutes les humeurs quand une nouvelle est ajoutée
                loadMoods();
            }
        )
        .subscribe();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}