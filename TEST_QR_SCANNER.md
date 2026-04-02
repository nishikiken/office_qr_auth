# QR Scanner Debug Guide

## Changes Made to Fix Scanner

### 1. Added Library Check
- Added check for `Html5Qrcode` library before instantiation
- Added console logging to track scan events
- Added try-catch blocks for better error handling

### 2. Improved Error Handling
- Better error messages showing actual error details
- Proper scanner cleanup on scan success
- Logs available Html5 objects if library not found

### 3. Scanner Flow
1. Worker opens "Сканировать" tab
2. `checkTodayAuth()` checks if already scanned today
3. If not scanned, calls `startQRScanner()`
4. Scanner starts camera and looks for QR codes
5. When QR found, `onScanSuccess(decodedText)` is called
6. Scanner stops immediately
7. Validates QR starts with "QR_AUTH_"
8. Calls `sendAuthLog()` to save to database
9. Shows success message for rest of day

## Test Scanner Page

**NEW:** Use `test_scanner.html` for isolated testing!

Open `test_scanner.html` in your browser to test the QR scanner independently:
- Shows library loading status
- Displays detailed logs
- Tests camera access
- Verifies QR code format

This helps identify if the issue is with:
- Library loading
- Camera permissions
- QR code format
- Browser compatibility

## Testing Steps

### Test 1: Use Test Scanner Page
1. Open `test_scanner.html` in browser
2. Click "Запустить сканер"
3. Point camera at QR code
4. Check logs for scan results

### Test 2: Check Library Loading
Open browser console (F12) and type:
```javascript
typeof Html5Qrcode
```
Should return: `"function"`

### Test 3: Check Worker Status
```javascript
window.isWorker
```
Should return: `true` for workers

### Test 4: Manual QR Test
Generate a QR code with text: `QR_AUTH_2026-04-02_12345`
Try scanning it with the app

### Test 5: Check Console Logs
When scanning, you should see:
```
QR Scanned: QR_AUTH_2026-04-02_12345
```

## Common Issues

### Issue: Camera doesn't start
- Check browser permissions for camera
- Try HTTPS (required for camera access)
- Check if another app is using camera
- Try test_scanner.html to isolate issue

### Issue: QR not detected
- Ensure good lighting
- Hold phone steady
- QR code should be clear and not too small
- Try different distances from camera
- Test with test_scanner.html first

### Issue: "Html5Qrcode library not loaded"
- Check internet connection
- Verify CDN link in index.html
- Try refreshing page
- Check console for available Html5* objects

### Issue: Scanner starts but nothing happens on scan
- Check console for "QR Scanned:" message
- Verify QR code format starts with "QR_AUTH_"
- Check if worker status is true
- Use test_scanner.html to verify QR is readable

## QR Code Format

Correct format: `QR_AUTH_YYYY-MM-DD_XXXXX`

Example: `QR_AUTH_2026-04-02_12847`

Where:
- `QR_AUTH_` = Required prefix
- `YYYY-MM-DD` = Date (from calendar picker)
- `XXXXX` = 5-digit random ID

## Next Steps

If scanner still doesn't work:
1. Open test_scanner.html in browser
2. Click "Запустить сканер"
3. Try scanning a QR code
4. Check the logs for errors
5. Share the log messages

If test_scanner.html works but main app doesn't:
1. Open main app in browser
2. Open DevTools (F12) → Console tab
3. Try scanning QR code
4. Share any error messages you see
