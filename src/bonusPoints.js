export function setupBonusPointsFormatting() {
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'];
  const pattern = /\$([0-9][0-9,]*)/g;

  function isCreditCardRoute(pathname = window.location.pathname) {
    return /^\/credit-cards/.test(pathname) || /^\/compare/.test(pathname);
  }

  let enabled = isCreditCardRoute();

  function updateEnabled() {
    const prev = enabled;
    enabled = isCreditCardRoute();
    if (enabled && !prev) {
      scan(document.body);
    }
  }

  window.addEventListener('popstate', updateEnabled);
  ['pushState', 'replaceState'].forEach((method) => {
    const orig = history[method];
    history[method] = function (...args) {
      const res = orig.apply(this, args);
      updateEnabled();
      return res;
    };
  });

  function transformText(text) {
    if (!text) return text;
    return text.replace(pattern, (match, numStr) => {
      const raw = numStr.replace(/,/g, '');
      const value = parseInt(raw, 10);
      if (!isNaN(value) && value > 5000) {
        return `${raw} bonus points`;
      }
      return match;
    });
  }

  function transformTextNode(node) {
    if (!enabled) return;
    const orig = node.textContent;
    const transformed = transformText(orig);
    if (orig !== transformed) {
      node.textContent = transformed;
    }
  }

  function scan(root) {
    if (!enabled) return;
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
    if (!enabled) return;
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

  if (enabled) {
    scan(document.body);
  }
  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
