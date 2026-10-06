// Native dragging plus ordinary buttons keep the same actions available on touchscreens.
export function mountDragDrop(root, onDrop) {
  let draggedId = null;
  function clear() {
    root.querySelectorAll('.is-dragging, .is-drag-over').forEach((item) => {
      item.classList.remove('is-dragging', 'is-drag-over');
    });
  }
  root.addEventListener('dragstart', (event) => {
    const source = event.target.closest('[data-drag-id]');
    if (!source || event.target.closest('input, select, textarea')) return;
    draggedId = source.dataset.dragId;
    event.dataTransfer.setData('text/plain', draggedId);
    event.dataTransfer.effectAllowed = 'copyMove';
    source.classList.add('is-dragging');
  });
  root.addEventListener('dragover', (event) => {
    const zone = event.target.closest('[data-drop-zone]');
    if (!zone || draggedId === null) return;
    event.preventDefault();
    zone.classList.add('is-drag-over');
  });
  root.addEventListener('dragleave', (event) => {
    const zone = event.target.closest('[data-drop-zone]');
    if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('is-drag-over');
  });
  root.addEventListener('drop', (event) => {
    const zone = event.target.closest('[data-drop-zone]');
    if (!zone || draggedId === null) return;
    event.preventDefault();
    const id = draggedId;
    draggedId = null;
    clear();
    onDrop(id, zone, event);
  });
  root.addEventListener('dragend', () => {
    draggedId = null;
    clear();
  });
}
