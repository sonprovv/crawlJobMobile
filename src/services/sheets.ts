import { google } from 'googleapis';

const SPREADSHEET_ID = '1CO0PSZ6guTq9eR03u_UkzPIHZr5k_SO5bedqZzPU0d8';
const SHEET_NAME = 'Trang tính1'; // Thay đổi tên sheet nếu cần
const API_KEY = 'AIzaSyBmtMhwV1mzWAsFoFAvSDxaTl4Bf1ENLbE';
const RANGE = `${SHEET_NAME}!A1:D1000`;

export interface SheetRow {
  text: string;
  url: string;
  time: string;
  user: string;
}

export async function getSheetData(): Promise<SheetRow[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );

    if (!response.ok) throw new Error("Failed to fetch data from Google Sheets");

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) return [];

    const headers = rows[0].map(h => h.toLowerCase().trim());

    const textIdx = headers.findIndex(h => h.includes('text'));
    const urlIdx = headers.findIndex(h => h.includes('url'));
    const timeIdx = headers.findIndex(h => h.includes('time'));
    const userIdx = headers.findIndex(h => h.includes('user'));

    return rows.slice(1).map(row => ({
      text: row[textIdx] || '',
      url: row[urlIdx] || '',
      time: row[timeIdx] || '',
      user: row[userIdx] || '',
    }));

  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}
