import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, User, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

interface PostCardProps {
  text: string;
  url: string;
  time: string;
  user: string;
  searchQuery?: string;
}

export function PostCard({ text, url, time, user, searchQuery = "" }: PostCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    try {
      // Try to parse the date
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If it's already in dd/mm/yyyy format, return as is
        return dateString;
      }
      
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

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) {
      return formatText(text);
    }

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>;
      }
      return formatText(part).props.children;
    });
  };

  const formatText = (text: string) => {
    return (
      <span className="whitespace-pre-wrap break-words">
        {text.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < text.split('\n').length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-gray-200 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-blue-100 rounded-full p-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-sm">{user || "Ẩn danh"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(time)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 pb-3 flex-1">
        <div className="text-gray-700 leading-relaxed text-sm">
          {searchQuery ? highlightText(text, searchQuery) : formatText(text)}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t border-gray-100">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
        >
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
            <ExternalLink className="w-3.5 h-3.5 mr-2" />
            Xem bài viết gốc
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
