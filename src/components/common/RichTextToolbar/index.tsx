import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Select, Divider, Tooltip, Dropdown, ColorPicker } from 'antd';
import type { MenuProps } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  UndoOutlined,
  RedoOutlined,
  LinkOutlined,
  FontSizeOutlined,
  HighlightOutlined,
  FontColorsOutlined,
  LineOutlined,
  ClearOutlined,
  EnterOutlined,
} from '@ant-design/icons';

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onContentChange?: () => void;
  disabled?: boolean;
}

const FONT_SIZES = [
  { value: '1', label: '10px' },
  { value: '2', label: '12px' },
  { value: '3', label: '14px' },
  { value: '4', label: '16px' },
  { value: '5', label: '18px' },
  { value: '6', label: '24px' },
  { value: '7', label: '32px' },
];

const HEADINGS: MenuProps['items'] = [
  { key: 'p', label: 'Văn bản thường' },
  { key: 'h1', label: 'Tiêu đề 1' },
  { key: 'h2', label: 'Tiêu đề 2' },
  { key: 'h3', label: 'Tiêu đề 3' },
  { key: 'h4', label: 'Tiêu đề 4' },
  { key: 'h5', label: 'Tiêu đề 5' },
  { key: 'h6', label: 'Tiêu đề 6' },
];

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  editorRef,
  onContentChange,
  disabled = false,
}) => {
  const [fontSize, setFontSize] = useState('3');

  const execCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    // Focus editor first
    editorRef.current.focus();
    
    // Check if we have a valid selection
    const selection = window.getSelection();
    let range = null;
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      
      // If selection is collapsed (just cursor), try to select the current word
      if (range.collapsed) {
        const textNode = range.startContainer;
        const offset = range.startOffset;
        
        // Only try to expand selection if we're in a text node
        if (textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent || '';
          const start = findWordBoundary(text, offset, -1);
          const end = findWordBoundary(text, offset, 1);
          
          if (start !== offset || end !== offset) {
            range.setStart(textNode, start);
            range.setEnd(textNode, end);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }
    
    // Execute command
    document.execCommand(command, false, value);
    onContentChange?.();
  }, [editorRef, onContentChange]);

  // Helper function to find word boundaries
  const findWordBoundary = (text: string, offset: number, direction: number): number => {
    const isWordChar = (char: string) => /\w/.test(char);
    let current = offset;
    
    if (direction > 0) {
      // Search forward
      while (current < text.length && isWordChar(text[current])) {
        current++;
      }
    } else {
      // Search backward
      current = Math.max(0, current - 1);
      while (current >= 0 && isWordChar(text[current])) {
        current--;
      }
      return current + 1; // Move to first word character
    }
    
    return current;
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrikethrough = () => execCommand('strikeThrough');
  
  const handleUnorderedList = () => execCommand('insertUnorderedList');
  const handleOrderedList = () => execCommand('insertOrderedList');
  
  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');
  const handleAlignJustify = () => execCommand('justifyFull');
  
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');
  
  const handleIndent = () => execCommand('indent');
  const handleOutdent = () => execCommand('outdent');
  
  const handleHorizontalRule = () => execCommand('insertHorizontalRule');
  const handleRemoveFormat = () => execCommand('removeFormat');

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    execCommand('fontSize', value);
  };

  const handleHeadingSelect: MenuProps['onClick'] = ({ key }) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('formatBlock', false, `<${key}>`);
    onContentChange?.();
  };

  const handleForeColor = (color: string) => {
    execCommand('foreColor', color);
  };

  const handleBackColor = (color: string) => {
    execCommand('hiliteColor', color);
  };

  const handleLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleSubscript = () => execCommand('subscript');
  const handleSuperscript = () => execCommand('superscript');

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-lg sticky top-0 z-10">
      {/* Undo/Redo */}
      <Button.Group size="small">
        <Tooltip title="Hoàn tác (Ctrl+Z)">
          <Button 
            icon={<UndoOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleUndo(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Làm lại (Ctrl+Y)">
          <Button 
            icon={<RedoOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleRedo(); }} 
            disabled={disabled} 
          />
        </Tooltip>
      </Button.Group>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Heading dropdown */}
      <Dropdown
        menu={{ items: HEADINGS, onClick: handleHeadingSelect }}
        trigger={['click']}
        disabled={disabled}
      >
        <Button size="small" className="min-w-[120px]">
          Định dạng đoạn ▾
        </Button>
      </Dropdown>

      {/* Font size */}
      <Select
        size="small"
        value={fontSize}
        onChange={handleFontSizeChange}
        options={FONT_SIZES}
        style={{ width: 80 }}
        disabled={disabled}
        suffixIcon={<FontSizeOutlined />}
      />

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Text formatting */}
      <Button.Group size="small">
        <Tooltip title="In đậm (Ctrl+B)">
          <Button 
            icon={<BoldOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleBold(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="In nghiêng (Ctrl+I)">
          <Button 
            icon={<ItalicOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleItalic(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Gạch chân (Ctrl+U)">
          <Button 
            icon={<UnderlineOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleUnderline(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Gạch ngang">
          <Button 
            icon={<StrikethroughOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleStrikethrough(); }} 
            disabled={disabled} 
          />
        </Tooltip>
      </Button.Group>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Text color */}
      <Tooltip title="Màu chữ">
        <ColorPicker
          size="small"
          defaultValue="#000000"
          onChange={(color) => handleForeColor(color.toHexString())}
          disabled={disabled}
        >
          <Button size="small" icon={<FontColorsOutlined />} disabled={disabled} />
        </ColorPicker>
      </Tooltip>

      {/* Background color */}
      <Tooltip title="Màu nền">
        <ColorPicker
          size="small"
          defaultValue="#ffff00"
          onChange={(color) => handleBackColor(color.toHexString())}
          disabled={disabled}
        >
          <Button size="small" icon={<HighlightOutlined />} disabled={disabled} />
        </ColorPicker>
      </Tooltip>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <Button.Group size="small">
        <Tooltip title="Danh sách không đánh số">
          <Button 
            icon={<UnorderedListOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleUnorderedList(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Danh sách đánh số">
          <Button 
            icon={<OrderedListOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleOrderedList(); }} 
            disabled={disabled} 
          />
        </Tooltip>
      </Button.Group>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <Button.Group size="small">
        <Tooltip title="Căn trái">
          <Button 
            icon={<AlignLeftOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleAlignLeft(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Căn giữa">
          <Button 
            icon={<AlignCenterOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleAlignCenter(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Căn phải">
          <Button 
            icon={<AlignRightOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleAlignRight(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Căn đều">
          <Button 
            icon={<MenuOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleAlignJustify(); }} 
            disabled={disabled} 
          />
        </Tooltip>
      </Button.Group>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Indent */}
      <Button.Group size="small">
        <Tooltip title="Giảm thụt lề">
          <Button 
            onMouseDown={(e) => { e.preventDefault(); handleOutdent(); }} 
            disabled={disabled}
          >
            <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>⇥</span>
          </Button>
        </Tooltip>
        <Tooltip title="Tăng thụt lề">
          <Button 
            onMouseDown={(e) => { e.preventDefault(); handleIndent(); }} 
            disabled={disabled}
          >⇥</Button>
        </Tooltip>
      </Button.Group>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Sub/Superscript */}
      <Button.Group size="small">
        <Tooltip title="Chỉ số dưới">
          <Button 
            onMouseDown={(e) => { e.preventDefault(); handleSubscript(); }} 
            disabled={disabled}
          >
            X<sub>2</sub>
          </Button>
        </Tooltip>
        <Tooltip title="Chỉ số trên">
          <Button 
            onMouseDown={(e) => { e.preventDefault(); handleSuperscript(); }} 
            disabled={disabled}
          >
            X<sup>2</sup>
          </Button>
        </Tooltip>
      </Button.Group>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* Other tools */}
      <Button.Group size="small">
        <Tooltip title="Chèn đường kẻ ngang">
          <Button 
            icon={<LineOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleHorizontalRule(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Chèn liên kết">
          <Button 
            icon={<LinkOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleLink(); }} 
            disabled={disabled} 
          />
        </Tooltip>
        <Tooltip title="Xóa định dạng">
          <Button 
            icon={<ClearOutlined />} 
            onMouseDown={(e) => { e.preventDefault(); handleRemoveFormat(); }} 
            disabled={disabled} 
          />
        </Tooltip>
      </Button.Group>
    </div>
  );
};

export default RichTextToolbar;
