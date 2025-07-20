import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import ProductCategories from "@/components/ProductCategories";
import NoticeSection from "@/components/NoticeSection";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Shield, Truck, Star, Phone, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <ProductCategories />
        <FeaturedProducts />
        <NoticeSection />

        <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-black text-white mb-6">
                  전문가를 위한 <span className="text-yellow-400">CASTER PRO</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  산업용 장비부터 로봇까지, 모든 용도에 최적화된 고품질 캐스터와 휠을 제공합니다. 
                  10년 이상의 전문 경험과 ISO 인증을 바탕으로 신뢰할 수 있는 솔루션을 제공합니다.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-black text-yellow-400 mb-2">10+</div>
                    <div className="text-white font-semibold">년간 경험</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-yellow-400 mb-2">1000+</div>
                    <div className="text-white font-semibold">협력 업체</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-yellow-400/10 rounded-2xl p-8 border border-yellow-400/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">ISO</div>
                      <div className="text-white text-sm">품질 인증</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">24H</div>
                      <div className="text-white text-sm">빠른 출고</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">A/S</div>
                      <div className="text-white text-sm">완벽 보장</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">맞춤</div>
                      <div className="text-white text-sm">제작 가능</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
};

export default Index;
