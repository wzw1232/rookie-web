// 水印组件——基于 @ant-design/pro-components WaterMark 封装
// 默认从全局状态读取当前用户名作为水印内容

import { WaterMark as ProWaterMark } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import React from 'react';

interface WatermarkProps {
  /** 水印文字内容，默认使用当前用户名 */
  content?: string;
  /** 字体颜色，默认 rgba(0,0,0,0.08) */
  fontColor?: string;
  /** 字体大小，默认 16 */
  fontSize?: number;
  /** 水印间距，默认 [100, 100] */
  gap?: [number, number];
  /** 旋转角度，默认 -22 */
  rotate?: number;
  /** 子节点 */
  children?: React.ReactNode;
}

/**
 * 水印组件
 * 全局级水印已在 src/app.tsx 的 layout.childrenRender 中配置，
 * 此组件用于页面级别的自定义水印覆盖。
 */
const Watermark: React.FC<WatermarkProps> = ({
  content,
  fontColor = 'rgba(0,0,0,0.08)',
  fontSize = 16,
  gap = [100, 100],
  rotate = -22,
  children,
}) => {
  const { initialState } = useModel('@@initialState');
  const waterContent = content ?? initialState?.currentUser?.name ?? '未登录';

  return (
    <ProWaterMark
      content={waterContent}
      fontColor={fontColor}
      fontSize={fontSize}
      gap={gap}
      rotate={rotate}
    >
      {children}
    </ProWaterMark>
  );
};

export default Watermark;
