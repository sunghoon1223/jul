import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Calendar, Pin, ChevronLeft, ChevronRight } from "lucide-react";

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  views: number;
  isPinned: boolean;
  category: string;
  thumbnail?: string;
}

const NoticePage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  
  const itemsPerPage = 10;

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await fetch('/data/notices.json');
        const data = await response.json();
        setNotices(data);
        setFilteredNotices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading notices:', error);
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  useEffect(() => {
    let filtered = notices;

    // 카테고리 필터링
    if (selectedCategory !== "전체") {
      filtered = filtered.filter(notice => notice.category === selectedCategory);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotices(filtered);
    setCurrentPage(1);
  }, [notices, searchTerm, selectedCategory]);

  const categories = ["전체", ...Array.from(new Set(notices.map(notice => notice.category)))];
  
  // 고정 공지사항과 일반 공지사항 분리
  const pinnedNotices = filteredNotices.filter(notice => notice.isPinned);
  const regularNotices = filteredNotices.filter(notice => !notice.isPinned);
  
  // 페이지네이션을 위한 일반 공지사항만 사용
  const totalPages = Math.ceil(regularNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = regularNotices.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '제품': 'bg-blue-100 text-blue-800',
      '공지': 'bg-red-100 text-red-800', 
      '사업': 'bg-green-100 text-green-800',
      '시스템': 'bg-purple-100 text-purple-800',
      '인증': 'bg-yellow-100 text-yellow-800',
      '기술': 'bg-indigo-100 text-indigo-800',
      '행사': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">공지사항</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              JP CASTER의 최신 소식과 중요한 공지사항을 확인하세요
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색창 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="제목 또는 내용으로 검색하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            {/* 카테고리 필터 */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="h-12"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          {loading ? (
            // 로딩 스켈레톤
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* 고정 공지사항 */}
              {pinnedNotices.map((notice) => (
                <Card key={`pinned-${notice.id}`} className="border-yellow-200 bg-yellow-50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link to={`/notices/${notice.id}`} className="group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Pin className="w-4 h-4 text-yellow-600" />
                            <Badge className={getCategoryColor(notice.category)}>
                              {notice.category}
                            </Badge>
                            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                              공지
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
                            {notice.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {notice.content.replace(/\n/g, ' ').substring(0, 120)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(notice.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{notice.views.toLocaleString()}</span>
                            </div>
                            <span>작성자: {notice.author}</span>
                          </div>
                        </div>
                        {notice.thumbnail && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={notice.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.svg';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {/* 일반 공지사항 */}
              {currentNotices.map((notice) => (
                <Card key={notice.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link to={`/notices/${notice.id}`} className="group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={getCategoryColor(notice.category)}>
                              {notice.category}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
                            {notice.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {notice.content.replace(/\n/g, ' ').substring(0, 120)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(notice.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{notice.views.toLocaleString()}</span>
                            </div>
                            <span>작성자: {notice.author}</span>
                          </div>
                        </div>
                        {notice.thumbnail && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={notice.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.svg';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {!loading && filteredNotices.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500">
                  다른 검색어나 카테고리를 시도해 보세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Button>
            
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticePage;