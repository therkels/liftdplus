import Image from "next/image";
import ReactMarkdownOrig from "react-markdown";
import type { Options as ReactMarkdownOptions } from "react-markdown";
import PostMetadata from "./PostMetadata";
import { Post } from "@/utils/postTransformers";

const ReactMarkdown =
  ReactMarkdownOrig as unknown as React.FC<ReactMarkdownOptions>;

interface PostContentBaseProps {
  post: Post & {
    user_liked: boolean;
    user_archived: boolean;
    content?: string; // Markdown content
  };
}

const PostContentBase: React.FC<PostContentBaseProps> = ({ post }) => {
  return (
    <div className="w-full">
      <PostMetadata post={post} />

      <div className="relative w-full h-64 md:h-80">
        <Image
          src={post.cover_image_url}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6 md:p-8">
        {post.content && (
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }: { children: React.ReactNode }) => (
                  <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-6">
                    {children}
                  </h1>
                ),
                h2: ({ children }: { children: React.ReactNode }) => (
                  <h2 className="text-xl font-bold text-gray-800 mb-3 mt-5">
                    {children}
                  </h2>
                ),
                h3: ({ children }: { children: React.ReactNode }) => (
                  <h3 className="text-lg font-bold text-gray-800 mb-2 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }: { children: React.ReactNode }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                img: ({ src, alt }: { children: React.ReactNode }) => (
                  <div className="my-6">
                    <Image
                      src={src || ""}
                      alt={alt || ""}
                      width={800}
                      height={600}
                      className="rounded-lg object-cover w-full"
                    />
                  </div>
                ),
                ul: ({ children }: { children: React.ReactNode }) => (
                  <ul className="list-disc pl-6 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }: { children: React.ReactNode }) => (
                  <ol className="list-decimal pl-6 mb-4 text-gray-700">
                    {children}
                  </ol>
                ),
                blockquote: ({ children }: { children: React.ReactNode }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children }: { children: React.ReactNode }) => (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }: { children: React.ReactNode }) => (
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContentBase;
