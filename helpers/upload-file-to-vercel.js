const { put } =  require('@vercel/blob');
const fsp = require('fs').promises;

async function fileToBase64(file) {
  return await new Promise(async (resolve, reject) => {
    try {
      const data = await fsp.readFile(file.path);
      var base64data = Buffer.from(data);
      resolve(base64data);
    } catch (_e) {
      reject(false);
    }
  });
}

async function uploadFile(filename, base64) {
  return await new Promise(async (resolve, reject) => {
    try {
      const blob = await put(filename, base64, {
        access: 'public',
        multipart: true,
        addRandomSuffix: true
      });
      resolve(blob);
    } catch (_e) {
      reject(false);
    }
  });
}

module.exports = { uploadFile, fileToBase64 };
