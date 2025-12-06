// 사용자 서비스

import { UserRepository } from '@/repo/user.repository';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 모든 사용자 조회
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * ID로 사용자 조회
   */
  async getUserById(id: number): Promise<User> {
    if (id <= 0) {
      throw new Error('Invalid user ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string): Promise<User | null> {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }

    return await this.userRepository.findByEmail(email);
  }

  /**
   * 사용자 생성
   */
  async createUser(data: CreateUserDto): Promise<User> {
    // 비즈니스 검증
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // 이메일 중복 체크
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // 사용자 생성
    return await this.userRepository.create(data);
  }

  /**
   * 사용자 업데이트
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    if (id <= 0) {
      throw new Error('Invalid user ID');
    }

    // 사용자 존재 확인
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // 이메일 변경 시 중복 체크
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // 이메일 형식 검증
    if (data.email && !data.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    return await this.userRepository.update(id, data);
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(id: number): Promise<void> {
    if (id <= 0) {
      throw new Error('Invalid user ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }
}

