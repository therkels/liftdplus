import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

interface CardProps {
  image: string;
  title: string;
  secondaryTitle: string;
  authorName: string;
  authorPhoto?: string;
  likes: number;
  tags: string[];
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  secondaryTitle,
  authorName,
  authorPhoto,
  likes,
  tags,
}) => {
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-lg shadow-lg overflow-hidden m-2">
      <div className="relative h-48 w-full">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-600 mb-3">{secondaryTitle}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8">
              {authorPhoto ? (
                <Image
                  src={authorPhoto}
                  alt={authorName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {authorName}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-600">{likes}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Card;
