/**
 * ============================================
 * Badge Counter Service
 * ============================================
 * Fetches and manages post counts for Jobs and Haraj sections
 * Shows actual number of posts in each category (like Marjan app)
 */

import { API_BASE_URL } from '../constants';

// Types
interface JobCategoryCounts {
  seeker: number;
  employer: number;
  total: number;
}

interface PostCountsData {
  jobs: {
    total: number;
    seeker: number;
    employer: number;
    categories: Record<string, JobCategoryCounts>;
  };
  haraj: {
    total: number;
    categories: Record<string, number>;
  };
}

// Cache for post counts
let cachedCounts: PostCountsData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Fetch post counts from API
 */
export const fetchPostCounts = async (): Promise<PostCountsData | null> => {
  try {
    // Check cache
    const now = Date.now();
    if (cachedCounts && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedCounts;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/posts/counts`);
    
    if (!response.ok) {
      console.error('Failed to fetch post counts:', response.status);
      return cachedCounts; // Return cached data if available
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      cachedCounts = result.data;
      lastFetchTime = now;
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('postCountsUpdated', { 
        detail: result.data 
      }));
      
      return result.data;
    }
    
    return cachedCounts;
  } catch (error) {
    console.error('Error fetching post counts:', error);
    return cachedCounts;
  }
};

/**
 * Get jobs total count
 */
export const getJobsTotalCount = (): number => {
  return cachedCounts?.jobs?.total || 0;
};

/**
 * Get jobs seeker count (ابحث عن وظيفة)
 */
export const getJobsSeekerCount = (): number => {
  return cachedCounts?.jobs?.seeker || 0;
};

/**
 * Get jobs employer count (ابحث عن موظفين)
 */
export const getJobsEmployerCount = (): number => {
  return cachedCounts?.jobs?.employer || 0;
};

/**
 * Get haraj total count
 */
export const getHarajTotalCount = (): number => {
  return cachedCounts?.haraj?.total || 0;
};

/**
 * Get job category counts
 */
export const getJobCategoryCounts = (category: string): JobCategoryCounts => {
  return cachedCounts?.jobs?.categories?.[category] || { seeker: 0, employer: 0, total: 0 };
};

/**
 * Get haraj category count
 */
export const getHarajCategoryCount = (category: string): number => {
  return cachedCounts?.haraj?.categories?.[category] || 0;
};

/**
 * Get all cached counts
 */
export const getCachedCounts = (): PostCountsData | null => {
  return cachedCounts;
};

/**
 * Force refresh counts
 */
export const refreshCounts = async (): Promise<void> => {
  lastFetchTime = 0; // Reset cache
  await fetchPostCounts();
};

/**
 * Initialize and start auto-refresh
 */
export const initPostCountService = (): void => {
  // Fetch immediately
  fetchPostCounts();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    fetchPostCounts();
  }, CACHE_DURATION);
};

// Export types
export type { PostCountsData, JobCategoryCounts };
