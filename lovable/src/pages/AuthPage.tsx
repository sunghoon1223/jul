import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode') || 'login'
  const { signUp, signIn, signInWithGoogle, signInWithKakao } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    company: '',
    agreeTerms: false,
    agreePrivacy: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          console.error('Login error:', error.message)
          alert('로그인에 실패했습니다: ' + error.message)
          return
        }
        navigate('/')
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name)
        if (error) {
          console.error('Signup error:', error.message)
          alert('회원가입에 실패했습니다: ' + error.message)
          return
        }
        alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
        navigate('/auth?mode=login')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Google login error:', error.message)
        alert('Google 로그인에 실패했습니다: ' + error.message)
      } else {
        console.log('Google 로그인 성공, 홈페이지로 이동')
        navigate('/')
      }
    } catch (error) {
      console.error('Unexpected Google login error:', error)
      alert('Google 로그인 중 오류가 발생했습니다.')
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const { error } = await signInWithKakao()
      if (error) {
        console.error('Kakao login error:', error.message)
        alert('카카오 로그인에 실패했습니다: ' + error.message)
      } else {
        console.log('Kakao 로그인 성공, 홈페이지로 이동')
        navigate('/')
      }
    } catch (error) {
      console.error('Unexpected Kakao login error:', error)
      alert('카카오 로그인 중 오류가 발생했습니다.')
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login'
    navigate(`/auth?mode=${newMode}`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-xl font-black text-gray-900">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? '로그인' : '회원가입'}
          </CardTitle>
          <p className="text-muted-foreground">
            {mode === 'login' 
              ? 'Korean Caster에 오신 것을 환영합니다' 
              : 'Korean Caster 계정을 만들어 보세요'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Signup-specific fields */}
            {mode === 'signup' && (
              <>
                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="연락처를 입력하세요"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">회사명 (선택)</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="회사명을 입력하세요"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                      required
                    />
                    <Label htmlFor="agreeTerms" className="text-sm">
                      <Link to="/terms" className="text-yellow-600 hover:underline">
                        이용약관
                      </Link>
                      에 동의합니다
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onCheckedChange={(checked) => handleInputChange('agreePrivacy', checked)}
                      required
                    />
                    <Label htmlFor="agreePrivacy" className="text-sm">
                      <Link to="/privacy" className="text-yellow-600 hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Login-specific options */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">
                    로그인 상태 유지
                  </Label>
                </div>
                <Link 
                  to="/auth?mode=forgot-password" 
                  className="text-sm text-yellow-600 hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
              disabled={mode === 'signup' && (!formData.agreeTerms || !formData.agreePrivacy)}
            >
              {mode === 'login' ? '로그인' : '회원가입'}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">또는</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
              <div className="w-5 h-5 mr-2 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              Google로 계속하기
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={handleKakaoLogin}>
              <div className="w-5 h-5 mr-2 bg-yellow-300 rounded-full flex items-center justify-center">
                <span className="text-gray-900 text-xs font-bold">K</span>
              </div>
              카카오로 계속하기
            </Button>
          </div>

          {/* Toggle Mode */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                onClick={toggleMode}
                className="ml-1 text-yellow-600 hover:underline font-medium"
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}