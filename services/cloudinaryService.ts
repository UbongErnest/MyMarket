
// =========================================================================================
// INSTRUCTIONS TO GET KEYS:
// 1. Select "React" if asked for an SDK (or skip).
// 2. Go to Settings (Gear Icon) -> "Upload".
// 3. Scroll to "Upload presets" -> Click "Add upload preset".
// 4. Change "Signing Mode" to "Unsigned" (Critical!).
// 5. Copy the "Name" of the preset (e.g. "ml_default") -> Paste into UPLOAD_PRESET below.
// =========================================================================================

const CLOUD_NAME = "dfn83v6jq"; 
const UPLOAD_PRESET = "ml_default"; 

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
      const msg = "Cloudinary keys are missing! Please open services/cloudinaryService.ts and add your Cloud Name and Upload Preset.";
      alert(msg);
      throw new Error(msg);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
        const err = await response.json();
        console.error("Cloudinary Error Detail:", err);
        throw new Error(err.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    // Nice user-friendly error if the preset is wrong
    if (error.message && error.message.includes("preset")) {
        throw new Error("Invalid Cloudinary Preset. Make sure it is set to 'Unsigned' in your Cloudinary settings.");
    }
    throw error;
  }
};
