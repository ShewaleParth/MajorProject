/**
 * Image Generator Utility
 * Automatically generates product images using AI when manual images aren't available
 */

// Cache for generated image URLs to avoid regenerating
const imageCache = new Map();

/**
 * Generate a descriptive prompt for AI image generation
 * @param {Object} product - Product object with name, brand, category
 * @returns {string} - AI prompt for image generation
 */
const generateImagePrompt = (product) => {
    const parts = [];

    // Add product name
    if (product.name) {
        parts.push(product.name);
    }

    // Add brand if available
    if (product.brand && product.brand !== 'Generic') {
        parts.push(product.brand);
    }

    // Add category
    if (product.category) {
        parts.push(product.category);
    }

    // Create professional product photography prompt
    const basePrompt = parts.join(' ');
    return `${basePrompt}, professional product photography, white background, studio lighting, high quality, commercial photo, centered, 4k`;
};

/**
 * Generate AI image URL using Pollinations.ai (free, no API key needed)
 * @param {Object} product - Product object
 * @returns {string} - Generated image URL
 */
export const generateProductImage = (product) => {
    // Check cache first
    const cacheKey = `${product.sku}-${product.name}`;
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey);
    }

    // Generate prompt
    const prompt = generateImagePrompt(product);

    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);

    // Generate URL using Pollinations.ai
    // Parameters: width=400, height=400, nologo=true, seed for consistency
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=400&nologo=true&seed=${product.sku}`;

    // Cache the URL
    imageCache.set(cacheKey, imageUrl);

    return imageUrl;
};

/**
 * Get category-specific fallback placeholder
 * @param {string} category - Product category
 * @returns {string} - Fallback image URL
 */
export const getCategoryPlaceholder = (category) => {
    const placeholders = {
        'Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
        'Apparel': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
        'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    };

    return placeholders[category] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
};

/**
 * Get the best image for a product with fallback strategy
 * Priority: Manual Image > AI Generated > Category Placeholder
 * @param {Object} product - Product object
 * @returns {string} - Image URL to display
 */
export const getProductImage = (product) => {
    // 1. Check if manual image exists and is valid
    if (product.image && product.image.trim() !== '') {
        return product.image;
    }

    // 2. Generate AI image
    try {
        return generateProductImage(product);
    } catch (error) {
        console.warn('AI image generation failed, using category placeholder:', error);
        // 3. Fallback to category placeholder
        return getCategoryPlaceholder(product.category);
    }
};

/**
 * Preload image to check if it loads successfully
 * @param {string} url - Image URL to preload
 * @returns {Promise<boolean>} - True if image loads successfully
 */
export const preloadImage = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

/**
 * Clear image cache (useful for testing or memory management)
 */
export const clearImageCache = () => {
    imageCache.clear();
};

export default {
    generateProductImage,
    getProductImage,
    getCategoryPlaceholder,
    preloadImage,
    clearImageCache
};
