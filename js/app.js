import { auth, db } from './config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { fetchSystemData } from './duty.js';
import { setUserData, handleAuthAction } from './auth.js';
import { showPage, showAdminPage, showUsersListPage, closeMenu } from './ui.js';

let authMode = 'login';

// ==========================================
// 1. PEMANTAU KITARAN LOG MASUK
// ==========================================
onAuthStateChanged(auth, async (user) => {
    const loading = document.getElementById('loading-overlay');
    try {
        if (user) {
            const dataReady = await fetchSystemData();
            const snap = await get(ref(db, 'users/' + user.uid));
            
            if (snap.exists() && snap.val().status === "approved") {
                const data = snap.val();
                setUserData(data);
                
                document.getElementById('auth-section').classList.add('hidden');
                document.getElementById('main-dashboard').classList.remove('hidden');
                
                if(data.role === 'admin') {
                    document.getElementById('admin-section').classList.remove('hidden');
                    document.getElementById('admin-nav').classList.remove('hidden');
                }
                if (dataReady) showPage('welcome');
            } else {
                alert("Akaun belum diluluskan Admin.");
                await signOut(auth);
            }
        } else {
            document.getElementById('auth-section').classList.remove('hidden');
            document.getElementById('main-dashboard').classList.add('hidden');
            if(document.getElementById('admin-nav')) document.getElementById('admin-nav').classList.add('hidden');
        }
    } catch (error) {
        console.error("Auth Error:", error);
    } finally {
        if (loading) {
            loading.classList.add('fade-out');
            setTimeout(() => { loading.style.display = 'none'; }, 600);
        }
    }
});

// ==========================================
// 2. FUNGSI BUTANG LOG MASUK & DAFTAR
// ==========================================
if(document.getElementById('btn-action')) {
    document.getElementById('btn-action').onclick = () => handleAuthAction(authMode);
}

if(document.getElementById('auth-toggle-btn')) {
    document.getElementById('auth-toggle-btn').onclick = () => {
        const isLogin = authMode === 'login' || authMode === 'forgot';
        if (authMode === 'forgot') {
            authMode = 'login';
            document.getElementById('auth-title').innerText = 'BRAVORIANS';
            document.getElementById('btn-action').innerText = 'Log Masuk';
            document.getElementById('auth-toggle-btn').innerText = 'Daftar Akaun Baru';
            document.getElementById('forgot-fields').classList.add('hidden');
            document.getElementById('login-fields').classList.remove('hidden');
            document.getElementById('forgot-toggle-btn').classList.remove('hidden');
        } else {
            authMode = isLogin ? 'register' : 'login';
            document.getElementById('auth-title').innerText = isLogin ? 'DAFTAR' : 'BRAVORIANS';
            document.getElementById('btn-action').innerText = isLogin ? 'Hantar Pendaftaran' : 'Log Masuk';
            document.getElementById('auth-toggle-btn').innerText = isLogin ? 'Sudah Ada Akaun? Log Masuk' : 'Daftar Akaun Baru';
            document.getElementById('register-fields').classList.toggle('hidden', !isLogin);
            document.getElementById('forgot-toggle-btn').classList.toggle('hidden', isLogin);
        }
    };
}

if(document.getElementById('forgot-toggle-btn')) {
    document.getElementById('forgot-toggle-btn').onclick = () => {
        authMode = 'forgot';
        document.getElementById('auth-title').innerText = 'LUPA KATA LALUAN';
        document.getElementById('btn-action').innerText = 'Hantar Emel Pautan';
        document.getElementById('auth-toggle-btn').innerText = 'Kembali ke Log Masuk';
        document.getElementById('forgot-fields').classList.remove('hidden');
        document.getElementById('login-fields').classList.add('hidden');
        document.getElementById('register-fields').classList.add('hidden');
        document.getElementById('forgot-toggle-btn').classList.add('hidden');
    };
}

// ==========================================
// 3. FUNGSI MENU SISI (SIDEBAR) 
// ==========================================
const sidebar = document.getElementById('mobile-sidebar');
const containerMenu = document.getElementById('sidebar-container');
const menuOpenBtn = document.getElementById('menu-open');
const menuCloseBtn = document.getElementById('menu-close');

window.openMenu = function() { 
    if(sidebar && containerMenu) {
        sidebar.classList.remove('hidden'); 
        setTimeout(() => containerMenu.classList.remove('closed'), 10); 
    }
};

if(menuOpenBtn) menuOpenBtn.onclick = window.openMenu;
if(menuCloseBtn) menuCloseBtn.onclick = closeMenu;
if(sidebar) sidebar.onclick = (e) => { if (e.target === sidebar) closeMenu(); };

// Pautan Menu Navigasi Dinamik
const navMap = {
    'nav-welcome': () => { showPage('welcome'); closeMenu(); },
    'nav-calendar': () => { showPage('jadual-induk', new Date().getMonth(), new Date().getFullYear()); closeMenu(); },
    'nav-settings': () => { showPage('settings'); closeMenu(); },
    'admin-nav': () => { showAdminPage(); closeMenu(); },
    'admin-users-nav': () => { showUsersListPage(); closeMenu(); }
};

for (const [id, func] of Object.entries(navMap)) {
    const el = document.getElementById(id);
    if(el) el.onclick = func;
}

// ==========================================
// 4. FUNGSI LOG KELUAR
// ==========================================
if(document.getElementById('btn-logout')) {
    document.getElementById('btn-logout').onclick = async () => { 
        if(confirm("Log keluar?")) {
            await signOut(auth);
            location.reload(); 
        }
    };
}

// ==========================================
// 5. FUNGSI BUTANG PAPAR KATA LALUAN (MATA)
// ==========================================
const togglePasswordBtn = document.getElementById('toggle-password-btn');
const passwordInput = document.getElementById('password');
const eyePath = document.getElementById('eye-path');

if (togglePasswordBtn && passwordInput && eyePath) {
    togglePasswordBtn.onclick = function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Menukar laluan SVG untuk animasi visual yang tepat
        if (isPassword) {
            eyePath.setAttribute('d', 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21');
            this.classList.replace('text-slate-400', 'text-yellow-500');
        } else {
            eyePath.setAttribute('d', 'M15 12a3 3 0 11-6 0 3 3 0 016 0z');
            this.classList.replace('text-yellow-500', 'text-slate-400');
        }
    };
}

// ==========================================
// 6. LIVE JAM & DROP-DOWN PLATUN
// ==========================================
setInterval(() => {
    const clockEl = document.getElementById('live-clock');
    if(clockEl) {
        const now = new Date();
        const hari = now.toLocaleDateString('ms-MY', { weekday: 'long' }).toUpperCase();
        const tarikh = now.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const masa = now.toLocaleTimeString('ms-MY', { hour12: false });
        clockEl.innerHTML = `<span class="text-black font-black">${hari}</span> <span class="text-yellow-500 mx-1">|</span> <span class="text-slate-400">${tarikh}</span> <span class="text-yellow-500 mx-1">|</span> <span class="text-black font-black">${masa}</span>`;
    }
}, 1000);

const sel = document.getElementById('reg-platoon');
if(sel && sel.options.length <= 1) {
    for(let i=1; i<=25; i++) {
        const o = document.createElement('option'); o.value = i; o.text = "PLATUN " + i; sel.appendChild(o);
    }
}
