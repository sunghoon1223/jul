import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Eye, ChevronLeft, ChevronRight, List } from "lucide-react";

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

const NoticeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadNoticeDetail = async () => {
      try {
        const response = await fetch('/data/notices.json');
        const data = await response.json();
        setAllNotices(data);
        
        const currentNotice = data.find((n: Notice) => n.id === parseInt(id || ''));
        if (currentNotice) {
          // 조회수 증가 (실제 구현에서는 서버에서 처리)
          setNotice({ ...currentNotice, views: currentNotice.views + 1 });
        } else {
          setError(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading notice:', error);
        setError(true);
        setLoading(false);
      }
    };

    loadNoticeDetail();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
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

  // 이전/다음 글 찾기
  const getCurrentIndex = () => {
    return allNotices.findIndex(n => n.id === notice?.id);
  };

  const getPrevNotice = () => {
    const currentIndex = getCurrentIndex();
    return currentIndex > 0 ? allNotices[currentIndex - 1] : null;
  };

  const getNextNotice = () => {
    const currentIndex = getCurrentIndex();
    return currentIndex < allNotices.length - 1 ? allNotices[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="border-0 shadow-sm mb-8">
            <CardContent className="p-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <List className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                공지사항을 찾을 수 없습니다
              </h2>
              <p className="text-gray-500 mb-6">
                요청하신 공지사항이 존재하지 않거나 삭제되었습니다.
              </p>
              <Button onClick={() => navigate('/notices')}>
                공지사항 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const prevNotice = getPrevNotice();
  const nextNotice = getNextNotice();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 뒤로 가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/notices')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            공지사항 목록
          </Button>
        </div>

        {/* 공지사항 상세 내용 */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-8">
            {/* 제목 및 메타 정보 */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getCategoryColor(notice.category)}>
                  {notice.category}
                </Badge>
                {notice.isPinned && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    공지
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {notice.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(notice.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>조회수 {notice.views.toLocaleString()}</span>
                </div>
                <span>작성자: {notice.author}</span>
              </div>
            </div>

            {/* 썸네일 이미지 */}
            {notice.thumbnail && (
              <div className="mb-6">
                <img
                  src={notice.thumbnail}
                  alt=""
                  className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.svg';
                  }}
                />
              </div>
            )}

            {/* 본문 내용 */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {notice.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이전/다음 글 네비게이션 */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {nextNotice && (
                <Link
                  to={`/notices/${nextNotice.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <ChevronLeft className="w-4 h-4" />
                      <span>다음 글</span>
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {nextNotice.title}
                    </h3>
                  </div>
                  <Badge className={getCategoryColor(nextNotice.category)}>
                    {nextNotice.category}
                  </Badge>
                </Link>
              )}
              
              {prevNotice && (
                <Link
                  to={`/notices/${prevNotice.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <ChevronRight className="w-4 h-4" />
                      <span>이전 글</span>
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {prevNotice.title}
                    </h3>
                  </div>
                  <Badge className={getCategoryColor(prevNotice.category)}>
                    {prevNotice.category}
                  </Badge>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 목록으로 돌아가기 버튼 */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/notices')}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <List className="w-4 h-4 mr-2" />
            공지사항 목록으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;