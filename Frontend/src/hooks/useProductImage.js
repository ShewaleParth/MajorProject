import { useState, useEffect } from 'react';
import { getProductImage, getCategoryPlaceholder } from '../utils/imageGenerator';

/**
 * Custom hook for managing product images with automatic AI generation
 * @param {Object} product - Product object
 * @returns {Object} - { imageUrl, isLoading, error, retry }
 */
export const useProductImage = (product) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadImage = async () => {
        if (!product) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Get the best image URL (manual, AI, or placeholder)
            const url = getProductImage(product);

            // Set the image URL
            setImageUrl(url);
            setIsLoading(false);
        } catch (err) {
            console.error('Error loading product image:', err);
            setError(err.message);
            // Fallback to category placeholder on error
            setImageUrl(getCategoryPlaceholder(product.category));
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadImage();
    }, [product?.sku, product?.image]); // Reload if SKU or manual image changes

    const retry = () => {
        loadImage();
    };

    return {
        imageUrl,
        isLoading,
        error,
        retry
    };
};

export default useProductImage;
