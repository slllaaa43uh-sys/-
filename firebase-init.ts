import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

/**
 * ============================================
 * Firebase Configuration for Mehnati App
 * ============================================
 * تهيئة Firebase للإشعارات الخارجية (Push Notifications)
 * 
 * ملاحظة: تم إزالة getToken لأننا نستخدم Capacitor Push Notifications
 * للحصول على التوكن في بيئة WebView (iOS/Android)
 */

// إعدادات Firebase - تُقرأ من متغيرات البيئة
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD08yfFqO32HBSU9SLxFx2UuPvkVdEhMWY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mihnty-e94ca.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mihnty-e94ca",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mihnty-e94ca.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123005243140",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123005243140:web:7ba255ae7bcb25ccd58a51",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E0QRH2YWPC"
};

// VAPID Key للإشعارات (يُستخدم فقط في بيئة الويب إذا لزم الأمر)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "sTw8qpWfiNulXC_NsqZhwhIXOfeUs65sYLiyCb8fpsY";

let app: any = null;
let messaging: any = null;

try {
  // تهيئة Firebase App
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized successfully');
  
  // تهيئة Firebase Messaging (فقط في المتصفح)
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    try {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized successfully');
    } catch (e) {
      console.warn('⚠️ Firebase Messaging not supported in this environment:', e);
    }
  }
} catch (error) {
  console.error('❌ Firebase Initialization Error:', error);
}

export { app, messaging, onMessage };
