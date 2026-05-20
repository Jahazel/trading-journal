export function validateImageUrls(images: string[]): boolean {
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  return images.every((url) => typeof url === "string" && url.startsWith(prefix));
}
