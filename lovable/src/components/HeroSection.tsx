import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Import hero images
import heroMain from '@/assets/hero-main.jpg'
import heroAgv from '@/assets/hero-agv.jpg'
import heroMecanum from '@/assets/hero-mecanum.jpg'
import heroCustom from '@/assets/hero-custom.jpg'
import heroQuality from '@/assets/hero-quality.jpg'

// Hero slides data - multilingual support
const getHeroSlides = (t: (key: string) => string) => [
  {
    titleKey: "hero.agv.title",
    subtitleKey: "hero.agv.subtitle",
    descriptionKey: "hero.agv.description",
    image: heroAgv,
    ctaKey: "hero.agv.cta",
    link: "/categories/agv-casters"
  },
  {
    titleKey: "hero.mecanum.title",
    subtitleKey: "hero.mecanum.subtitle", 
    descriptionKey: "hero.mecanum.description",
    image: heroMecanum,
    ctaKey: "hero.mecanum.cta",
    link: "/categories/mecanum-wheels"
  },
  {
    titleKey: "hero.custom.title",
    subtitleKey: "hero.custom.subtitle",
    descriptionKey: "hero.custom.description",
    image: heroCustom,
    ctaKey: "hero.custom.cta",
    link: "/support"
  },
  {
    titleKey: "hero.quality.title",
    subtitleKey: "hero.quality.subtitle",
    descriptionKey: "hero.quality.description",
    image: heroQuality,
    ctaKey: "hero.quality.cta",
    link: "/quality"
  },
  {
    titleKey: "hero.main.title",
    subtitleKey: "hero.main.subtitle",
    descriptionKey: "hero.main.description",
    image: heroMain,
    ctaKey: "hero.main.cta",
    link: "/products"
  }
]

const HeroSection = () => {
  const { t } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const heroSlides = getHeroSlides(t)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  return (
    <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={slide.image}
              alt="Industrial Background" 
              className="w-full h-full object-cover opacity-20" 
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
              {/* Left Content */}
              <div className="text-white space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {t(slide.titleKey)}
                  </h1>
                  <h2 className="text-xl md:text-2xl text-amber-400 font-semibold mb-6">
                    {t(slide.subtitleKey)}
                  </h2>
                </div>
                
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-lg">
                  {t(slide.descriptionKey)}
                </p>
                
                <div className="pt-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-lg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to={slide.link}>
                      <ArrowRight className="mr-2 h-5 w-5" />
                      {t(slide.ctaKey)}
                    </Link>
                  </Button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevSlide}
          className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border border-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={nextSlide}
          className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border border-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-amber-400' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection