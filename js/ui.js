import { auth, db } from './config.js';
import { getDuty, dapatkanCutiGoogle } from './duty.js';
import { userData } from './auth.js';
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let currentEditingData = null;

export function closeMenu() {
    document.getElementById('sidebar-container').classList.add('closed');
    setTimeout(() => document.getElementById('mobile-sidebar').classList.add('hidden'), 300);
}

export async function showPage(p, targetMonth = new Date().getMonth(), targetYear = new Date().getFullYear()) {
    const cont = document.getElementById('dynamic-content');
    
    if (p === 'welcome') {
        const tkhHariIni = new Date();
        const dtyHariIni = getDuty(tkhHariIni, userData.platoon);
        const htmlHariIni = `
            <div class="bg-white rounded-[3rem] border border-slate-100 shadow-xl w-full max-w-md overflow-hidden mb-6">
                <div class="bg-black py-4"><p class="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em]">Jadual Hari Ini</p></div>
                <div class="flex justify-between items-center p-6">
                    <div class="text-left">
                        <p class="text-[12px] font-black text-black uppercase tracking-tighter">HARI INI</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${tkhHariIni.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div class="text-right">
                        ${dtyHariIni.off ? `<p class="text-sm font-black text-slate-300 uppercase italic">OFF</p>` : `<p class="text-[13px] font-black text-black uppercase leading-none">${dtyHariIni.shift}</p><p class="text-[10px] font-extrabold text-yellow-500 uppercase mt-1 tracking-tighter leading-none">${dtyHariIni.loc}</p>`}
                    </div>
                </div>
            </div>`;

        let htmlList = '';
        for (let i = 1; i <= 3; i++) {
            const tkh = new Date(); tkh.setDate(tkh.getDate() + i);
            const dty = getDuty(tkh, userData.platoon);
            htmlList += `
                <div class="flex justify-between items-center p-6 ${i < 3 ? 'border-b border-slate-50' : ''}">
                    <div class="text-left">
                        <p class="text-[12px] font-black text-black uppercase tracking-tighter">${tkh.toLocaleDateString('ms-MY', { weekday: 'long' }).toUpperCase()}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${tkh.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div class="text-right">
                        ${dty.off ? `<p class="text-sm font-black text-slate-300 uppercase italic">OFF</p>` : `<p class="text-[13px] font-black text-black uppercase leading-none">${dty.shift}</p><p class="text-[10px] font-extrabold text-yellow-500 uppercase mt-1 tracking-tighter leading-none">${dty.loc}</p>`}
                    </div>
                </div>`;
        }
        cont.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div class="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl relative">
                    <div class="absolute inset-0 border-4 border-yellow-400 rounded-[2.5rem] animate-pulse"></div>
                    <svg class="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                </div>
                <h1 class="text-3xl font-black text-black uppercase italic tracking-tighter mb-2">SELAMAT DATANG</h1>
                <div class="mb-10">
                    <p class="text-[14px] font-black text-slate-800 uppercase tracking-widest">${userData.fullName}</p>
                    <span class="inline-block mt-2 px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black rounded-full uppercase tracking-widest">PLATUN ${userData.platoon}</span>
                </div>
                ${htmlHariIni}
                <div class="bg-white rounded-[3rem] border border-slate-100 shadow-xl w-full max-w-md overflow-hidden">
                    <div class="bg-black py-4"><p class="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em]">Jadual Akan Datang</p></div>
                    ${htmlList}
                </div>
            </div>`;
    } 
    
    else if (p === 'jadual-induk') {
        const months = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"];
        const skrg = new Date();
        const tahunSemasa = skrg.getFullYear();
        const years = [tahunSemasa, tahunSemasa + 1, tahunSemasa + 2, tahunSemasa + 3];

        const notesSnap = await get(ref(db, `notes/${auth.currentUser.uid}/${targetYear}/${targetMonth}`));
        const userNotes = notesSnap.exists() ? notesSnap.val() : {};
        const cutiGoogle = await dapatkanCutiGoogle(targetYear);

        let html = `
            <div class="bg-white p-5 rounded-[2.5rem] mb-6 shadow-sm border border-slate-100 grid grid-cols-2 gap-4">
                <select id="year-select" class="w-full p-4 bg-slate-50 border-none rounded-2xl text-[12px] font-black uppercase outline-none focus:ring-2 focus:ring-yellow-400">
                    ${years.map(y => `<option value="${y}" ${y == targetYear ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
                <select id="month-select" class="w-full p-4 bg-slate-50 border-none rounded-2xl text-[12px] font-black uppercase outline-none focus:ring-2 focus:ring-yellow-400">
                    ${months.map((m, i) => `<option value="${i}" ${i == targetMonth ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">`;
        
        const daysInMonth = new Date(targetYear, parseInt(targetMonth) + 1, 0).getDate();
        
        for(let i=1; i<=daysInMonth; i++){
            let d = new Date(targetYear, targetMonth, i);
            let r = getDuty(d, userData.platoon);
            const adakahHariIni = (i === skrg.getDate() && targetMonth == skrg.getMonth() && targetYear == skrg.getFullYear());
            const teksNota = userNotes[i] || "";
            const kunciCuti = `${i}-${targetMonth}`;
            const namaCuti = cutiGoogle[kunciCuti] || "";

            html += `
                <div onclick="bukaModal(${i}, ${targetMonth}, ${targetYear}, \`${teksNota.replace(/"/g, '&quot;')}\`)" 
                     class="relative p-5 rounded-[2rem] border flex flex-col min-h-[130px] active:scale-95 transition-all cursor-pointer overflow-hidden ${r.off ? 'bg-slate-50' : 'bg-white shadow-sm'} ${adakahHariIni ? 'ring-4 ring-yellow-400 z-10 scale-[1.02]' : 'border-slate-100'}">
                    ${adakahHariIni ? `<div class="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-400 px-3 py-1 rounded-b-xl z-20 animate-bounce"><p class="text-[7px] font-black text-black leading-none">HARI INI</p></div>` : ''}
                    <div class="flex justify-between items-start mb-1 relative z-10">
                        <div>
                            <p class="text-[10px] font-black ${adakahHariIni ? 'text-black' : 'text-slate-400'} uppercase">${d.toLocaleDateString('ms-MY',{weekday:'short', day:'2-digit'})}</p>
                            ${namaCuti ? `<p class="text-[7px] font-extrabold text-red-500 uppercase leading-tight mt-0.5">${namaCuti}</p>` : ''}
                        </div>
                        <div class="p-1">${teksNota ? '<span class="flex h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></span>' : `<svg class="w-3 h-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`}</div>
                    </div>
                    <div class="relative z-10 mt-auto">
                        <p class="text-[12px] font-black ${adakahHariIni ? 'text-black' : 'text-slate-700'} uppercase">${r.off ? 'OFF' : r.shift}</p>
                        <p class="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">${r.off ? '' : r.loc}</p>
                    </div>
                    ${teksNota ? `<div class="mt-2 pt-2 border-t border-dashed border-slate-100 note-preview relative z-10"><p class="text-[9px] font-bold text-slate-400 italic line-clamp-2 leading-tight">${teksNota}</p></div>` : ''}
                </div>`;
        }
        cont.innerHTML = html + '</div>';

        document.getElementById('month-select').onchange = (e) => showPage('jadual-induk', e.target.value, document.getElementById('year-select').value);
        document.getElementById('year-select').onchange = (e) => showPage('jadual-induk', document.getElementById('month-select').value, e.target.value);
    } 
    
    else if (p === 'settings') {
        cont.innerHTML = `
            <div class="space-y-6 animate-fadeIn pb-10">
                <div class="px-2">
                    <h2 class="text-2xl font-black text-black uppercase italic tracking-tighter">Tetapan Profil</h2>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kemaskini maklumat akaun anda</p>
                </div>
                <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-yellow-100 rounded-lg text-yellow-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                        <p class="text-[11px] font-black text-black uppercase tracking-widest">Maklumat Diri</p>
                    </div>
                    <div class="space-y-3">
                        <div class="flex gap-2">
                            <input type="text" id="set-fn" value="${userData.firstName || ''}" placeholder="FIRST NAME" class="w-1/2 p-4 bg-slate-50 rounded-2xl text-[12px] font-bold uppercase outline-none focus:ring-2 focus:ring-yellow-400 border-none">
                            <input type="text" id="set-ln" value="${userData.lastName || ''}" placeholder="LAST NAME" class="w-1/2 p-4 bg-slate-50 rounded-2xl text-[12px] font-bold uppercase outline-none focus:ring-2 focus:ring-yellow-400 border-none">
                        </div>
                        <button onclick="updateProfileName()" class="w-full bg-black text-yellow-400 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Kemaskini Nama</button>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-green-100 text-green-600 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
                        <p class="text-[11px] font-black text-black uppercase tracking-widest">Tukar Platun</p>
                    </div>
                    <select id="set-platoon" class="w-full p-4 bg-slate-50 rounded-2xl text-[12px] font-bold mb-4 outline-none focus:ring-2 focus:ring-yellow-400 uppercase border-none appearance-none">
                        ${Array.from({length: 25}, (_, i) => `<option value="${i+1}" ${userData.platoon == i+1 ? 'selected' : ''}>PLATUN ${i+1}</option>`).join('')}
                    </select>
                    <button onclick="updateUserPlatoon()" class="w-full bg-black text-yellow-400 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Kemaskini Platun</button>
                </div>
                <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 border-b-8 border-b-yellow-400">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-red-100 text-red-600 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                        <p class="text-[11px] font-black text-black uppercase tracking-widest">Keselamatan Akaun</p>
                    </div>
                    <div class="space-y-3">
                        <div class="relative">
                            <input type="password" id="old-password" placeholder="KATA LALUAN ASAL" class="w-full p-4 bg-slate-50 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-yellow-400 border-none">
                            <button type="button" onclick="togglePass('old-password', this)" class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button>
                        </div>
                        <div class="relative">
                            <input type="password" id="new-password" placeholder="KATA LALUAN BARU" class="w-full p-4 bg-slate-50 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-yellow-400 border-none">
                            <button type="button" onclick="togglePass('new-password', this)" class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button>
                        </div>
                    </div>
                    <button onclick="updateUserPassword()" class="w-full bg-black text-yellow-400 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest mt-4 active:scale-95 transition-all">Kemaskini Kata Laluan</button>
                </div>
            </div>`;
    }
    closeMenu();
}

export function showAdminPage() {
    document.getElementById('dynamic-content').innerHTML = `
        <div class="space-y-6 pb-20">
            <div class="flex items-center gap-3 px-2 mb-2">
                <div class="p-2 bg-yellow-400 rounded-xl text-black"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
                <div><h2 class="text-xl font-black text-black uppercase tracking-tight">Permohonan Baru</h2><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Senarai Permohonan Baru</p></div>
            </div>
            <div id="pending-users-list" class="space-y-1"></div>
        </div>`;
    monitorPendingUsers();
}

export function monitorPendingUsers() {
    onValue(ref(db, 'users'), (snap) => {
        const pendingContainer = document.getElementById('pending-users-list');
        const approvedContainer = document.getElementById('approved-users-list');
        const searchInput = document.getElementById('admin-search'); 
        const badge = document.getElementById('pending-count');
        
        let allUsers = [];
        snap.forEach(child => { allUsers.push({ id: child.key, ...child.val() }); });

        const renderLists = (filterText = "") => {
            if (pendingContainer) pendingContainer.innerHTML = '';
            if (approvedContainer) approvedContainer.innerHTML = '';
            let pendingCount = 0;

            allUsers.forEach(u => {
                const fullName = `${u.firstName || u.fullName || ''} ${u.lastName || ''}`.trim().toUpperCase();
                if (u.status === 'pending') {
                    pendingCount++;
                    if (pendingContainer) {
                        const div = document.createElement('div');
                        div.className = "p-6 bg-white rounded-[2.5rem] flex flex-col gap-4 border border-slate-100 shadow-sm mb-3 mx-2";
                        div.innerHTML = `
                            <div><p class="text-[13px] font-black uppercase text-black">${fullName}</p><p class="text-[10px] font-bold text-yellow-600 uppercase tracking-tighter">Platun ${u.platoon} • ${u.email}</p></div>
                            <div class="grid grid-cols-2 gap-2">
                                <button onclick="handleUserAction('${u.id}', 'cancel', '${fullName}')" class="bg-red-50 text-red-500 py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all">Batalkan</button>
                                <button onclick="handleUserAction('${u.id}', 'approve', '${fullName}')" class="bg-black text-yellow-400 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">Luluskan</button>
                            </div>`;
                        pendingContainer.appendChild(div);
                    }
                } else if (u.status === 'approved' && u.role !== 'admin') {
                    const matchesSearch = fullName.includes(filterText.toUpperCase());
                    if (approvedContainer && matchesSearch) {
                        const div = document.createElement('div');
                        div.className = "p-5 bg-white rounded-[2rem] flex justify-between items-center border border-slate-100 mb-2 mx-2 shadow-sm";
                        div.innerHTML = `
                            <div><p class="text-[11px] font-black uppercase text-slate-700">${fullName}</p><p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Platun ${u.platoon} • <span class="text-green-500 font-extrabold tracking-widest">AKTIF</span></p></div>
                            <button onclick="handleUserAction('${u.id}', 'delete', '${fullName}')" class="p-2 text-slate-300 hover:text-red-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;
                        approvedContainer.appendChild(div);
                    }
                }
            });

            if (badge) { badge.innerText = pendingCount; badge.classList.toggle('hidden', pendingCount === 0); }
            if (pendingContainer && pendingCount === 0) pendingContainer.innerHTML = `<div class="py-10 text-center"><p class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Tiada permohonan baru</p></div>`;
            if (approvedContainer && approvedContainer.innerHTML === '' && filterText !== "") approvedContainer.innerHTML = `<div class="py-10 text-center"><p class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nama tidak ditemui</p></div>`;
        };

        renderLists(searchInput ? searchInput.value : "");
        if (searchInput) searchInput.oninput = (e) => renderLists(e.target.value);
    });
}

export function showUsersListPage() {
    document.getElementById('dynamic-content').innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center gap-3 px-2 mb-2">
                <div class="p-2 bg-black rounded-xl text-yellow-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                <div><h2 class="text-xl font-black text-black uppercase">Senarai Pengguna</h2></div>
            </div>
            <div class="px-2"><input type="text" id="admin-search" placeholder="CARI NAMA PEGAWAI..." class="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm uppercase"></div>
            <div id="approved-users-list" class="space-y-1"><div class="flex justify-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div></div>
        </div>`;

    onValue(ref(db, 'users'), (snap) => {
        const listCont = document.getElementById('approved-users-list');
        const searchInput = document.getElementById('admin-search');
        if (!listCont) return;

        const render = (filter = "") => {
            listCont.innerHTML = '';
            snap.forEach(child => {
                const u = child.val();
                const uid = child.key;
                const fullName = `${u.firstName || u.fullName || ''} ${u.lastName || ''}`.trim().toUpperCase();

                if (u.status === 'approved' && u.role !== 'admin') {
                    if (filter === "" || fullName.includes(filter.toUpperCase())) {
                        const div = document.createElement('div');
                        div.className = "p-5 bg-white rounded-[2rem] flex justify-between items-center border border-slate-100 mb-2 mx-2 shadow-sm";
                        div.innerHTML = `
                            <div><p class="text-[11px] font-black uppercase text-slate-700">${fullName}</p><p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Platun ${u.platoon} • <span class="text-green-500">AKTIF</span></p></div>
                            <button onclick="deleteUser('${uid}', '${fullName}')" class="p-2 text-slate-300 hover:text-red-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;
                        listCont.appendChild(div);
                    }
                }
            });
        };
        render(searchInput.value);
        searchInput.oninput = (e) => render(e.target.value);
    });
}

// Global hooks untuk Admin Actions
window.handleUserAction = async (uid, action, name) => {
    let confirmMsg = action === 'approve' ? `Luluskan permohonan ${name}?` : action === 'cancel' ? `Batal permohonan ${name}?` : `Padam akses untuk ${name}?`;
    if (!confirm(confirmMsg)) return;

    try {
        if (action === 'approve') {
            await update(ref(db, 'users/' + uid), { status: 'approved' });
            showToast("PENGGUNA DILULUSKAN");
        } else {
            await set(ref(db, 'users/' + uid), null);
            showToast(action === 'cancel' ? "PERMOHONAN DIPADAM" : "PENGGUNA DIPADAM");
        }
    } catch (e) { alert("Ralat sistem: " + e.message); }
};

window.deleteUser = async (uid, name) => {
    if (!confirm(`Padam akses untuk ${name}? Tindakan ini tidak boleh diundur.`)) return;
    try {
        await set(ref(db, 'users/' + uid), null);
        showToast("PENGGUNA TELAH DIPADAM");
    } catch (e) { alert("Ralat: " + e.message); }
};

window.bukaModal = function(hari, bulan, tahun, teks) {
    currentEditingData = { hari, bulan, tahun };
    document.getElementById('modal-title').innerText = `NOTA: ${hari}/${parseInt(bulan) + 1}/${tahun}`;
    document.getElementById('note-input').value = teks;
    document.getElementById('note-modal').classList.remove('hidden');
    document.getElementById('note-input').focus();
};

window.tutupModal = function() { document.getElementById('note-modal').classList.add('hidden'); };

document.getElementById('btn-save-note').onclick = async () => {
    const teks = document.getElementById('note-input').value.trim();
    if (!currentEditingData) return;
    await set(ref(db, `notes/${auth.currentUser.uid}/${currentEditingData.tahun}/${currentEditingData.bulan}/${currentEditingData.hari}`), teks || null);
    tutupModal();
    showPage('jadual-induk', currentEditingData.bulan, currentEditingData.tahun);
};

document.getElementById('btn-delete-note').onclick = async () => {
    if (!currentEditingData || !confirm("Hapus nota ini?")) return;
    await set(ref(db, `notes/${auth.currentUser.uid}/${currentEditingData.tahun}/${currentEditingData.bulan}/${currentEditingData.hari}`), null);
    tutupModal();
    showPage('jadual-induk', currentEditingData.bulan, currentEditingData.tahun);
};

window.togglePass = (id, btn) => {
    const input = document.getElementById(id);
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.classList.toggle('text-yellow-500', isPass);
    btn.classList.toggle('text-slate-400', !isPass);
};

export function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3000);
}
