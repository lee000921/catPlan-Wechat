/**
 * 用户相关 API 服务
 * 示例：如何组织和调用 API
 */

import { post, get } from '../utils/request';

interface LoginResponse {
  token: string;
  userInfo: {
    id: string;
    nickName: string;
    avatarUrl: string;
  };
}

interface UserInfo {
  id: string;
  nickName: string;
  avatarUrl: string;
  phone?: string;
}

/**
 * 用户登录
 * @param code 微信授权码
 * @returns token 和用户信息
 */
export async function loginUser(code: string): Promise<LoginResponse> {
  return post<LoginResponse>('/api/user/login', { code });
}

/**
 * 获取用户信息
 * @returns 当前用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  return get<UserInfo>('/api/user/info');
}

/**
 * 更新用户信息
 * @param userInfo 更新的用户信息
 * @returns 更新后的用户信息
 */
export async function updateUserInfo(
  userInfo: Partial<UserInfo>
): Promise<UserInfo> {
  return post<UserInfo>('/api/user/update', userInfo);
}

/**
 * 获取用户列表（示例）
 * @param page 页码
 * @param limit 每页数量
 * @returns 用户列表
 */
export async function getUserList(
  page: number = 1,
  limit: number = 10
): Promise<{ users: UserInfo[]; total: number }> {
  return get('/api/user/list', {
    data: { page, limit },
  });
}
