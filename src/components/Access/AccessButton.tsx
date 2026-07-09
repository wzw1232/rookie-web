// 按钮级别的权限控制组件
// 无权限时默认不渲染按钮

import { Access, useAccess } from '@umijs/max';
import { Button, type ButtonProps } from 'antd';
import React from 'react';

interface AccessButtonProps extends ButtonProps {
  /** 权限标识，如 'user:delete' */
  permission: string;
  /** 无权限时的回退展示（默认不渲染） */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 带权限控制的按钮
 * @example
 * <AccessButton permission="user:delete" onClick={handleDelete}>
 *   删除
 * </AccessButton>
 */
const AccessButton: React.FC<AccessButtonProps> = ({
  permission,
  fallback = null,
  children,
  ...rest
}) => {
  const access = useAccess();

  return (
    <Access accessible={access.can(permission)} fallback={fallback}>
      <Button {...rest}>{children}</Button>
    </Access>
  );
};

export default AccessButton;
