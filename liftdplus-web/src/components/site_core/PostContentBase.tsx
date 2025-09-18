/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import ReactMarkdownOrig from "react-markdown";
import type {
  Options as ReactMarkdownOptions,
  Components,
} from "react-markdown";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

const ReactMarkdown =
  ReactMarkdownOrig as unknown as React.FC<ReactMarkdownOptions>;

interface PostContentBaseProps {
  post: PostData;
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
                h1: ({ children, ...props }: any) => (
                  <h1
                    className="text-2xl font-bold text-gray-800 mb-4 mt-6"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }: any) => (
                  <h2
                    className="text-xl font-bold text-gray-800 mb-3 mt-5"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }: any) => (
                  <h3
                    className="text-lg font-bold text-gray-800 mb-2 mt-4"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }: any) => (
                  <p className="text-gray-700 mb-4 leading-relaxed" {...props}>
                    {children}
                  </p>
                ),
                img: ({ src, alt, ...props }: any) => (
                  <div className="my-6">
                    <Image
                      src={src || ""}
                      alt={alt || ""}
                      width={800}
                      height={600}
                      className="rounded-lg object-cover w-full"
                      {...props}
                    />
                  </div>
                ),
                ul: ({ children, ...props }: any) => (
                  <ul className="list-disc pl-6 mb-4 text-gray-700" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }: any) => (
                  <ol
                    className="list-decimal pl-6 mb-4 text-gray-700"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                blockquote: ({ children, ...props }: any) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children, ...props }: any) => (
                  <code
                    className="bg-gray-100 px-2 py-1 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                ),
                pre: ({ children, ...props }: any) => (
                  <pre
                    className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4"
                    {...props}
                  >
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
