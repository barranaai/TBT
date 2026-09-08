document.addEventListener('click', (event) => {
  const choose = event.target.closest('.tbt-choose-image');
  const clear = event.target.closest('.tbt-clear-image');
  if (!choose && !clear) return;
  const field = event.target.closest('.tbt-image-field');
  const update = (id, url) => {
    field.querySelector('.tbt-image-id').value = id;
    const input = field.querySelector('.tbt-image-url');
    input.value = url;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const preview = field.querySelector('img');
    preview.hidden = !url;
    if (url) preview.src = url; else preview.removeAttribute('src');
  };
  if (clear) { update(0, ''); return; }
  const picker = wp.media({ title: 'Choose public website picture', button: { text: 'Use this picture' }, library: { type: 'image' }, multiple: false });
  picker.on('select', () => { const image = picker.state().get('selection').first().toJSON(); update(image.id, image.url); });
  picker.open();
});
document.querySelectorAll('.tbt-choose-image, .tbt-clear-image').forEach((button) => { button.disabled = false; });
const tbtLocationMode = document.querySelector('#tbt-field-mode');
if (tbtLocationMode) {
  const physical = ['address', 'map_query'];
  const appointment = ['appointment_intro', 'sms_label', 'sms_number', 'appointment_outro'];
  const syncLocationFields = () => {
    for (const name of physical) document.querySelector(`[data-tbt-field="${name}"]`)?.toggleAttribute('hidden', tbtLocationMode.value === 'appointment');
    for (const name of appointment) document.querySelector(`[data-tbt-field="${name}"]`)?.toggleAttribute('hidden', tbtLocationMode.value !== 'appointment');
  };
  tbtLocationMode.addEventListener('change', syncLocationFields);
  syncLocationFields();
}
