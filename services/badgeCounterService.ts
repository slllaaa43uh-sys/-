/**
 * ============================================
 * Badge Counter Service
 * ============================================
 * Manages badge counters for Jobs and Haraj sections
 * 
 * Rules:
 * - Counters only increase (never decrease automatically)
 * - Counters decrease only when user deletes their own post
 * - Counters persist in localStorage
 * - Real-time updates via push notifications
 */

// Storage keys
const STORAGE_KEYS = {
  JOBS_SEEKER: 'badge_jobs_seeker',
  JOBS_EMPLOYER: 'badge_jobs_employer',
  HARAJ_ALL: 'badge_haraj_all',
  JOBS_TOTAL: 'badge_jobs_total',
  HARAJ_TOTAL: 'badge_haraj_total',
  // Per-category keys will be dynamically generated
};

// Get badge count from localStorage
export const getBadgeCount = (key: string): number => {
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : 0;
};

// Set badge count in localStorage
export const setBadgeCount = (key: string, count: number): void => {
  localStorage.setItem(key, String(Math.max(0, count)));
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('badgeCountUpdated', { 
    detail: { key, count: Math.max(0, count) } 
  }));
};

// Increment badge count
export const incrementBadgeCount = (key: string, amount: number = 1): void => {
  const current = getBadgeCount(key);
  setBadgeCount(key, current + amount);
};

// Decrement badge count (only when user deletes their own post)
export const decrementBadgeCount = (key: string, amount: number = 1): void => {
  const current = getBadgeCount(key);
  setBadgeCount(key, Math.max(0, current - amount));
};

// Get total jobs badge count
export const getJobsTotalBadge = (): number => {
  return getBadgeCount(STORAGE_KEYS.JOBS_TOTAL);
};

// Get total haraj badge count
export const getHarajTotalBadge = (): number => {
  return getBadgeCount(STORAGE_KEYS.HARAJ_TOTAL);
};

// Get jobs seeker badge count
export const getJobsSeekerBadge = (): number => {
  return getBadgeCount(STORAGE_KEYS.JOBS_SEEKER);
};

// Get jobs employer badge count
export const getJobsEmployerBadge = (): number => {
  return getBadgeCount(STORAGE_KEYS.JOBS_EMPLOYER);
};

// Increment jobs badge (called when notification received)
export const incrementJobsBadge = (type: 'seeker' | 'employer'): void => {
  if (type === 'seeker') {
    incrementBadgeCount(STORAGE_KEYS.JOBS_SEEKER);
  } else {
    incrementBadgeCount(STORAGE_KEYS.JOBS_EMPLOYER);
  }
  incrementBadgeCount(STORAGE_KEYS.JOBS_TOTAL);
};

// Increment haraj badge (called when notification received)
export const incrementHarajBadge = (category?: string): void => {
  incrementBadgeCount(STORAGE_KEYS.HARAJ_TOTAL);
  if (category) {
    incrementBadgeCount(`badge_haraj_${category}`);
  }
};

// Decrement jobs badge (called when user deletes their own post)
export const decrementJobsBadge = (type: 'seeker' | 'employer'): void => {
  if (type === 'seeker') {
    decrementBadgeCount(STORAGE_KEYS.JOBS_SEEKER);
  } else {
    decrementBadgeCount(STORAGE_KEYS.JOBS_EMPLOYER);
  }
  decrementBadgeCount(STORAGE_KEYS.JOBS_TOTAL);
};

// Decrement haraj badge (called when user deletes their own post)
export const decrementHarajBadge = (category?: string): void => {
  decrementBadgeCount(STORAGE_KEYS.HARAJ_TOTAL);
  if (category) {
    decrementBadgeCount(`badge_haraj_${category}`);
  }
};

// Process incoming notification and update badges
export const processNotificationForBadge = (data: any): void => {
  console.log('🔔 Processing notification for badge:', data);
  
  const type = data.type || data.displayPage || '';
  const category = data.category || '';
  const postTitle = data.postTitle || '';
  
  // Check if it's a jobs notification
  if (type === 'jobs' || category.includes('jobs_') || 
      postTitle.includes('ابحث عن وظيفة') || postTitle.includes('ابحث عن موظفين')) {
    
    // Determine if seeker or employer
    if (postTitle.includes('ابحث عن وظيفة') || postTitle.includes('أبحث عن وظيفة')) {
      // Post is from job seeker -> notify employers
      incrementJobsBadge('employer');
      console.log('📊 Incremented jobs employer badge');
    } else if (postTitle.includes('ابحث عن موظفين') || postTitle.includes('أبحث عن موظفين')) {
      // Post is from employer -> notify job seekers
      incrementJobsBadge('seeker');
      console.log('📊 Incremented jobs seeker badge');
    } else {
      // Generic jobs notification
      incrementBadgeCount(STORAGE_KEYS.JOBS_TOTAL);
      console.log('📊 Incremented jobs total badge');
    }
  }
  // Check if it's a haraj notification
  else if (type === 'haraj' || category.includes('haraj_')) {
    incrementHarajBadge(category);
    console.log('📊 Incremented haraj badge');
  }
};

// Hook to listen for badge updates
export const useBadgeListener = (callback: (key: string, count: number) => void): void => {
  if (typeof window !== 'undefined') {
    const handler = (event: CustomEvent) => {
      callback(event.detail.key, event.detail.count);
    };
    window.addEventListener('badgeCountUpdated', handler as EventListener);
  }
};

// Export storage keys for external use
export { STORAGE_KEYS };
