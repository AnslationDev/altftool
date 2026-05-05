import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export async function uploadImage(file) {
  const imageRef = ref(storage, `store/${Date.now()}-${file.name}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}