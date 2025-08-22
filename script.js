const form = document.getElementById('reg-form');

function getTelegramUserId() {
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user && user.id) {
      return user.id;
    }
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  Telegram.WebApp.ready();
  const id = getTelegramUserId();
  const startParam = Telegram.WebApp.initDataUnsafe?.start_param;
  console.log("tg-id:", id);
  window.tgUserId = id;
  window.tgUserStartParam = startParam;
});


document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('city');
  const otherInput = document.getElementById('city-other');

  select.addEventListener('change', () => {
    if (select.value === 'Другой') {
      otherInput.style.display = 'block';
    } else {
      otherInput.style.display = 'none';
      otherInput.value = ''; // Clear the input when hiding
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('citizen');
  const otherInput = document.getElementById('citizen-other');

  select.addEventListener('change', () => {
    if (select.value === 'Другое') {
      otherInput.style.display = 'block';
    } else {
      otherInput.style.display = 'none';
      otherInput.value = ''; // Clear the input when hiding
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('foreign_phone_yes');
    const otherInput = document.getElementById('foreign_phone_type');
  
    select.addEventListener('change', () => {
      if (select.checked) {
        otherInput.style.display = 'block';
      } else {
        otherInput.style.display = 'none';
        otherInput.value = ''; // Clear the input when hiding
      }
    });
  });

const questionNames = ['surname', 'name', 'email', 'phone', 'city', 'city-other', 
  'citizen', 'citizen-other', 'vuz', 'specialty', 'study', 'finished', 
  'hours',];
function saveForm() {
  const formData = new FormData(form);
  const data = {};
  questionNames.forEach(qName => {
    data[qName] = formData.get(qName) || '';
  });
  localStorage.setItem('test_data', JSON.stringify(data));
}

function restoreForm() {
  const saved = JSON.parse(localStorage.getItem('test_data') || '{}');
  questionNames.forEach(qName => {
    const input = form.elements[qName];
    if (input) input.value = saved[qName] || '';
  });
}

form.addEventListener('submit', async function (e) {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const formData = new FormData(form);
  const errorEl = document.getElementById('reg-error');
  const data = {
    surname: formData.get('surname'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    city: formData.get('city'),
    city_other: formData.get('city-other'),
    citizen: formData.get('citizen'),
    citizen_other: formData.get('citizen-other'),
    vuz: formData.get('vuz'),
    specialty: formData.get('specialty'),
    study: formData.get('study'),
    finished: formData.get('finished'),
    hours: formData.get('hours'),
    has_ed: formData.get('has_ed')
  };
  e.preventDefault();

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'ОТПРАВЛЯЕТСЯ...'
  submitBtn.style.backgroundColor = '#ccc';
  submitBtn.style.color = '#666';
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'ОТПРАВИТЬ'
    submitBtn.style.backgroundColor = '';
    submitBtn.style.color = '';
  }, 9000);
  
  let repeated = 'нет';
  try {
    const res = await fetch(`https://ndb.fut.ru/api/v2/tables/m2zenv52yinuxda/records/count?where=(E-mail,eq,${formData.get('email')})`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      }
    });

    const data_email = await res.json();
    
    if (data_email.count > 0) {
      repeated = 'да';
      errorEl.textContent = 'Ты уже зарегистрирован. Свяжись с нами через бота, если это не так или если ты хочешь изменить данные';
      return;
    }
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера. Повтори попытку позже';
    }

  try {

    const phone_check = formData.get('phone');
    const foreign_phone = formData.get('foreign_phone_type');
    if (foreign_phone) {
      data.phone = foreign_phone; // Replace data.phone with foreign_phone value
    } else if (!/^[7]\d{10}$/.test(phone_check)) {
      errorEl.textContent = 'Phone must be 11 characters, format: 7XXXXXXXXXX';
      return;
    }
    // data.phone is set to foreign_phone if it exists, or validated phone_check if not
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
    errorEl.textContent = 'Please enter a valid email (e.g., user@domain.com)';
    return;
    }
    const res = await fetch(`https://ndb.fut.ru/api/v2/tables/m2zenv52yinuxda/records/count?where=(Номер телефона,eq,${data.phone})`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      }
    });

    const data_phone = await res.json();
  
    if (data_phone.count > 0) {
      repeated = 'да';
      errorEl.textContent = 'Ты уже зарегистрирован. Свяжись с нами через бота, если это не так или если ты хочешь изменить данные';
      return;
    }
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера. Повтори попытку позже';
    }

  try {
    const res = await fetch(`https://ndb.fut.ru/api/v2/tables/m2zenv52yinuxda/records/count?where=(tg-id,eq,${window.tgUserId})`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      }
    });

    const data_tgid = await res.json();
    
    if (data_tgid.count > 0) {
      repeated = 'да';
      errorEl.textContent = 'Ты уже зарегистрирован. Свяжись с нами через бота, если это не так или если ты хочешь изменить данные';
      return;
    }
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера. Повтори попытку позже';
    }
  
  if (data.city === 'Другой') {data.city = data.city_other};
  if (data.citizen === 'Другое') {data.citizen = data.citizen_other};
  
  try {
    let approved_first = 'ок';
    if (
      (data.hours === 'Менее 20 часов') ||
      (data.study === "Среднее общее (школа)") ||
      (data.citizen != 'РФ') ||
      (data.study != 'Бакалавриат' && data.study != 'Магистратура' && data.study != 'Специалитет') ||
      (data.finished != '2024' && data.finished != '2025' && data.finished != '2026' && data.finished != '2027') ||
      (data.has_ed === "Нет")
    ) {
      approved_first = 'отказ';
    }

    function validateFile(file) {
      if (file.size > 15 * 1024 * 1024) {
          return "Файл слишком большой (макс. 15MB)";
      }

      const validTypes = [
          "application/pdf", 
          "application/msword", 
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/webp"
      ];
      
      if (!validTypes.includes(file.type)) {
          return "Неподдерживаемый формат файла";
      }
      
      return null;
    }
    let attachmentData = null;
    try { 
      if (file) {
      const validationError = validateFile(file);
      if (validationError) {
          errorEl.textContent =  validationError;
          return;
      }
      const uploadFormData = new FormData(form);
      uploadFormData.append('file', file);
      uploadFormData.append('path', 'solutions');

        const uploadResponse = await fetch('https://ndb.fut.ru/api/v2/storage/upload', {
          method: 'POST',
          headers: {
            'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
          },
          body: uploadFormData
        });

        let uploadData = await uploadResponse.json();
        if (!Array.isArray(uploadData)) {
            uploadData = [uploadData];
        }
        console.log(uploadData)
        if (!uploadData.length || !uploadData[0]?.signedUrl) {
            throw new Error("Не удалось получить информацию о файле");
        }
        
        const firstItem = uploadData[0];
        const fileName = firstItem.title || file.name;
        const fileType = firstItem.mimetype;
        const fileSize = firstItem.size;
        
        const getFileIcon = (mimeType) => {
            if (mimeType.includes("pdf")) return "mdi-file-pdf-outline";
            if (mimeType.includes("word")) return "mdi-file-word-outline";
            if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "mdi-file-excel-outline";
            if (mimeType.includes("png")) return "mdi-file-image-outline";
            return "mdi-file-outline";
        };
        
        attachmentData = [
            {
              mimetype: fileType,
              size: fileSize,
              title: fileName,
              url: firstItem.url,
              icon: getFileIcon(fileType)
            }
        ];
    }      
    } catch (err) {
      errorEl.textContent = 'Не удалось загрузить файл: ' + err.message;
      return;
    }
    
    const res = await fetch('https://ndb.fut.ru/api/v2/tables/m2zenv52yinuxda/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      },
      body: JSON.stringify({
        "E-mail": data.email,
        "Фамилия": data.surname,
        "Имя": data.name,
        "Номер телефона": data.phone,
        "ВУЗ": data.vuz,
        "Направление подготовки": data.specialty,
        "Степень образования": data.study,
        "Год выпуска": data.finished,
        "График (часы)": data.hours,
        "Гражданство": data.citizen,
        "Город": data.city,
        "Скрининг итог": approved_first,
        "tg-id": window.tgUserId,
        "start-param": window.tgUserStartParam,
        "Резюме": attachmentData,
        "Юридическое образование": data.has_ed
      })
    }
    )
    window.location.href = 'bye.html'
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Ошибка сервера. Повтори попытку позже';
    }
});

form.addEventListener('input', saveForm);
restoreForm();



