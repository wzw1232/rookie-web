import { Spin } from 'antd';
import type { ReactNode } from 'react';

interface LoadingProps {
  /** 加载提示文案 */
  tip?: string;
  /** 全屏模式 */
  fullscreen?: boolean;
  /** 子节点 */
  children?: ReactNode;
}

const Loading: React.FC<LoadingProps> = ({
  tip = '加载中...',
  fullscreen = true,
  children,
}) => {
  const content = (
    <Spin
      tip={tip}
      size="large"
      style={
        fullscreen
          ? {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              width: '100%',
            }
          : undefined
      }
    >
      {children}
    </Spin>
  );

  return content;
};

export default Loading;
