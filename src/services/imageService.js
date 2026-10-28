/**
 * Servicio de procesamiento y compresión de comprobantes fotográficos.
 * Reduce el tamaño de imágenes en el cliente para que sean ligeras,
 * se guarden rápido, no consuman datos móviles y funcionen sin internet.
 */

export function compressImageFile(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("El archivo no es una imagen válida"));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calcular dimensiones proporcionadas
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG comprimido
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
