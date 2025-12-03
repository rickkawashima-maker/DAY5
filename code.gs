// Google Apps Script Code
// このコードをGASプロジェクトにコピー&ペーストしてください

// Configuration
const LINE_ACCESS_TOKEN = 'WXj/oo03mx57/PmyPd1SBgHtbYiVjuVBXFMZ2j6A3I7mbqrExqWpB4/RRV1b6VUkeUgqA8MV+otTebTk5suCJEWMifIloo6Qc5tddZDbngbEdrC/Z3vnHhKrjvE4+l1Uj5HnvmpDzsrE4vbImkgLBwdB04t89/1O/w1cDnyilFU=';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // スプレッドシートIDに置き換えてください

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const userId = data.userId;
    const userName = data.userName;
    const timestamp = new Date(data.timestamp);
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    let message = '';
    
    if (action === 'clock_in') {
      handleClockIn(ss, userId, userName, timestamp);
      message = `【出勤】\n${userName}\n${formatDate(timestamp)}`;
    } else if (action === 'clock_out') {
      const workTime = handleClockOut(ss, userId, userName, timestamp);
      message = `【退勤】\n${userName}\n出勤：${workTime.startTime}\n退勤：${workTime.endTime}\n勤務：${workTime.duration}`;
    } else if (action === 'task_complete') {
      handleTaskComplete(ss, userId, userName, timestamp);
      const appUrl = 'https://rickkawashima-maker.github.io/DAY5/';
      message = `【🎉課題完了報告🎉】\n研修生：${userName}（${userId}）\n完了：${formatDate(timestamp)}\n\nアプリURL:\n${appUrl}\n\n確認をお願いします！`;
    }
    
    // Send LINE Notification
    sendLineNotification(message);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Processed' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleClockIn(ss, userId, userName, timestamp) {
  const sheet = ss.getSheetByName('打刻記録');
  sheet.appendRow([
    formatDateOnly(timestamp),
    userId,
    userName,
    formatTime(timestamp),
    '',
    ''
  ]);
}

function handleClockOut(ss, userId, userName, timestamp) {
  const sheet = ss.getSheetByName('打刻記録');
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][1] === userId && data[i][4] === '') {
      const rowIndex = i + 2;
      const startTimeStr = data[i][3];
      const endTimeStr = formatTime(timestamp);
      const duration = calculateDuration(startTimeStr, endTimeStr);
      
      sheet.getRange(rowIndex, 5).setValue(endTimeStr);
      sheet.getRange(rowIndex, 6).setValue(duration);
      
      return {
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: duration
      };
    }
  }
  return { startTime: '不明', endTime: formatTime(timestamp), duration: '不明' };
}

function handleTaskComplete(ss, userId, userName, timestamp) {
  const sheet = ss.getSheetByName('課題完了記録');
  const appUrl = 'https://rickkawashima-maker.github.io/DAY5/';
  sheet.appendRow([
    formatDate(timestamp),
    userId,
    userName,
    appUrl,
    ''
  ]);
}

function sendLineNotification(message) {
  const url = 'https://api.line.me/v2/bot/message/broadcast';
  
  const payload = {
    messages: [
      {
        type: 'text',
        text: message
      }
    ]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}

// Helpers
function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
}

function formatDateOnly(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd');
}

function formatTime(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'HH:mm');
}

function calculateDuration(startStr, endStr) {
  if (!startStr || !endStr) return '';
  
  const startParts = startStr.split(':');
  const endParts = endStr.split(':');
  
  const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  
  let diff = endMin - startMin;
  if (diff < 0) diff += 24 * 60;
  
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  
  return `${hours}時間${mins}分`;
}
