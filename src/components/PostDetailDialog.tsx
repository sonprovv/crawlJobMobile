import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ExternalLink, User, Clock } from "lucide-react";
import { Button } from "./ui/button";

interface PostDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  url: string;
  time: string;
  user: string | null | { name: string };
}

export const PostDetailDialog = forwardRef<HTMLDivElement, PostDetailDialogProps>(({
  isOpen,
  onClose,
  text,
  url,
  time,
  user,
}, ref) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={ref} className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <div className="bg-blue-100 rounded-full p-1.5">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span>{typeof user === 'object' ? (user?.name || "Ẩn danh") : (user || "Ẩn danh")}</span>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm ml-auto">
                <Clock className="w-4 h-4" />
                <span>{formatDate(time)}</span>
              </div>
            </div>
          </DialogTitle>
          <div className="mt-4 space-y-4">
            {/* Nội dung chi tiết */}
            <DialogDescription asChild>
              <div className="text-gray-700 whitespace-pre-wrap break-words text-base leading-relaxed">
                {text}
              </div>
            </DialogDescription>
            
            {/* URL section */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600 font-medium mb-2">Liên kết:</div>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="text-sm break-all font-mono">
                  🔗 {url || "Không có URL"}
                </div>
                {url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Mở liên kết
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
});