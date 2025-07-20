import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { MapPin, Mail, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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

export function Footer() {
  const { t } = useLanguage()
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // 최신 2개만 표시
        setNotices(sortedNotices.slice(0, 2));
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* NOTICE Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {t("footer.notice.title")}
            </h3>
            <div className="space-y-4">
              {loading ? (
                // 로딩 스켈레톤
                <>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 animate-pulse">
                    <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded mb-1 w-full"></div>
                    <div className="h-3 bg-white/10 rounded mb-3 w-2/3"></div>
                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 animate-pulse">
                    <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded mb-1 w-full"></div>
                    <div className="h-3 bg-white/10 rounded mb-3 w-2/3"></div>
                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                  </div>
                </>
              ) : notices.length > 0 ? (
                notices.map((notice) => (
                  <Link 
                    key={notice.id} 
                    to={`/notices/${notice.id}`}
                    className="block group"
                  >
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group-hover:bg-white/10 group-hover:border-amber-400/30 transition-all duration-300">
                      <h4 className="font-semibold text-amber-400 mb-2 group-hover:text-amber-300 transition-colors">
                        {notice.title.length > 30 ? `${notice.title.substring(0, 30)}...` : notice.title}
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                        {notice.content.replace(/\n/g, ' ').substring(0, 80)}...
                      </p>
                      <div className="flex items-center mt-3 text-xs text-amber-400 group-hover:text-amber-300 transition-colors">
                        <span>{formatDate(notice.createdAt)}</span>
                        <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // 공지사항이 없을 때 기본 메시지
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-400 text-center">
                    {t("footer.noNotices")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STORE Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {t("footer.store.title")}
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <h4 className="font-semibold text-amber-400 mb-3">{t("footer.store.findDealer")}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{t("footer.store.seoul")}</span>
                    <span className="text-xs bg-amber-400 text-slate-900 px-2 py-1 rounded-full">{t("footer.store.open")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{t("footer.store.busan")}</span>
                    <span className="text-xs bg-amber-400 text-slate-900 px-2 py-1 rounded-full">{t("footer.store.open")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{t("footer.store.daegu")}</span>
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">{t("footer.store.closed")}</span>
                  </div>
                </div>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-slate-900"
                >
                  <Link to="/dealers">
                    {t("footer.store.viewAll")}
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* CUSTOMER CENTER Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {t("footer.customerCenter.title")}
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400 mb-1">{t("footer.customerCenter.phone")}</div>
                    <div className="text-sm text-gray-300">{t("footer.customerCenter.consultation")}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-amber-400 font-medium">{t("footer.customerCenter.weekday")}</div>
                      <div className="text-gray-300">{t("footer.customerCenter.weekdayTime")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-medium">{t("footer.customerCenter.saturday")}</div>
                      <div className="text-gray-300">{t("footer.customerCenter.saturdayTime")}</div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="space-y-2">
                    <Button 
                      asChild 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900"
                    >
                      <Link to="/support">{t("footer.customerCenter.onlineInquiry")}</Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-slate-900"
                    >
                      <Link to="/faq">{t("footer.customerCenter.faq")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-white/10" />

        {/* Company Info & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {t("footer.company")}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t("footer.companyDesc")}
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>{t("footer.address1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>info@koreancaster.co.kr</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-amber-400">{t("footer.quickLinks")}</h4>
            <nav className="grid grid-cols-2 gap-2">
              <Link to="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t("footer.about")}
              </Link>
              <Link to="/products" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t("footer.catalog")}
              </Link>
              <Link to="/support" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t("footer.customerSupport")}
              </Link>
              <Link to="/quality" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t("footer.quality")}
              </Link>
              <Link to="/products?category=agv-caster" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t("nav.agv-caster")}
              </Link>
              <Link to="/products?category=equipment-caster" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t("nav.equipment-caster")}
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-amber-400">{t("footer.certification.title")}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{t("footer.certification.iso")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{t("footer.certification.kc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{t("footer.certification.warranty")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{t("footer.certification.service")}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>{t("footer.copyright")}</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}