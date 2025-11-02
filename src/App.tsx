import { useState, useEffect } from "react";
import { PostCard } from "./components/PostCard";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Search, RefreshCw, AlertCircle, Filter, Calendar, SortDesc, SortAsc } from "lucide-react";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Skeleton } from "./components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";

interface Post {
  text: string;
  url: string;
  time: string;
  user: string;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CO0PSZ6guTq9eR03u_UkzPIHZr5k_SO5bedqZzPU0d8/edit?gid=0#gid=0";

  // Function to parse Google Sheets URL and extract sheet ID
  const extractSheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Simple CSV parser that handles quoted fields
  const parseCSVRow = (row: string): string[] => {
    const fields: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fields.push(currentField);

    return fields.map(field => field.trim());
  };

  // Function to fetch data from Google Sheets
  const fetchDataFromSheet = async () => {
    setLoading(true);
    setError("");
    
    try {
      const sheetId = extractSheetId(SHEET_URL);
      if (!sheetId) {
        throw new Error("URL Google Sheet không hợp lệ");
      }

      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu. Vui lòng đảm bảo sheet được chia sẻ công khai.");
      }

      const csvText = await response.text();
      const rows = csvText.split('\n');
      
      // Skip header row
      const parsedPosts: Post[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row.trim()) continue;
        
        const fields = parseCSVRow(row);
        if (fields.length >= 4) {
          // Parse time field - handle various formats
          let timeValue = fields[2] || "";
          
          // If time is in format like "02/11/2024 14:40:02", convert to ISO
          if (timeValue && !timeValue.includes('T')) {
            try {
              // Try parsing dd/mm/yyyy format
              const parts = timeValue.split(' ');
              if (parts[0]) {
                const dateParts = parts[0].split('/');
                if (dateParts.length === 3) {
                  const day = dateParts[0];
                  const month = dateParts[1];
                  const year = dateParts[2];
                  const timePart = parts[1] || '00:00:00';
                  timeValue = `${year}-${month}-${day}T${timePart}Z`;
                }
              }
            } catch (e) {
              // Keep original value if parsing fails
            }
          }
          
          parsedPosts.push({
            text: fields[0] || "",
            url: fields[1] || "",
            time: timeValue,
            user: fields[3] || "",
          });
        }
      }

      setPosts(parsedPosts);
      setFilteredPosts(parsedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDataFromSheet();
  }, []);

  // Filter and sort posts
  useEffect(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.text.toLowerCase().includes(query) ||
        post.user.toLowerCase().includes(query)
      );
    }

    // Period filter
    if (selectedPeriod !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedPeriod) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(post => {
        const postDate = new Date(post.time);
        return postDate >= filterDate;
      });
    }

    // Sort by time
    filtered.sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredPosts(filtered);
  }, [searchQuery, posts, sortOrder, selectedPeriod]);

  // Get unique users
  const uniqueUsers = Array.from(new Set(posts.map(p => p.user))).filter(u => u);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-blue-600 mb-1">
                📊 Facebook Group Posts
              </h1>
              <p className="text-sm text-gray-500">Quản lý và theo dõi bài đăng nhóm</p>
            </div>
            <Button 
              onClick={fetchDataFromSheet}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo nội dung hoặc tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày</SelectItem>
                <SelectItem value="month">30 ngày</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="default"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="w-full md:w-auto"
            >
              {sortOrder === "desc" ? (
                <SortDesc className="w-4 h-4 mr-2" />
              ) : (
                <SortAsc className="w-4 h-4 mr-2" />
              )}
              {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Tổng bài viết</p>
            <p className="text-3xl text-blue-600">{posts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Kết quả hiển thị</p>
            <p className="text-3xl text-green-600">{filteredPosts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Tác giả</p>
            <p className="text-3xl text-purple-600">{uniqueUsers.length}</p>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-3 shadow-sm">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg p-16 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-3" />
              </div>
              <p className="text-gray-600 mb-2">
                {searchQuery || selectedPeriod !== "all" 
                  ? "Không tìm thấy bài viết phù hợp" 
                  : "Chưa có dữ liệu"}
              </p>
              <p className="text-sm text-gray-400">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPosts.map((post, index) => (
                <PostCard
                  key={index}
                  text={post.text}
                  url={post.url}
                  time={post.time}
                  user={post.user}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>

        {/* Show more indicator */}
        {filteredPosts.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Hiển thị {filteredPosts.length} bài viết
          </div>
        )}
      </main>
    </div>
  );
}
