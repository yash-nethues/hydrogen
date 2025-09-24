import React from 'react';

export function RichTextRenderer({ content, variant }) {
  if (!content) return null;

  // If content is a JSON string, parse it
  let parsed;
  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    console.error('Invalid JSON in rich text metafield:', e);
    return null;
  }

  return (
    <div>
      {parsed?.children?.map((node, index) => renderNode(node, index, variant))}
    </div>
  );
}

function renderNode(node, key, variant) {
  switch (node.type) {
    case 'heading': {
      const Tag = `h${node.level || 2}`;
      return <Tag key={key}>{renderChildren(node.children, variant)}</Tag>;
    }
    case 'paragraph':
      return <p key={key}>{renderChildren(node.children, variant)}</p>;

    case 'text': {
      let style = {};
      if (node.bold) style.fontWeight = 'bold';
      if (node.italic) style.fontStyle = 'italic';
      if (node.underline) style.textDecoration = 'underline';
      return (
        <span key={key} style={style}>
          {node.value}
        </span>
      );
    }

    case 'list': {
      const ListTag = node.listType === 'ordered' ? 'ol' : 'ul';
      return <ListTag key={key}>{renderChildren(node.children, variant)}</ListTag>;
    }

    case 'list-item':
      if (variant === 'customShop') {
        return (
          <li key={key} className="flex gap-x-2">
            <svg className='flex-none w-3 h-3 tb:w-3.5 tb:h-3.5 mt-px sm:mt-0.5 tb:mt-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.45 8.66">
              <line fill="none" stroke="#343434" strokeMiterlimit="10" y1="4.34" x2="13" y2="4.34"/>
              <polyline fill="none" stroke="#343434" strokeMiterlimit="10" points="9.77 8.3 13.74 4.33 9.77 0.35"/>
            </svg>
            <span>{renderChildren(node.children, variant)}</span>
          </li>
        );
      }
      return <li key={key}>{renderChildren(node.children, variant)}</li>;

    default:
      return null;
  }
}

function renderChildren(children, variant) {
  return children?.map((child, index) => renderNode(child, index, variant));
}
