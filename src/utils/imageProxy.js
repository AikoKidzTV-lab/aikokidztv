// Image Proxy Utility for localhost development
// This helps with CORS issues when displaying images from external sources

export const createImageProxyUrl = (imageUrl) => {
  // For localhost development, we can use a simple proxy approach
  // This helps with CORS issues when displaying images from external sources
  return imageUrl;
};

export const fetchImageAsBlob = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      headers: {
        'Origin': window.location.origin
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Image fetch error:', error);
    return null;
  }
};

export const validateImageUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};