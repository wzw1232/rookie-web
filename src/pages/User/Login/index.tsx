/**
 * Login — 登录页
 *
 * ## 数据流
 * ```
 * 用户提交 → useUserStore.login() → API 请求
 *   → set(token, user, permissions)  [Zustand state]
 *   → persist middleware → localStorage  [自动持久化]
 *   → syncUmiState → @@initialState      [Umi 框架兼容]
 *   → history.replace → 目标页
 * ```
 *
 * ## 依赖的 Store
 * - `useUserStore.login()` — 登录动作
 *
 * ## 预设账号
 * | 账号   | 密码   | 角色   | 权限      |
 * |--------|--------|--------|-----------|
 * | admin  | 123456 | 管理员 | 全部      |
 * | editor | 123456 | 编辑者 | 部分      |
 * | viewer | 123456 | 访客   | 仅首页    |
 */

import {
  LockOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { APP_NAME } from '@/constants';
import styles from './index.less';

type LoginType = 'phone' | 'account';

// ============================================================
// 子组件
// ============================================================

/** 登录错误消息提示 */
const LoginMessage: React.FC<{ content: string }> = ({ content }) => (
  <Alert
    style={{ marginBottom: 24 }}
    message={content}
    type="error"
    showIcon
  />
);

// ============================================================
// LoginPage
// ============================================================

const LoginPage: React.FC = () => {
  // ---- 状态 ----
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [loginError, setLoginError] = useState<string>('');

  // ---- Zustand Store ----
  const loginAction = useUserStore((s) => s.login);

  // ---- Umi 兼容层 ----
  const { setInitialState } = useModel('@@initialState');

  /**
   * 处理登录提交
   *
   * 流程：
   * 1. 调用 useUserStore.login() → API + Zustand state
   * 2. 成功后同步到 Umi @@initialState
   * 3. 跳转到 redirect 目标或首页
   */
  const handleSubmit = async (values: API.LoginParams) => {
    setLoginError('');

    // Zustand 处理登录（内部完成 API 调用 + state 更新 + persist）
    const success = await loginAction({
      username: values.username!,
      password: values.password!,
    });

    if (success) {
      // 同步到 Umi @@initialState（供框架内置插件使用）
      const userState = useUserStore.getState();
      setInitialState({
        currentUser: userState.currentUser ?? undefined,
        permissions: userState.permissions,
        token: userState.token,
      });

      message.success('登录成功');

      // 跳转：优先 redirect 参数，否则首页
      const urlParams = new URL(window.location.href).searchParams;
      const redirect = urlParams.get('redirect');
      history.replace(redirect || '/home');
      return true;
    }

    // 登录失败
    setLoginError('登录失败，请检查用户名和密码');
    return false;
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={styles.container}>
      <div className={styles.lang}></div>
      <div className={styles.content}>
        <div className={styles.main}>
          <LoginForm
            contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
            logo={require('@/assets/avto.png')}
            title={APP_NAME}
            subTitle="武帝萧子"
            onFinish={handleSubmit}
          >
            {loginError && <LoginMessage content={loginError} />}

            <Tabs
              centered
              activeKey={loginType}
              onChange={(key) => setLoginType(key as LoginType)}
              items={[
                { key: 'account', label: '账号密码登录' },
                { key: 'phone', label: '手机号登录' },
              ]}
            />

            {/* ---- 账号密码登录 ---- */}
            {loginType === 'account' && (
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                  }}
                  placeholder="用户名: admin / editor / viewer"
                  rules={[
                    { required: true, message: '请输入用户名!' },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  placeholder="密码: 123456"
                  rules={[
                    { required: true, message: '请输入密码！' },
                  ]}
                />
              </>
            )}

            {/* ---- 手机号登录 ---- */}
            {loginType === 'phone' && (
              <>
                <ProFormText
                  fieldProps={{
                    size: 'large',
                    prefix: <MobileOutlined />,
                  }}
                  name="mobile"
                  placeholder="手机号"
                  rules={[
                    { required: true, message: '请输入手机号！' },
                    {
                      pattern: /^1\d{10}$/,
                      message: '手机号格式错误！',
                    },
                  ]}
                />
                <ProFormCaptcha
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  captchaProps={{ size: 'large' }}
                  placeholder="请输入验证码"
                  captchaTextRender={(timing, count) =>
                    timing ? `${count} 秒后重新获取` : '获取验证码'
                  }
                  name="captcha"
                  rules={[
                    { required: true, message: '请输入验证码！' },
                  ]}
                  onGetCaptcha={async () => {
                    message.success('验证码已发送（Mock）');
                  }}
                />
              </>
            )}
          </LoginForm>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
