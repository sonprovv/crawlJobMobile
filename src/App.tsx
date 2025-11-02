import { useState, useEffect } from "react";
import { PostCard } from "./components/PostCard";
import { LogViewer } from "./components/LogViewer";
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
  const [showLogs, setShowLogs] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  // Function to fetch data from Google Sheets API
  const fetchDataFromSheet = async () => {
    setLoading(true);
    setError("");
    
    try {
      const sheetId = "1CO0PSZ6guTq9eR03u_UkzPIHZr5k_SO5bedqZzPU0d8";
      const apiKey = "AIzaSyBmtMhwV1mzWAsFoFAvSDxaTl4Bf1ENLbE";
      const range = "Trang tính1!A1:D1000";
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu. Vui lòng kiểm tra lại.");
      }

      const data = await response.json();
      const rows = data.values;

      if (!rows || rows.length === 0) {
        setPosts([]);
        setFilteredPosts([]);
        return;
      }

      // Lấy header từ dòng đầu tiên
      const headers = rows[0].map((header: string) => header.toLowerCase().trim());
      
      // Tìm vị trí các cột
      const textIdx = headers.findIndex((h: string) => h.includes('text'));
      const urlIdx = headers.findIndex((h: string) => h.includes('url'));
      const timeIdx = headers.findIndex((h: string) => h.includes('time'));
      const userIdx = headers.findIndex((h: string) => h.includes('user'));

      // Chuyển đổi dữ liệu thành mảng posts
      const parsedPosts = rows.slice(1).map((row: string[]) => ({
        text: row[textIdx] || '',
        url: row[urlIdx] || '',
        time: row[timeIdx] || '',
        user: row[userIdx] || ''
      }));

      setPosts(parsedPosts);
      setFilteredPosts(parsedPosts);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu");
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
              {[0, 1, 2, 3,].map((i) => (
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
      <LogViewer visible={showLogs} />
    </div>
  );
}
