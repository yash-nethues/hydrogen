import React from 'react';

export function RichTextRenderer({ content }) {
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
      {parsed?.children?.map((node, index) => renderNode(node, index))}
    </div>
  );
}

function renderNode(node, key) {
  switch (node.type) {
    case 'heading': {
      const Tag = `h${node.level || 2}`;
      return <Tag key={key}>{renderChildren(node.children)}</Tag>;
    }
    case 'paragraph':
      return <p key={key}>{renderChildren(node.children)}</p>;

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
      return <ListTag key={key}>{renderChildren(node.children)}</ListTag>;
    }

    case 'list-item':
      return <li key={key}>{renderChildren(node.children)}</li>;

    default:
      return null;
  }
}

function renderChildren(children) {
  return children?.map((child, index) => renderNode(child, index));
}
