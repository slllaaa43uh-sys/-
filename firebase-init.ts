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
 * 
 * Updated: January 8, 2026 - New Firebase Project (mehnati-d7ab9)
 */

// إعدادات Firebase - تُقرأ من متغيرات البيئة
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvveNXHmdO_j07dHwyLAiLOj1pxsmbjaQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mehnati-d7ab9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mehnati-d7ab9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mehnati-d7ab9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "951669845862",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:951669845862:web:6c1939f1d4e6c394eda2a7"
};

// VAPID Key للإشعارات (يُستخدم فقط في بيئة الويب إذا لزم الأمر)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

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
