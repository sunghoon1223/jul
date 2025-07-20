// Mock 인증 시스템 - Supabase 대체용
interface MockUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface MockAuthResponse {
  user: MockUser | null;
  error: { message: string } | null;
}

class MockAuthService {
  private users: MockUser[] = [];
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // 로컬 스토리지에서 사용자 정보 복원 (안전하게)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('mockAuth_currentUser');
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
        }

        const savedUsers = localStorage.getItem('mockAuth_users');
        if (savedUsers) {
          this.users = JSON.parse(savedUsers);
        }
      }
    } catch (error) {
      console.warn('MockAuth: localStorage not available or corrupted, using memory only');
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('mockAuth_currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('mockAuth_users', JSON.stringify(this.users));
      }
    } catch (error) {
      console.warn('MockAuth: Failed to save to localStorage');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChange(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    // 즉시 현재 상태 전달
    callback(this.currentUser);
    
    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }

  async signUp(email: string, password: string, fullName?: string): Promise<MockAuthResponse> {
    // 이미 존재하는 이메일 체크
    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      return {
        user: null,
        error: { message: '이미 등록된 이메일입니다.' }
      };
    }

    // 새 사용자 생성
    const newUser: MockUser = {
      id: Date.now().toString(),
      email,
      name: fullName || email.split('@')[0],
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    this.notifyListeners();

    return {
      user: newUser,
      error: null
    };
  }

  async signIn(email: string, password: string): Promise<MockAuthResponse> {
    const user = this.users.find(user => user.email === email);
    if (!user) {
      return {
        user: null,
        error: { message: '등록되지 않은 이메일입니다.' }
      };
    }

    // 비밀번호 검증은 Mock이므로 생략
    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();

    return {
      user,
      error: null
    };
  }

  async signOut(): Promise<{ error: null }> {
    this.currentUser = null;
    this.saveToStorage();
    this.notifyListeners();
    return { error: null };
  }

  async signInWithOAuth(provider: 'google' | 'kakao'): Promise<MockAuthResponse> {
    // 소셜 로그인 시뮬레이션
    const mockEmail = `test_${provider}@${provider}.com`;
    const mockUser: MockUser = {
      id: `${provider}_${Date.now()}`,
      email: mockEmail,
      name: `${provider} 사용자`,
      created_at: new Date().toISOString()
    };

    // 기존 사용자가 있으면 로그인, 없으면 회원가입
    let existingUser = this.users.find(user => user.email === mockEmail);
    if (!existingUser) {
      this.users.push(mockUser);
      existingUser = mockUser;
    }

    this.currentUser = existingUser;
    this.saveToStorage();
    this.notifyListeners();

    return {
      user: existingUser,
      error: null
    };
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }
}

export const mockAuthService = new MockAuthService();