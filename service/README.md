# Services

비즈니스 로직을 담당하는 서비스 레이어입니다.

## 구조

- 각 도메인별로 서비스 파일을 생성합니다
- Repository를 사용하여 데이터에 접근합니다
- 비즈니스 규칙과 검증 로직을 처리합니다

## 사용 예시

```typescript
// services/user.service.ts
import { UserRepository } from '@/repositories/user.repository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: number) {
    // 비즈니스 로직
    if (id <= 0) {
      throw new Error('Invalid user ID');
    }
    
    // Repository를 통해 데이터 접근
    return await this.userRepository.findById(id);
  }

  async createUser(data: CreateUserDto) {
    // 비즈니스 검증
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Invalid email');
    }

    // Repository를 통해 데이터 저장
    return await this.userRepository.create(data);
  }
}
```

