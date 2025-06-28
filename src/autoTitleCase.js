export function setupAutoTitleCase() {
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'];

  function toTitle(word) {
    if (!word) return word;
    if (/[0-9$%]/.test(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function transformText(text) {
    if (!text) return text;
    const withSpaces = text.replace(/_/g, ' ');
    return withSpaces.replace(/\b([A-Za-z][A-Za-z']*)\b/g, (match) => {
      return toTitle(match);
    });
  }

  function transformTextNode(node) {
    const orig = node.textContent;
    const transformed = transformText(orig);
    if (orig !== transformed) {
      node.textContent = transformed;
    }
  }

  function scan(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parentTag = node.parentNode && node.parentNode.nodeName;
          return skipTags.includes(parentTag)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        },
      }
    );
    const nodes = [];
    let current;
    while ((current = walker.nextNode())) {
      nodes.push(current);
    }
    nodes.forEach(transformTextNode);
  }

  function handleMutations(records) {
    for (const record of records) {
      if (record.type === 'characterData') {
        transformTextNode(record.target);
      }
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          transformTextNode(node);
        } else {
          scan(node);
        }
      });
    }
  }

  scan(document.body);
  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
