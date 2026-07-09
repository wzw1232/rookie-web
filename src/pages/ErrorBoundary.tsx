export const ErrorBoundary = {
  /**
   * 是否启用全局 ErrorBoundary
   */
  enable: true,

  /**
   * 自定义错误展示组件
   */
  errorBoundaryRender: (error: any, errorInfo: any) => {
    return (
      <div style={{ padding: 24 }}>
        <h2>页面加载出错</h2>

        <pre style={{ color: 'red' }}>{error?.message}</pre>

        <button onClick={() => window.location.reload()}>重新加载</button>
      </div>
    );
  },
};
