// FormData дає змогу відправити фото разом із текстовими полями.

// Не вказуємо Content-Type вручну — браузер сам додасть потрібний multipart/form-data із межею boundary.

// Якщо сервер поверне помилку, функція викине Error, який ми обробимо у формі.

export async function createStory(formData: FormData) {
  const response = await fetch("/api/stories", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Не вдалося створити історію");
  }

  return data;
}
