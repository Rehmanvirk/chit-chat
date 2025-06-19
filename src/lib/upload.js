// OPTION 1: Convert to Base64 (for small images only)
// This stores the image data directly in Firestore
const uploadAsBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    // Check file size (limit to 1MB for Firestore efficiency)
    if (file.size > 1024 * 1024) {
      reject("File too large. Please use an image smaller than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result); // Returns base64 string
    };
    reader.onerror = () => {
      reject("Failed to read file");
    };
    reader.readAsDataURL(file);
  });
};

// OPTION 2: Disable file uploads entirely
// Returns a placeholder or error message
const uploadDisabled = async (file) => {
  return Promise.reject("File uploads are currently disabled");
};

// OPTION 3: Use external service (like Cloudinary, ImgBB, etc.)
// You would need to sign up for a free service and get an API key
const uploadToExternalService = async (file) => {
  // Example with ImgBB (free tier available)
  const API_KEY = "YOUR_IMGBB_API_KEY"; // Replace with your key
  
  if (!API_KEY || API_KEY === "YOUR_IMGBB_API_KEY") {
    return Promise.reject("External upload service not configured");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (error) {
    throw new Error("Upload failed: " + error.message);
  }
};

// OPTION 4: Mock upload for testing
// Returns a placeholder URL immediately
const mockUpload = async (file) => {
  return new Promise((resolve) => {
    // Simulate upload delay
    setTimeout(() => {
      resolve("./placeholder-image.png"); // Use local placeholder
    }, 1000);
  });
};

// Export the Base64 upload function
export default uploadAsBase64;

// Alternative with error handling and fallback
export const uploadWithFallback = async (file) => {
  try {
    return await uploadAsBase64(file);
  } catch (error) {
    console.warn("Upload failed:", error);
    // Return placeholder image instead of failing
    return "./placeholder-image.png";
  }
};