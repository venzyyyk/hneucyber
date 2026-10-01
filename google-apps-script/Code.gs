/**
 * KHNUE Cyber — приймач заявок у Google Sheets + API для адмінки.
 *
 * 1. Створи таблицю → Розширення → Apps Script → встав цей файл.
 * 2. Project Settings → Script properties → додай SECRET (будь-який довгий рядок,
 *    той самий, що в SHEETS_WEBHOOK_SECRET на сайті).
 * 3. Deploy → New deployment → Web app:
 *      Execute as: Me
 *      Who has access: Anyone
 *    Скопіюй URL (…/exec) у SHEETS_WEBHOOK_URL.
 * 4. Після кожної зміни коду — Deploy → Manage deployments → Edit → Version: New version.
 *
 * Дії (поле action у JSON):
 *   append — додати рядки заявки (за замовчуванням)
 *   list   — віддати всі рядки (для адмінки)
 *   delete — видалити всі рядки з вказаними ID заявок
 */

var SHEET_NAME = 'Заявки';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || data.secret !== secret) return json_({ ok: false, error: 'unauthorized' });

    var action = data.action || 'append';
    if (action === 'append') return append_(data);
    if (action === 'list') return list_();
    if (action === 'delete') return delete_(data.ids || []);
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'khnue-cyber-registrations' });
}

function append_(data) {
  if (!data.rows || !data.rows.length) return json_({ ok: false, error: 'no rows' });
  return withLock_(function () {
    var sheet = getSheet_(data.headers);
    var rows = data.rows.map(function (row) { return row.map(safeCell_); });
    var range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length);
    range.setNumberFormat('@'); // все як текст: групи типу 6.04.121 не стануть датами
    range.setValues(rows);
    return json_({ ok: true });
  });
}

function list_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return json_({ ok: true, rows: [] });
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  return json_({ ok: true, rows: values });
}

function delete_(ids) {
  if (!ids.length) return json_({ ok: false, error: 'no ids' });
  return withLock_(function () {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return json_({ ok: true, deleted: 0 });
    var idColumn = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues();
    var deleted = 0;
    // знизу вгору, щоб не зсувались індекси
    for (var i = idColumn.length - 1; i >= 0; i--) {
      if (ids.indexOf(idColumn[i][0]) !== -1) {
        sheet.deleteRow(i + 2);
        deleted++;
      }
    }
    return json_({ ok: true, deleted: deleted });
  });
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function getSheet_(headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0 && headers && headers.length) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1a1625')
      .setFontColor('#e9e1ff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Захист від formula injection поверх текстового формату: рядок з "=" на початку екрануємо. */
function safeCell_(value) {
  var v = value == null ? '' : String(value);
  return v.charAt(0) === '=' ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
