import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

interface PostData {
  post_id: string;
  cover_image_url: string;
  title: string;
  secondary_title: string;
  author_name: string;
  author_photo?: string;
  like_count: number;
  tags: string[];
  content_type: PostContentType;
  content?: string; // Markdown
  images?: string[];
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  if (post.content_type === "image") {
    const postWithImages = {
      ...post,
      images: post.images || [],
    };
    return <PostContentCarousel post={postWithImages} />;
  }

  return <PostContentBase post={post} />;
};

export default PostContent;
export type { PostData };
