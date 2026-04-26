import cloudinary from "../utils/cloudinary";

export async function uploadTicketFiles(files: Express.Multer.File[] | undefined): Promise<string[]> {
  const imageUrls: string[] = [];
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  if (!cloudinaryConfigured || !files || !Array.isArray(files)) return imageUrls;
  for (const f of files) {
    try {
      const result = await cloudinary.uploader.upload(f.path, { folder: "tickets" });
      imageUrls.push(result.secure_url);
    } catch (err) {
      console.error("[cloudinary] Failed to upload file:", f.originalname, err);
    }
  }
  return imageUrls;
}
