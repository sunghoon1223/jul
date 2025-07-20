import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Eye, Pin, Bell } from "lucide-react";

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

const NoticeSection = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await fetch('/data/notices.json');
        const data = await response.json();
        
        // 고정 공지사항을 먼저, 그 다음 최신 순으로 정렬
        const sortedNotices = data.sort((a: Notice, b: Notice) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // 최신 4개만 표시
        setNotices(sortedNotices.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error loading notices:', error);
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '제품': 'bg-blue-100 text-blue-800',
      '공지': 'bg-red-100 text-red-800', 
      '사업': 'bg-green-100 text-green-800',
      '시스템': 'bg-purple-100 text-purple-800',
      '인증': 'bg-slate-100 text-slate-800',
      '기술': 'bg-indigo-100 text-indigo-800',
      '행사': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-gray-900">
              NOTICE
            </h2>
          </div>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            JP CASTER의 최신 소식과 중요한 공지사항을 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            // 로딩 스켈레톤
            [...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full mb-4 rounded-lg" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            notices.map((notice, index) => (
              <Card 
                key={notice.id}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/notices/${notice.id}`)}
              >
                  <CardContent className="p-6">
                    {/* 썸네일 이미지 또는 카테고리 아이콘 */}
                    <div className="relative mb-4">
                      {notice.thumbnail ? (
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={notice.thumbnail}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder.svg';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src="https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                            alt="공지사항"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* 고정 공지 표시 */}
                      {notice.isPinned && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full">
                          <Pin className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* 카테고리 및 제목 */}
                    <div className="mb-3">
                      <Badge className={`${getCategoryColor(notice.category)} mb-2`}>
                        {notice.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-slate-600 transition-colors line-clamp-2 leading-tight">
                        {notice.title}
                      </h3>
                    </div>

                    {/* 내용 미리보기 */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {notice.content.replace(/\n/g, ' ').substring(0, 80)}...
                    </p>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(notice.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{notice.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))
          )}
        </div>

        {/* 전체 보기 버튼 */}
        <div className="text-center">
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link to="/notices">
              전체 공지사항 보기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NoticeSection;