import { auth, db } from './config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { fetchSystemData } from './duty.js';
import { setUserData, handleAuthAction } from './auth.js';
import { showPage, showAdminPage, showUsersListPage, closeMenu } from './ui.js';

let authMode = 'login';

// Pemantau Kitaran Log Masuk
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
            document.getElementById('admin-nav').classList.add('hidden');
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

// Pautan Butang DOM Event Listeners
document.getElementById('btn-action').onclick = () => handleAuthAction(authMode);

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

// Pengendali Menu Sidebar Navigation
document.getElementById('nav-welcome').onclick = () => { showPage('welcome'); closeMenu(); };
document.getElementById('nav-calendar').onclick = () => { showPage('jadual-induk', new Date().getMonth(), new Date().getFullYear()); closeMenu(); };
document.getElementById('nav-settings').onclick = () => { showPage('settings'); closeMenu(); };
document.getElementById('admin-nav').onclick = () => { showAdminPage(); closeMenu(); };
document.getElementById('admin-users-nav').onclick = () => { showUsersListPage(); closeMenu(); };
document.getElementById('btn-logout').onclick = () => { if(confirm("Log keluar?")) signOut(auth); };

// Live Jam Kemaskini
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

// Isi senarai elemen dropdown platun
const sel = document.getElementById('reg-platoon');
if(sel && sel.options.length <= 1) {
    for(let i=1; i<=25; i++) {
        const o = document.createElement('option'); o.value = i; o.text = "PLATUN " + i; sel.appendChild(o);
    }
}