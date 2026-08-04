/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Uploaded images (schedules, homework/announcement attachments) now
    // live on Vercel Blob, not under /public -- next/image refuses to
    // optimize an external URL unless its host is explicitly allowed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

module.exports = nextConfig;
