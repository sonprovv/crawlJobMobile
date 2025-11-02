import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { User, Clock, Link as LinkIcon } from "lucide-react";

interface PostCardProps {
  text: string;
  url: string;
  time: string;
  user: string | null | { name: string };
}

export function PostCard({ text, url, time, user }: PostCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const getUserName = () => {
    if (typeof user === 'object') {
      return user?.name || "Ẩn danh";
    }
    return user || "Ẩn danh";
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-200">
      {/* Header: User & Time */}
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">{getUserName()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate(time)}</span>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 pt-4">
        {/* Text Content */}
        <div className="text-gray-700 whitespace-pre-wrap">
          {text}
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 text-gray-500 border-t pt-4">
          <LinkIcon className="w-4 h-4" />
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-blue-600 break-all"
          >
            {url}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
