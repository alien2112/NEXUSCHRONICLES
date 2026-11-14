export function activateOnKeyboard(event, activate) {
  if (event.target !== event.currentTarget || event.repeat) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    activate();
  }
}

export function shouldIgnoreSceneShortcut(event) {
  return event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey ||
    Boolean(event.target.closest?.('button, a, input, textarea, select, [role="button"], [role="slider"], [contenteditable]:not([contenteditable="false"]), dialog'));
}
