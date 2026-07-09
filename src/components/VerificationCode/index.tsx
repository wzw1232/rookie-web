// 手机验证码输入组件
// - 兼容中英文 IME 输入（通过 compositionstart/compositionend 处理）
// - 自动聚焦第一个未输入框
// - 退格删除：删除当前框内容，回到上一个已填框末尾
// - 粘贴支持：分割字符串按序填入

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface VerificationCodeProps {
  /** 验证码长度（默认 6） */
  length?: number;
  /** 当前值 */
  value?: string;
  /** 输入完成回调 */
  onChange?: (code: string) => void;
  /** 部分输入回调 */
  onInput?: (partial: string) => void;
  /** 是否自动聚焦（默认 true） */
  autoFocus?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 错误状态 */
  status?: '' | 'error';
  /** 输入框尺寸 */
  size?: 'small' | 'middle' | 'large';
}

const boxSizeMap = {
  small: { width: 36, height: 40, fontSize: 18 },
  middle: { width: 44, height: 48, fontSize: 22 },
  large: { width: 52, height: 56, fontSize: 26 },
};

const VerificationCode: React.FC<VerificationCodeProps> = ({
  length = 6,
  value = '',
  onChange,
  onInput,
  autoFocus = true,
  disabled = false,
  status = '',
  size = 'middle',
}) => {
  // 内部状态：每一位的数字（空字符串表示未填）
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] || ''),
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // 同步外部 value
  useEffect(() => {
    if (value) {
      setDigits(Array.from({ length }, (_, i) => value[i] || ''));
    }
  }, [value, length]);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 从 digits 拼出完整 code
  const buildCode = useCallback(
    (d: string[]) => d.join(''),
    [],
  );

  // 通知外部
  const notify = useCallback(
    (d: string[]) => {
      const code = buildCode(d);
      onInput?.(code);
      if (code.length === length) {
        onChange?.(code);
      }
    },
    [buildCode, length, onChange, onInput],
  );

  // 处理 hidden input 的原始值 → 分发到 digits
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // IME 组合中：允许显示 IME 中间态字符，但不分发到 digits
      // compositionend 后会再触发一次 handleInput，那时候分发
      // 其实更简单的做法是用 onInput 直接处理，IME 组合中 raw 可能含拼音
      if (isComposing.current) {
        return;
      }

      // 只提取数字和字母（根据需求可调整）
      const chars = raw.replace(/[^0-9a-zA-Z]/g, '').split('');
      const newDigits = [...digits];

      // 找到第一个空位，从那里开始填入
      let startIdx = digits.findIndex((d) => !d);
      if (startIdx === -1) startIdx = 0;

      for (let i = 0; i < chars.length && startIdx + i < length; i++) {
        newDigits[startIdx + i] = chars[i];
      }

      setDigits(newDigits);
      notify(newDigits);

      // 清空 hidden input，下次输入时只得到新的字符
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [digits, length, notify],
  );

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const newDigits = [...digits];

      if (e.key === 'Backspace') {
        // 找到最后一个有内容的框
        const lastFilled = newDigits.findLastIndex((d) => d !== '');
        if (lastFilled >= 0) {
          newDigits[lastFilled] = '';
          setDigits(newDigits);
          notify(newDigits);
        }
        e.preventDefault();
        return;
      }

      // 方向键移动焦点到容器内的视觉框（用 tabIndex 不好处理，直接忽略）
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // 保持 hidden input 焦点，不做特殊处理
        return;
      }

      // 阻止其他非打印字符
      if (e.key.length === 1 && !/[0-9a-zA-Z]/.test(e.key)) {
        e.preventDefault();
      }
    },
    [digits, length, notify],
  );

  // 粘贴处理
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      const chars = text.replace(/[^0-9a-zA-Z]/g, '').split('');
      const newDigits = [...digits];

      for (let i = 0; i < chars.length && i < length; i++) {
        newDigits[i] = chars[i];
      }

      setDigits(newDigits);
      notify(newDigits);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [digits, length, notify],
  );

  // 点击容器时聚焦 hidden input
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const boxSize = boxSizeMap[size];

  // 计算 focus 样式（高亮下一个空框）
  const focusIndex = digits.findIndex((d) => !d);
  const focusDisplayIdx = focusIndex === -1 ? length - 1 : focusIndex;

  // 错误态边框颜色
  const errorBorderColor = '#ff4d4f';
  const normalBorderColor = '#d9d9d9';
  const focusBorderColor = status === 'error' ? errorBorderColor : '#1677ff';
  const filledBorderColor = status === 'error' ? errorBorderColor : '#1677ff';

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{
        display: 'inline-flex',
        gap: 8,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* 隐藏的 input——捕获所有键盘事件 */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        disabled={disabled}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposing.current = false;
          // IME 组合结束后手动触发处理
          handleInput(e as any);
        }}
        onInput={handleInput as any}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          fontSize: 16,
          border: 'none',
          outline: 'none',
          caretColor: 'transparent',
          zIndex: 1,
        }}
      />

      {/* 可见的输入框 */}
      {digits.map((digit, idx) => {
        const isFocus = idx === focusDisplayIdx;
        const isFilled = digit !== '';
        const borderColor = isFocus
          ? focusBorderColor
          : isFilled
            ? filledBorderColor
            : normalBorderColor;

        return (
          <div
            key={idx}
            style={{
              width: boxSize.width,
              height: boxSize.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: boxSize.fontSize,
              fontWeight: 600,
              fontFamily: 'monospace',
              border: `1px solid ${borderColor}`,
              borderRadius: 6,
              backgroundColor: isFilled ? '#fafafa' : '#fff',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              userSelect: 'none',
              position: 'relative',
            }}
          >
            {/* 闪烁光标 */}
            {isFocus && !disabled && (
              <span
                style={{
                  position: 'absolute',
                  width: 1,
                  height: boxSize.fontSize * 0.7,
                  backgroundColor: '#1677ff',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
            {digit}
          </div>
        );
      })}

      {/* 闪烁光标动画 */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VerificationCode;
