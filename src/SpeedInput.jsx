import { useState, useRef, useEffect } from 'react';

export default function SpeedInput({ speed, onSpeedChange, title }) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // 进入编辑时，将焦点设置在输入框上
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e) => {
    const val = e.target.value;
    
    // 如果输入为空，设为50
    if (val === '') {
      onSpeedChange(50);
      return;
    }

    let newSpeed = parseInt(val, 10);

    if (isNaN(newSpeed)) return;

    // 限制范围在 0 到 200 之间
    if (newSpeed < 0) newSpeed = 0;
    if (newSpeed > 200) newSpeed = 200;

    onSpeedChange(newSpeed);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={speed}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        className="bg-white text-gray-800 border border-blue-500 rounded px-0 py-0 w-12 text-center outline-none text-sm h-5 leading-5"
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className="cursor-pointer hover:text-blue-600 transition-colors inline-block w-12 text-center h-5 leading-5" title={title}>
      {speed}
    </span>
  );
}