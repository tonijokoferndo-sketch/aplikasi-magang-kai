const Config = {
  // MAIN spreadsheet contains 'users' and 'attendance' sheets
  MAIN_SHEET_ID: ""1Y5j-LGngFz_iguzjSdOejPNJGSmKV-XzdBtD8x2Bpys"",
  // ADMIN spreadsheet (optional) may contain admin users in its first sheet
  ADMIN_SHEET_ID: ""1Y5j-LGngFz_iguzjSdOejPNJGSmKV-XzdBtD8x2Bpys"",

  getMainSpreadsheet: function() {
    if (!this.MAIN_SHEET_ID) throw new Error('MAIN_SHEET_ID not configured');
    return SpreadsheetApp.openById(this.MAIN_SHEET_ID);
  },

  getAdminSpreadsheet: function() {
    if (!this.ADMIN_SHEET_ID) return null;
    try {
      return SpreadsheetApp.openById(this.ADMIN_SHEET_ID);
    } catch (e) {
      return null;
    }
  },

  getUsersSheet: function() {
    // prefer a sheet named 'users' in the main spreadsheet
    try {
      const main = this.getMainSpreadsheet();
      const users = main.getSheetByName('users');
      if (users) return users;
    } catch (e) {
      // ignore and fallback
    }

    // fallback: try admin spreadsheet first sheet
    const adminSs = this.getAdminSpreadsheet();
    if (adminSs) {
      const sheets = adminSs.getSheets();
      if (sheets && sheets.length > 0) return sheets[0];
    }

    // last resort: return first sheet of main spreadsheet
    const main = this.getMainSpreadsheet();
    const sheets = main.getSheets();
    if (!sheets || sheets.length === 0) throw new Error('No sheets available in main spreadsheet');
    return sheets[0];
  }
};

function getQrLogSheet() {
  const ss = Config.getMainSpreadsheet();
  let sheet = ss.getSheetByName("qr_log");
  if (!sheet) {
    sheet = ss.insertSheet("qr_log");
    sheet.appendRow(["id", "payload", "type", "nim", "date", "start", "end", "created_at", "admin_nim"]);
  }
  return sheet;
}

function getAdminTokensSheet() {
  const ss = Config.getMainSpreadsheet();
  let sheet = ss.getSheetByName("admin_tokens");
  if (!sheet) {
    sheet = ss.insertSheet("admin_tokens");
    sheet.appendRow(["token", "admin_nim", "created_at", "expires_at"]);
  }
  return sheet;
}

function createAdminToken(admin_nim, ttlMinutes) {
  const sheet = getAdminTokensSheet();
  const token = Utilities.getUuid();
  const now = new Date();
  const createdAt = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const expires = new Date(now.getTime() + (ttlMinutes || 120) * 60000);
  const expiresAt = Utilities.formatDate(expires, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([token, admin_nim, createdAt, expiresAt]);
  return { token: token, created_at: createdAt, expires_at: expiresAt };
}

function validateAdminToken(token) {
  if (!token) return null;
  const sheet = getAdminTokensSheet();
  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) return null;
  const now = new Date();
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowToken = String(row[0] || "").trim();
    const adminNim = String(row[1] || "").trim();
    const expiresAt = String(row[3] || "").trim();
    if (rowToken === String(token).trim()) {
      const expiresDate = new Date(expiresAt.replace(/-/g, '/'));
      if (expiresDate.getTime() >= now.getTime()) return adminNim;
      return null;
    }
  }
  return null;
}

function revokeAdminToken(token) {
  if (!token) return false;
  const sheet = getAdminTokensSheet();
  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) return false;
  for (let i = values.length - 1; i >= 1; i--) {
    const row = values[i];
    const rowToken = String(row[0] || "").trim();
    if (rowToken === String(token).trim()) {
      sheet.deleteRow(i + 1); // 1-based index
      return true;
    }
  }
  return false;
}

function getAttendanceSheet() {
  const ss = Config.getMainSpreadsheet();
  let sheet = ss.getSheetByName("attendance");
  if (!sheet) {
    sheet = ss.insertSheet("attendance");
    // match user's sheet layout
    sheet.appendRow(["NIM", "Tanggal", "Jam masuk", "Jam pulang", "QRCode", "Latitude", "Longitude"]);
  }
  return sheet;
}

function findExistingAttendance(sheet, nim, date, type) {
  // legacy function no longer used for type-based checks
  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) return false;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowNim = String(row[0] || "").trim();
    const rowDate = String(row[1] || "").trim();
    if (rowNim === String(nim).trim() && rowDate === date) return true;
  }
  return false;
}

function findAttendanceRowIndex(sheet, nim, date) {
  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) return -1;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowNim = String(row[0] || "").trim();
    const rowDate = String(row[1] || "").trim();
    if (rowNim === String(nim).trim() && rowDate === date) return i + 1; // 1-based index
  }
  return -1;
}

function hasAnyAttendance(sheet, nim, date) {
  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) return false;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowNim = String(row[0] || "").trim();
    const rowDate = String(row[1] || "").trim();
    const jamMasuk = String(row[2] || "").trim();
    const jamPulang = String(row[3] || "").trim();
    if (rowNim === String(nim).trim() && rowDate === date && (jamMasuk || jamPulang)) return true;
  }
  return false;
}

function getAttendanceSummarySheet() {
  const ss = Config.getMainSpreadsheet();
  let sheet = ss.getSheetByName("attendance_summary");
  if (!sheet) {
    sheet = ss.insertSheet("attendance_summary");
    sheet.appendRow(["date", "nim", "nama", "status", "created_at"]);
  }
  return sheet;
}

function getNowInMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function isWithinAttendanceWindow(type) {
  const now = getNowInMinutes();

  if (type === "masuk") {
    return now >= 7 * 60 && now <= 8 * 60;
  }

  if (type === "pulang") {
    return now >= 17 * 60 && now <= 18 * 60;
  }

  return false;
}

function generateId() {
  return 'qr_' + new Date().getTime();
}

const Helper = {
  sendResponse: function(status, message, extra = {}) {
    return {
      status: Boolean(status),
      message: message || "",
      ...extra
    };
  },

  output: function(obj) {
    return ContentService
      .createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  },

  findUser: function(nim, password = null) {
    const usersSheet = Config.getUsersSheet();
    const values = usersSheet.getDataRange().getValues();

    if (values.length < 2) {
      return null;
    }

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowNim = String(row[0] || "").trim().toLowerCase();
      const targetNim = String(nim || "").trim().toLowerCase();

      if (rowNim !== targetNim) {
        continue;
      }

      if (password !== null) {
        const savedPassword = String(row[4] || "").trim();
        if (savedPassword !== String(password)) {
          continue;
        }
      }

      return {
        nim: row[0] || "",
        nama: row[1] || "",
        email: row[2] || "",
        divisi: row[3] || row[5] || "",
        password: row[4] || "",
        role: (row[7] || row[6] || "user")
      };
    }

    return null;
  }
};

const Login = {
  handleLogin: function(payload) {
    const { nim, password } = payload;

    if (!nim || !password) {
      return Helper.sendResponse(false, "NIM dan Password wajib diisi");
    }

    const userData = Helper.findUser(nim, password);

    if (!userData) {
      return Helper.sendResponse(false, "NIM atau password salah");
    }

    return Helper.sendResponse(true, "Login berhasil", {
      user: {
        nim: userData.nim,
        nama: userData.nama,
        email: userData.email,
        divisi: userData.divisi,
        role: userData.role || 'user'
      }
    });
  },

  handleAbsen: function(payload) {
    const { nim, qr, nama, latitude, longitude } = payload;

    if (!nim || !qr) {
      return Helper.sendResponse(false, "Data absensi tidak lengkap");
    }

    const parsed = parseQrPayload(qr);

    if (!parsed || !parsed.type || !parsed.date || !parsed.gid) {
      return Helper.sendResponse(false, "QR absensi tidak valid");
    }

    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    if (parsed.date !== today) {
      return Helper.sendResponse(false, "QR ini untuk tanggal berbeda: " + parsed.date);
    }

    if (!isWithinAttendanceWindow(parsed.type)) {
      const windowText = parsed.type === "masuk"
        ? "07:00 - 08:00"
        : parsed.type === "pulang"
          ? "17:00 - 18:00"
          : "tidak ada";

      return Helper.sendResponse(false, `Waktu absensi ${parsed.type} tidak valid. Buka jam ${windowText}.`);
    }

    try {
      const sheet = getAttendanceSheet();
      const now = new Date();
      const tanggal = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");
      const jam = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss");

      // find existing row for nim + date
      const existingRowIndex = findAttendanceRowIndex(sheet, nim, tanggal);

      if (existingRowIndex > 0) {
        // update existing row: jam masuk -> col 3, jam pulang -> col 4, qr -> col 5, lat col6, long col7
        if (parsed.type === 'masuk') {
          const currentJamMasuk = String(sheet.getRange(existingRowIndex, 3).getValue() || "").trim();
          if (!currentJamMasuk) sheet.getRange(existingRowIndex, 3).setValue(jam);
        } else if (parsed.type === 'pulang') {
          const currentJamPulang = String(sheet.getRange(existingRowIndex, 4).getValue() || "").trim();
          if (!currentJamPulang) sheet.getRange(existingRowIndex, 4).setValue(jam);
        }
        // set QR, lat, long
        sheet.getRange(existingRowIndex, 5).setValue(qr);
        if (latitude) sheet.getRange(existingRowIndex, 6).setValue(latitude);
        if (longitude) sheet.getRange(existingRowIndex, 7).setValue(longitude);

      } else {
        // append new row in schema [NIM, Tanggal, Jam masuk, Jam pulang, QRCode, Latitude, Longitude]
        const jamMasuk = parsed.type === 'masuk' ? jam : "";
        const jamPulang = parsed.type === 'pulang' ? jam : "";
        sheet.appendRow([nim, tanggal, jamMasuk, jamPulang, qr, latitude || "", longitude || ""]);
      }

      return Helper.sendResponse(true, "Absensi berhasil", { message: "Absensi berhasil dicatat" });

    } catch (error) {
      return Helper.sendResponse(false, "Gagal menyimpan absensi: " + error.toString());
    }
  },

  handleGenerateQr: function(payload) {
    const { admin_token, type, nim, date, start, end } = payload;

    const adminNim = validateAdminToken(admin_token);
    if (!adminNim) {
      return Helper.sendResponse(false, "Unauthorized: admin_token tidak valid atau kadaluwarsa");
    }

    if (!type || !date) {
      return Helper.sendResponse(false, "Data generate QR tidak lengkap");
    }

    const id = generateId();
    // group QR (no individual nim) — users will submit their own NIM when scanning
    const payloadText = `KAI_ABSEN|type=${type}|date=${date}|gid=${id}`;

    try {
      const sheet = getQrLogSheet();
      const now = new Date();
      const createdAt = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

      sheet.appendRow([id, payloadText, type, nim || '', date, start || "", end || "", createdAt, adminNim]);

      return Helper.sendResponse(true, "QR generated", { id: id, payload: payloadText });
    } catch (error) {
      return Helper.sendResponse(false, "Gagal generate QR: " + error.toString());
    }
  },

  handleFinalizeAttendance: function(payload) {
    const { admin_token, date } = payload;

    const adminNim = validateAdminToken(admin_token);
    if (!adminNim) {
      return Helper.sendResponse(false, "Unauthorized: admin_token tidak valid atau kadaluwarsa");
    }

    const targetDate = date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    try {
      const usersSheet = Config.getUsersSheet();
      const attendanceSheet = getAttendanceSheet();
      const summarySheet = getAttendanceSummarySheet();

      const users = usersSheet.getDataRange().getValues();
      const now = new Date();
      const createdAt = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

      if (!users || users.length < 2) {
        return Helper.sendResponse(false, "Tidak ada data pengguna di sheet.");
      }

      // Clear existing summary rows for the target date (keep header)
      const allSummary = summarySheet.getDataRange().getValues();
      if (allSummary && allSummary.length > 1) {
        // filter out rows not matching targetDate and rewrite sheet
        const header = allSummary[0];
        const newRows = [header];
        for (let i = 1; i < allSummary.length; i++) {
          const r = allSummary[i];
          if (String(r[0] || "").trim() !== targetDate) {
            newRows.push(r);
          }
        }
        summarySheet.clear();
        summarySheet.getRange(1, 1, newRows.length, newRows[0].length).setValues(newRows);
      }

      let written = 0;

      for (let i = 1; i < users.length; i++) {
        const row = users[i];
        const nim = String(row[0] || "").trim();
        const nama = String(row[1] || "").trim();

        if (!nim) continue;

        const present = hasAnyAttendance(attendanceSheet, nim, targetDate);
        const status = present ? 'Hadir' : 'Tidak Hadir';

        summarySheet.appendRow([targetDate, nim, nama || '', status, createdAt]);
        written++;
      }

      return Helper.sendResponse(true, "Finalize selesai", { written: written });

    } catch (error) {
      return Helper.sendResponse(false, "Gagal finalize: " + error.toString());
    }
  },
  handleGetAttendanceSummary: function(payload) {
    const { admin_token, date } = payload;
    const adminNim = validateAdminToken(admin_token);
    if (!adminNim) return Helper.sendResponse(false, 'Unauthorized: admin_token invalid');

    const targetDate = date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const summarySheet = getAttendanceSummarySheet();
    const values = summarySheet.getDataRange().getValues();
    const rows = [];
    if (values && values.length > 1) {
      for (let i = 1; i < values.length; i++) {
        const r = values[i];
        if (String(r[0] || '').trim() === targetDate) {
          rows.push({ date: r[0], nim: r[1], nama: r[2], status: r[3], created_at: r[4] });
        }
      }
    }
    return Helper.sendResponse(true, 'OK', { rows: rows });
  },
  handleRegister: function(payload) {
    const { nim, password, nama, divisi, role } = payload;

    if (!nim || !password || !nama) {
      return Helper.sendResponse(false, "NIM, Nama, dan Password wajib diisi");
    }

    if (Helper.findUser(nim, null)) {
      return Helper.sendResponse(false, "NIM sudah terdaftar");
    }

    try {
      const usersSheet = Config.getUsersSheet();
      const email = "";
      const tglDaftar = new Date().toLocaleDateString("id-ID");

      usersSheet.appendRow([
        nim,
        nama,
        email,
        divisi || "",
        password,
        divisi || "",
        tglDaftar,
        role || "user"
      ]);

      return Helper.sendResponse(true, "Pendaftaran berhasil", {
        user: {
          nim: nim,
          nama: nama,
          divisi: divisi || "",
          role: role || "user"
        }
      });

    } catch (error) {
      return Helper.sendResponse(false, "Gagal mendaftar: " + error.toString());
    }
  }
};

  // Admin token request handler
Login.handleRequestAdminToken = function(payload) {
  const { admin_nim } = payload;
  if (!admin_nim) return Helper.sendResponse(false, 'admin_nim required');
  const adminUser = Helper.findUser(admin_nim, null);
  if (!adminUser || String(adminUser.role || '').toLowerCase() !== 'admin') {
    return Helper.sendResponse(false, 'Unauthorized: not an admin');
  }
  const tk = createAdminToken(admin_nim, 180); // 3 hours
  return Helper.sendResponse(true, 'Token created', { token: tk.token, expires_at: tk.expires_at });
};

Login.handleRevokeAdminToken = function(payload) {
  const { admin_token } = payload;
  if (!admin_token) return Helper.sendResponse(false, 'admin_token required');
  const adminNim = validateAdminToken(admin_token);
  if (!adminNim) return Helper.sendResponse(false, 'Unauthorized: admin_token invalid');
  const ok = revokeAdminToken(admin_token);
  if (!ok) return Helper.sendResponse(false, 'Failed to revoke token');
  return Helper.sendResponse(true, 'Token revoked');
};

function doPost(e) {
  let payload = {};

  try {
    payload = JSON.parse(e.postData.contents || "{}");
  } catch (error) {
    return Helper.output(
      Helper.sendResponse(false, "Payload tidak valid")
    );
  }

  const action = (payload.action || "").toLowerCase();

  switch (action) {
    case "login":
      return Helper.output(Login.handleLogin(payload));

    case "register":
      return Helper.output(Login.handleRegister(payload));

    case "absen":
      return Helper.output(Login.handleAbsen(payload));

    case "generate_qr":
        return Helper.output(Login.handleGenerateQr(payload));

      case "request_admin_token":
        return Helper.output(Login.handleRequestAdminToken(payload));

      case "get_attendance_summary":
        return Helper.output(Login.handleGetAttendanceSummary(payload));

      case "finalize_attendance":
        return Helper.output(Login.handleFinalizeAttendance(payload));
    
        case "revoke_admin_token":
          return Helper.output(Login.handleRevokeAdminToken(payload));

    default:
      return Helper.output(
        Helper.sendResponse(false, "Aksi tidak valid")
      );
  }
}

function parseQrPayload(qrCode) {
  if (!qrCode || typeof qrCode !== "string") {
    return null;
  }

  const parts = String(qrCode).trim().split("|");

  if (!parts || parts.length === 0 || parts[0] !== "KAI_ABSEN") {
    return null;
  }

  const parsed = {
    type: "",
    nim: "",
    date: "",
    gid: "",
    valid: false
  };

  for (const part of parts) {
    if (part.includes("=")) {
      const [key, value] = part.split("=");
      if (key === "type") {
        parsed.type = String(value).toLowerCase();
      }
      if (key === "nim") {
        parsed.nim = String(value);
      }
      if (key === "date") {
        parsed.date = String(value);
      }
      if (key === "gid") {
        parsed.gid = String(value);
      }
    }
  }

  // valid if has type and date; nim may come from user input when using group QR
  parsed.valid = Boolean(parsed.type && parsed.date);

  return parsed;
}
