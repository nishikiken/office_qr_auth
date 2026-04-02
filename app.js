// Supabase Configuration (используем существующий проект)
const SUPABASE_URL = 'https://hyxyablgkjtoxcxnurkk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U';

// Инициализация Supabase после загрузки библиотеки
let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase library not loaded!');
}

// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1c1c1e');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#8e8e93');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0a84ff');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#2c2c2e');
}

let currentUser = null;
let html5QrCode = null;
let currentFilter = 'week';

// Debug Console
const debugLogs = [];

function debugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    debugLogs.push({ timestamp, message, type });
    console.log(`[${type}] ${message}`);
}

function toggleDebugConsole() {
    const consoleEl = document.getElementById('debug-console');
    if (consoleEl.style.display === 'none' || !consoleEl.style.display) {
        consoleEl.style.display = 'flex';
        renderDebugLogs();
    } else {
        consoleEl.style.display = 'none';
    }
}

function renderDebugLogs() {
    const debugContent = document.getElementById('debug-content');
    debugContent.innerHTML = '';
    debugLogs.forEach(log => {
        const logEl = document.createElement('div');
        logEl.className = `debug-log ${log.type}`;
        logEl.innerHTML = `<span class="debug-log-time">${log.timestamp}</span>${log.message}`;
        debugContent.appendChild(logEl);
    });
    debugContent.scrollTop = debugContent.scrollHeight;
}

debugLog('QR Auth App loaded', 'info');

// Инициализация приложения
async function init() {
    debugLog('Initializing app...', 'info');
    
    let user;
    
    // Проверяем наличие Telegram WebApp
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        debugLog('No Telegram data, using TEST USER', 'warn');
        
        // Создаем тестового пользователя для проверки с ПК
        // Проверяем URL параметр для выбора роли
        const urlParams = new URLSearchParams(window.location.search);
        const testMode = urlParams.get('test');
        
        if (testMode === 'admin') {
            user = {
                id: 999999999,
                first_name: 'Админ',
                last_name: 'Тестовый',
                username: 'test_admin',
                photo_url: null
            };
            debugLog('TEST MODE: Admin user', 'warn');
        } else {
            user = {
                id: 123456789,
                first_name: 'Тестовый',
                last_name: 'Пользователь',
                username: 'test_user',
                photo_url: null
            };
            debugLog('TEST MODE: Regular user (add ?test=admin for admin)', 'warn');
        }
    } else {
        user = tg.initDataUnsafe.user;
        debugLog('User: ' + user.first_name + ' (ID: ' + user.id + ')', 'info');
    }

    currentUser = user;
    
    // Обновляем UI
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Пользователь';
    document.getElementById('userName').textContent = fullName;
    
    // Аватар
    const avatarEl = document.getElementById('userAvatar');
    if (user.photo_url) {
        avatarEl.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
    }

    // Регистрируем/обновляем пользователя в БД
    await registerUser(user);

    // Проверяем, является ли пользователь админом
    const isAdmin = await checkAdmin(user.id);

    if (isAdmin) {
        showAdminPanel();
    } else {
        showUserScreen();
    }
}

// Регистрация пользователя
async function registerUser(user) {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Пользователь';
    
    const { error } = await supabase
        .from('qr_auth_users')
        .upsert({
            telegram_id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: fullName
        }, {
            onConflict: 'telegram_id'
        });

    if (error) {
        console.error('Ошибка регистрации:', error);
        debugLog('Registration error: ' + error.message, 'error');
    }
}

// Проверка админа
async function checkAdmin(telegramId) {
    const { data, error } = await supabase
        .from('qr_auth_users')
        .select('is_admin, is_worker')
        .eq('telegram_id', telegramId)
        .single();

    if (error) {
        console.error('Ошибка проверки админа:', error);
        debugLog('Admin check error: ' + error.message, 'error');
        return false;
    }

    // Сохраняем статус работника глобально
    window.isWorker = data?.is_worker || false;
    debugLog('Worker status: ' + window.isWorker, 'info');

    return data?.is_admin || false;
}

// Показать экран пользователя
function showUserScreen() {
    debugLog('Showing user screen', 'info');
    document.getElementById('userRole').textContent = 'Пользователь';
    document.getElementById('userNav').classList.remove('hidden');
    document.getElementById('adminNav').classList.add('hidden');
    
    // Показываем вкладку сканирования по умолчанию
    showUserTab('scan');
}

// Показать админ-панель
function showAdminPanel() {
    debugLog('Showing admin panel', 'info');
    document.getElementById('userRole').textContent = '👑 Администратор';
    document.getElementById('userRole').classList.add('admin');
    document.getElementById('userNav').classList.add('hidden');
    document.getElementById('adminNav').classList.remove('hidden');
    
    // Показываем вкладку логов по умолчанию
    showAdminTab('logs');
    
    // Подписка на обновления в реальном времени
    subscribeToAuthLogs();
}

// Переключение вкладок пользователя
function showUserTab(tab) {
    // Обновляем кнопки навигации
    document.querySelectorAll('#userNav .nav-btn').forEach(btn => btn.classList.remove('active'));
    event?.target?.closest('.nav-btn')?.classList.add('active');
    
    // Скрываем все вкладки
    document.getElementById('scanTab').classList.remove('active');
    document.getElementById('historyTab').classList.remove('active');
    
    if (tab === 'scan') {
        document.getElementById('scanTab').classList.add('active');
        startQRScanner();
    } else if (tab === 'history') {
        document.getElementById('historyTab').classList.add('active');
        loadUserHistory();
    }
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Переключение вкладок админа
function showAdminTab(tab) {
    // Обновляем кнопки навигации
    document.querySelectorAll('#adminNav .nav-btn').forEach(btn => btn.classList.remove('active'));
    event?.target?.closest('.nav-btn')?.classList.add('active');
    
    // Скрываем все вкладки
    document.getElementById('logsTab').classList.remove('active');
    document.getElementById('generateTab').classList.remove('active');
    
    if (tab === 'logs') {
        document.getElementById('logsTab').classList.add('active');
        loadAuthLogs();
        calculateStats();
    } else if (tab === 'generate') {
        document.getElementById('generateTab').classList.add('active');
    }
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Запуск QR-сканера
function startQRScanner() {
    // Проверяем статус работника
    if (!window.isWorker) {
        debugLog('Access denied: not a worker', 'warn');
        const readerEl = document.getElementById('qr-reader');
        readerEl.innerHTML = `
            <div class="access-denied">
                <div class="access-denied-icon">🚫</div>
                <div class="access-denied-text">Вы не идентифицированы как работник, ожидайте выдачи разрешений администратором</div>
            </div>
        `;
        return;
    }
    
    if (html5QrCode) {
        // Сканер уже запущен
        return;
    }
    
    html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    ).catch(err => {
        console.error('Ошибка запуска сканера:', err);
        debugLog('Scanner error: ' + err.message, 'error');
        showResultMessage('Не удалось запустить камеру. Проверьте разрешения.', 'error');
    });
}

// Обработка успешного сканирования
async function onScanSuccess(decodedText, decodedResult) {
    debugLog('QR scanned: ' + decodedText, 'info');
    
    // Проверяем префикс QR-кода
    if (!decodedText.startsWith('QR_AUTH_')) {
        debugLog('Invalid QR code (no prefix): ' + decodedText, 'warn');
        showResultMessage('❌ Неверный QR-код. Используйте только коды из системы.', 'error');
        if (tg) tg.HapticFeedback.notificationOccurred('error');
        
        // Перезапускаем сканер через 2 секунды
        setTimeout(() => {
            hideResultMessage();
            startQRScanner();
        }, 2000);
        return;
    }
    
    // Останавливаем сканер
    if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode = null;
    }

    // Отправляем данные авторизации
    await sendAuthLog(decodedText);
}

function onScanError(error) {
    // Игнорируем ошибки сканирования (они происходят постоянно)
}

// Отправка лога авторизации
async function sendAuthLog(qrCode) {
    const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() 
        || currentUser.username || 'Пользователь';

    const { data, error } = await supabase
        .from('qr_auth_logs')
        .insert({
            user_id: currentUser.id,
            full_name: fullName,
            qr_code: qrCode,
            auth_time: new Date().toISOString()
        });

    if (error) {
        console.error('Ошибка отправки:', error);
        debugLog('Auth log error: ' + error.message, 'error');
        showResultMessage('Ошибка авторизации', 'error');
        if (tg) tg.HapticFeedback.notificationOccurred('error');
        
        // Перезапускаем сканер через 2 секунды
        setTimeout(() => {
            hideResultMessage();
            startQRScanner();
        }, 2000);
    } else {
        debugLog('Auth successful', 'info');
        showResultMessage('✅ Авторизация успешна!', 'success');
        if (tg) tg.HapticFeedback.notificationOccurred('success');
        
        // Перезапускаем сканер через 2 секунды
        setTimeout(() => {
            hideResultMessage();
            startQRScanner();
        }, 2000);
    }
}

// Загрузка истории пользователя
async function loadUserHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<p class="loading">Загрузка...</p>';

    if (!currentUser) {
        historyList.innerHTML = '<div class="empty-state">Нет данных</div>';
        return;
    }

    // Определяем период
    let dateFilter = new Date();
    if (currentFilter === 'week') {
        dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (currentFilter === 'month') {
        dateFilter.setMonth(dateFilter.getMonth() - 1);
    } else {
        dateFilter = null; // Все время
    }

    let query = supabase
        .from('qr_auth_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('auth_time', { ascending: false });

    if (dateFilter) {
        query = query.gte('auth_time', dateFilter.toISOString());
    }

    const { data, error } = await query.limit(50);

    if (error) {
        console.error('Ошибка загрузки истории:', error);
        debugLog('History error: ' + error.message, 'error');
        historyList.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
        return;
    }

    if (!data || data.length === 0) {
        historyList.innerHTML = '<div class="empty-state">Нет посещений за выбранный период</div>';
        return;
    }

    renderHistory(data);
}

// Отрисовка истории
function renderHistory(logs) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const authTime = new Date(log.auth_time);
        const dateStr = authTime.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long'
        });
        const timeStr = authTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        item.innerHTML = `
            <div class="history-item-info">
                <div class="history-item-date">${dateStr}</div>
                <div class="history-item-time">${timeStr}</div>
            </div>
            <div class="history-item-icon">✅</div>
        `;

        historyList.appendChild(item);
    });
}

// Фильтр истории
function filterHistory(period) {
    currentFilter = period;
    
    // Обновляем кнопки
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event?.target?.classList.add('active');
    
    loadUserHistory();
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Загрузка логов авторизации для админа
async function loadAuthLogs() {
    const authList = document.getElementById('authList');
    authList.innerHTML = '<p class="loading">Загрузка...</p>';

    const { data, error } = await supabase
        .from('qr_auth_logs')
        .select('*')
        .order('auth_time', { ascending: false })
        .limit(100);

    if (error) {
        console.error('Ошибка загрузки логов:', error);
        debugLog('Logs error: ' + error.message, 'error');
        authList.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
        return;
    }

    if (!data || data.length === 0) {
        authList.innerHTML = '<div class="empty-state">Пока нет авторизаций</div>';
        return;
    }

    renderAuthLogs(data);
}

// Отрисовка логов
function renderAuthLogs(logs) {
    const authList = document.getElementById('authList');
    authList.innerHTML = '';

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'auth-item';
        
        const authTime = new Date(log.auth_time);
        const timeStr = authTime.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        item.innerHTML = `
            <div class="auth-item-header">
                <span class="auth-item-name">${log.full_name}</span>
                <span class="auth-item-time">${timeStr}</span>
            </div>
            <div class="auth-item-qr">QR: ${log.qr_code}</div>
        `;

        authList.appendChild(item);
    });
}

// Расчет статистики
async function calculateStats() {
    const { data, error } = await supabase
        .from('qr_auth_logs')
        .select('auth_time');

    if (error || !data) {
        document.getElementById('todayCount').textContent = '0';
        document.getElementById('weekCount').textContent = '0';
        document.getElementById('totalCount').textContent = '0';
        return;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let weekCount = 0;

    data.forEach(log => {
        const logTime = new Date(log.auth_time);
        if (logTime >= todayStart) todayCount++;
        if (logTime >= weekStart) weekCount++;
    });

    document.getElementById('todayCount').textContent = todayCount;
    document.getElementById('weekCount').textContent = weekCount;
    document.getElementById('totalCount').textContent = data.length;
}

// Подписка на обновления в реальном времени
function subscribeToAuthLogs() {
    supabase
        .channel('qr_auth_logs_channel')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'qr_auth_logs' },
            (payload) => {
                console.log('Новая авторизация:', payload);
                debugLog('New auth: ' + payload.new.full_name, 'info');
                if (tg) tg.HapticFeedback.notificationOccurred('success');
                loadAuthLogs();
                calculateStats();
            }
        )
        .subscribe();
}

// Генерация QR-кода
async function generateQR() {
    const text = document.getElementById('qrText').value.trim();
    
    if (!text) {
        if (tg) tg.showAlert('Введите текст для QR-кода');
        else alert('Введите текст для QR-кода');
        return;
    }

    // Добавляем префикс для защиты
    const qrData = 'QR_AUTH_' + text;
    
    debugLog('Generating QR: ' + qrData, 'info');

    const canvas = document.getElementById('qrCanvas');
    const preview = document.getElementById('qrPreview');
    
    try {
        // Проверяем что библиотека QRCode загружена
        if (typeof QRCode === 'undefined') {
            throw new Error('QRCode library not loaded');
        }
        
        await QRCode.toCanvas(canvas, qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        });
        
        preview.classList.remove('hidden');
        
        debugLog('QR generated successfully', 'info');
        
        if (tg) tg.HapticFeedback.notificationOccurred('success');
    } catch (err) {
        console.error('Ошибка генерации QR:', err);
        debugLog('QR generation error: ' + err.message, 'error');
        if (tg) tg.showAlert('Ошибка генерации QR-кода: ' + err.message);
        else alert('Ошибка генерации QR-кода: ' + err.message);
    }
}

// Скачать QR-код
function downloadQR() {
    const canvas = document.getElementById('qrCanvas');
    const text = document.getElementById('qrText').value.trim();
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr_${text}_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    debugLog('QR downloaded', 'info');
    if (tg) tg.HapticFeedback.notificationOccurred('success');
}

// Печать QR-кода
function printQR() {
    const canvas = document.getElementById('qrCanvas');
    const text = document.getElementById('qrText').value.trim();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>QR Code - ${text}</title>
            <style>
                body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                }
                h1 {
                    margin-bottom: 20px;
                }
                img {
                    max-width: 400px;
                    border: 2px solid #000;
                    padding: 20px;
                }
                @media print {
                    body {
                        display: block;
                        padding: 40px;
                    }
                }
            </style>
        </head>
        <body>
            <h1>QR Code: ${text}</h1>
            <img src="${canvas.toDataURL()}" alt="QR Code">
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
    
    debugLog('QR print initiated', 'info');
    if (tg) tg.HapticFeedback.notificationOccurred('success');
}

// Показать результат сканирования
function showResultMessage(message, type) {
    const resultDiv = document.getElementById('scanResult');
    resultDiv.textContent = message;
    resultDiv.className = `result-message ${type}`;
}

function hideResultMessage() {
    const resultDiv = document.getElementById('scanResult');
    resultDiv.className = 'result-message hidden';
}

function showError(message) {
    const container = document.getElementById('mainContainer');
    container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}

// Запуск приложения
init();
