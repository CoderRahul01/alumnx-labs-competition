const SHEET_NAME = "Form Responses 1";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    // Clean handle
    const cleanHandle = data.handle.replace(/.*linkedin.com\/in\//, "").replace(/\//g, "").replace("@", "");
    
    sheet.appendRow([
      new Date(),
      data.name,
      cleanHandle,
      data.phone,
      data.role,
      data.program,
      data.postUrl || "" // New column for LinkedIn Promotion Proof
    ]);
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  let csv = "";
  
  for (let i = 0; i < data.length; i++) {
    // Escape commas in names/data to avoid CSV breakage
    const row = data[i].map(val => `"${val.toString().replace(/"/g, '""')}"`);
    csv += row.join(",") + "\n";
  }
  
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.TEXT);
}
