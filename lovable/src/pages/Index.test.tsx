// 테스트용 간단한 Index 컴포넌트
import React from 'react';

const TestIndex = () => {
  console.log('🎯 TestIndex 컴포넌트 렌더링됨');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        color: '#333',
        marginBottom: '20px'
      }}>
        🎉 테스트 페이지 로드 성공!
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#666',
        marginBottom: '20px'
      }}>
        React 앱이 정상적으로 실행되고 있습니다.
      </p>
      <div style={{
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        환경 변수 상태: {import.meta.env.VITE_SUPABASE_URL ? '✅ 정상' : '❌ 누락'}
      </div>
      <div style={{
        backgroundColor: '#2196F3',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px'
      }}>
        현재 시간: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default TestIndex;