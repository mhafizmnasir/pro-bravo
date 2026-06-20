import { auth, db } from './config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail, 
    EmailAuthProvider, 
    reauthenticateWithCredential, 
    updatePassword as firebaseUpdatePassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { showToast } from './ui.js';

export let userData = null;
export function setUserData(data) { userData = data; }

export async function handleAuthAction(authMode) {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    const forgotEmail = document.getElementById('forgot-email').value.trim();

    try {
        if (authMode === 'forgot') {
            if (!forgotEmail) return alert("Sila masukkan emel anda!");
            await sendPasswordResetEmail(auth, forgotEmail);
            alert("Pautan tetapan semula kata laluan telah dihantar ke emel anda.");
            location.reload();
        } else if (authMode === 'register') {
            const fn = document.getElementById('reg-firstname').value.trim().toUpperCase();
            const ln = document.getElementById('reg-lastname').value.trim().toUpperCase();
            const plt = document.getElementById('reg-platoon').value;

            if (!fn || !plt || !email || !pass) return alert("Lengkapkan maklumat pendaftaran!");

            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await set(ref(db, 'users/' + res.user.uid), {
                firstName: fn,
                lastName: ln,
                fullName: fn + " " + ln,
                platoon: parseInt(plt),
                role: "user",
                status: "pending"
            });
            alert("Pendaftaran berjaya! Sila tunggu kelulusan admin.");
            await signOut(auth);
            location.reload(); 
        } else {
            if (!email || !pass) return alert("Sila isi emel dan kata laluan!");
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (e) {
        console.error(e);
        let errorMsg = "RALAT SISTEM. SILA CUBA LAGI.";
        if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
            errorMsg = "EMEL ATAU KATA LALUAN SALAH";
        } else if (e.code === 'auth/invalid-email') {
            errorMsg = "FORMAT EMEL TIDAK SAH";
        } else if (e.code === 'auth/too-many-requests') {
            errorMsg = "TERLALU BANYAK PERCUBAAN. SILA TUNGGU SEBENTAR.";
        }
        showToast(errorMsg);
    }
}

// Dedikasikan fungsi pengemaskinian profil ke skop Window (supaya butang onclick HTML berfungsi)
window.updateProfileName = async () => {
    const fn = document.getElementById('set-fn').value.trim().toUpperCase();
    const ln = document.getElementById('set-ln').value.trim().toUpperCase();
    if(!fn) return alert("Nama Pertama wajib diisi.");

    try {
        const newFullName = ln ? `${fn} ${ln}` : fn;
        await update(ref(db, `users/${auth.currentUser.uid}`), { firstName: fn, lastName: ln, fullName: newFullName });
        userData.firstName = fn; userData.lastName = ln; userData.fullName = newFullName;
        showToast("NAMA BERJAYA DIKEMASKINI");
    } catch (e) { alert("Ralat: " + e.message); }
};

window.updateUserPlatoon = async () => {
    const newPlt = document.getElementById('set-platoon').value;
    if(confirm(`Adakah anda pasti mahu menukar ke PLATUN ${newPlt}? Jadual tugas anda akan berubah.`)) {
        try {
            await update(ref(db, `users/${auth.currentUser.uid}`), { platoon: parseInt(newPlt) });
            userData.platoon = parseInt(newPlt);
            showToast("PLATUN BERJAYA DITUKAR");
            setTimeout(() => location.reload(), 1500);
        } catch (e) { alert("Ralat: " + e.message); }
    }
};

window.updateUserPassword = async () => {
    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    if (!oldPass) return alert("Sila masukkan kata laluan asal anda.");
    if (!newPass || newPass.length < 6) return alert("Kata laluan baru mestilah sekurang-kurangnya 6 aksara.");

    if (confirm("Adakah anda pasti mahu menukar kata laluan?")) {
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await firebaseUpdatePassword(auth.currentUser, newPass); 
            document.getElementById('old-password').value = "";
            document.getElementById('new-password').value = ""; 
            showToast("KATA LALUAN BERJAYA DITUKAR");
        } catch (e) {
            alert(e.code === 'auth/wrong-password' ? "Kata laluan asal tidak sah." : "Ralat: " + e.message);
        }
    }
};
