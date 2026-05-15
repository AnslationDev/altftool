export const exportToPNG = (gl) => {
  const dataURL = gl.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'impossible-object.png';
  link.href = dataURL;
  link.click();
};

export const exportToJSON = (objects) => {
  const data = JSON.stringify(objects, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'impossible-object.json';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};
