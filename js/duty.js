import { db, googleCalendarApiKey } from './config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export let JADUAL_2 = {};
export let START_ROW = {};
const cacheCutiGoogle = {};

export async function fetchSystemData() {
    try {
        const snap = await get(ref(db, 'system_data'));
        if (snap.exists()) {
            const data = snap.val();
            JADUAL_2 = data.jadual_2;
            START_ROW = data.start_row;
            return true;
        }
        return false;
    } catch (e) {
        console.error("Ralat memuatkan data sistem:", e);
        return false;
    }
}

export function getDuty(date, platoon) {
    if (Object.keys(JADUAL_2).length === 0 || !START_ROW[platoon]) return { off: true };
    let baseDate = new Date(2026, 0, 3); 
    let targetDate = new Date(date); 
    targetDate.setHours(0,0,0,0);
    let diffDays = Math.floor((targetDate - baseDate) / 86400000);
    if (diffDays < 0) return { off: true };
    let cyclePos = diffDays % 4; 
    if (cyclePos === 3) return { off: true };
    let row = ((START_ROW[platoon] + Math.floor(diffDays/4) - 1) % 24) + 1;
    return { off: false, shift: ["PETANG", "PAGI", "MALAM"][cyclePos], loc: JADUAL_2[row][cyclePos] };
}

export async function dapatkanCutiGoogle(tahun) {
    if (cacheCutiGoogle[tahun]) return cacheCutiGoogle[tahun];

    const calendarId = encodeURIComponent("en.malaysia#holiday@group.v.calendar.google.com");
    const timeMin = new Date(tahun, 0, 1).toISOString();
    const timeMax = new Date(tahun, 11, 31, 23, 59, 59).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${googleCalendarApiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Google Calendar API tidak dapat diakses.");
        
        const data = await response.json();
        let senaraiCuti = {};
        
        data.items.forEach(item => {
            if (item.start && item.start.date) {
                const parts = item.start.date.split('-');
                const hari = parseInt(parts[2]);
                const bulan = parseInt(parts[1]) - 1;
                const kunci = `${hari}-${bulan}`;
                senaraiCuti[kunci] = item.summary;
            }
        });
        
        senaraiCuti['23-2'] = senaraiCuti['23-2'] || "Hari Keputeraan Sultan Johor";
        cacheCutiGoogle[tahun] = senaraiCuti;
        return senaraiCuti;
    } catch (error) {
        console.error("Ralat memuat turun cuti:", error);
        return {};
    }
}
