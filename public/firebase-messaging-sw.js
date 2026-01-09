/**
 * ============================================
 * Firebase Messaging Service Worker
 * ============================================
 * هذا الملف مسؤول عن استقبال الإشعارات عندما يكون التطبيق مغلقاً
 * يجب أن يكون في مجلد public/
 * 
 * Updated: January 8, 2026 - New Firebase Project (mehnati-d7ab9)
 */

// استيراد مكتبات Firebase
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// إعدادات Firebase (نفس الإعدادات في firebase-init.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBvveNXHmdO_j07dHwyLAiLOj1pxsmbjaQ",
  authDomain: "mehnati-d7ab9.firebaseapp.com",
  projectId: "mehnati-d7ab9",
  storageBucket: "mehnati-d7ab9.firebasestorage.app",
  messagingSenderId: "951669845862",
  appId: "1:951669845862:web:6c1939f1d4e6c394eda2a7"
};

// تهيئة Firebase في Service Worker
firebase.initializeApp(firebaseConfig);

// الحصول على مثيل Messaging
const messaging = firebase.messaging();

console.log('🔔 Firebase Messaging Service Worker loaded');

/**
 * استقبال الإشعارات في الخلفية (عندما يكون التطبيق مغلقاً)
 */
messaging.onBackgroundMessage((payload) => {
  console.log('📬 [Service Worker] استلام إشعار في الخلفية:', payload);
  
  // استخراج بيانات الإشعار
  const notificationTitle = payload.notification?.title || 'مهنتي لي';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك إشعار جديد',
    icon: '/assets/images/app-logo.jpg',
    badge: '/assets/images/app-logo.jpg',
    tag: payload.data?.tag || 'mehnati-notification',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'فتح التطبيق' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  // إرسال رسالة للتطبيق لتحديث عداد الإشعارات (badges)
  clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      client.postMessage({
        type: 'NOTIFICATION_RECEIVED',
        data: payload.data || {}
      });
    }
  });

  // عرض الإشعار
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * التعامل مع النقر على الإشعار
 */
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [Service Worker] تم النقر على الإشعار:', event);
  console.log('👆 [Service Worker] بيانات الإشعار:', event.notification.data);
  
  // إغلاق الإشعار
  event.notification.close();
  
  // إذا ضغط على "إغلاق"، لا تفعل شيء
  if (event.action === 'close') {
    return;
  }
  
  // استخراج بيانات الإشعار
  const data = event.notification.data || {};
  const postId = data.postId || data.post_id;
  const videoId = data.videoId || data.video_id;
  const type = data.type || data.category;
  
  // بناء URL مع بيانات الإشعار
  let targetUrl = '/';
  if (postId) {
    targetUrl = `/?notification=post&postId=${postId}`;
  } else if (videoId) {
    targetUrl = `/?notification=video&videoId=${videoId}`;
  }
  
  console.log('📱 [Service Worker] سيتم فتح:', targetUrl);
  
  // فتح التطبيق أو التركيز عليه
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // إذا كان التطبيق مفتوحاً، أرسل رسالة له
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('📱 التطبيق مفتوح، جاري إرسال بيانات الإشعار');
            // إرسال بيانات الإشعار للتطبيق
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: { postId, videoId, notificationType: type }
            });
            return client.focus();
          }
        }
        // إذا لم يكن مفتوحاً، افتح نافذة جديدة مع URL يحتوي على بيانات الإشعار
        if (clients.openWindow) {
          console.log('📱 فتح التطبيق مع بيانات الإشعار');
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * تثبيت Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('⚙️ [Service Worker] Installing...');
  self.skipWaiting();
});

/**
 * تفعيل Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('✅ [Service Worker] Activated');
  event.waitUntil(clients.claim());
});
