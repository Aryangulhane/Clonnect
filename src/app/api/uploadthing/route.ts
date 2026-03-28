import { createRouteHandler } from "uploadthing/next";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Avatar uploads
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded by", metadata.userId, file.url);
      return { url: file.url };
    }),

  // Post file/image uploads
  postUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 4 },
    pdf: { maxFileSize: "16MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File uploaded by", metadata.userId, file.url);
      return { url: file.url };
    }),

  // Resource uploads
  resourceUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 4 },
    pdf: { maxFileSize: "32MB", maxFileCount: 5 },
    "application/zip": { maxFileSize: "64MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resource uploaded by", metadata.userId, file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
