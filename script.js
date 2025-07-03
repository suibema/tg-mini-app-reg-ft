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
  const select = document.getElementById('first');
  const otherInput = document.getElementById('first_video');

  select.addEventListener('change', () => {
    if (select.value === 'Video Editor') {
      otherInput.style.display = 'block';
    } else {
      otherInput.style.display = 'none';
      otherInput.value = ''; // Clear the input when hiding
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('second');
  const otherInput = document.getElementById('second_video');

  select.addEventListener('change', () => {
    if (select.value === 'Video Editor') {
      otherInput.style.display = 'block';
    } else {
      otherInput.style.display = 'none';
      otherInput.value = ''; // Clear the input when hiding
    }
  });
});

const questionNames = ['surname', 'name', 'email', 'phone', 'city', 'city-other', 
  'citizen', 'citizen-other', 'vuz', 'specialty', 'study', 'finished', 
  'hours', 'first', 'second'];
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
    first: formData.get('first'),
    second: formData.get('second')
  };
  e.preventDefault();
  let repeated = 'нет';
  try {
    const res = await fetch(`https://ndb.fut.ru/api/v2/tables/maiff22q0tefj6t/records/count?where=(E-mail,eq,${formData.get('email')})`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      }
    });

    const data_email = await res.json();
    
    if (data_email.count > 0) {
      repeated = 'да';
      errorEl.textContent = 'You have already submitted the reg.';
      return;
    }
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Server error. Please try again.';
    }

  try {
    const res = await fetch(`https://ndb.fut.ru/api/v2/tables/maiff22q0tefj6t/records/count?where=(Номер телефона,eq,${formData.get('phone')})`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      }
    });

    const data_phone = await res.json();
  
    if (data_phone.count > 0) {
      repeated = 'да';
      errorEl.textContent = 'You have already submitted the reg.';
      return;
    }
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Server error. Please try again.';
    }

  let approved = 'ок';
  // Multi-cascade conditions
  if ( 
      (data.hours === 'Менее 20 часов') || 
      (data.study === "Среднее общее (школа)") ||
      (data.first === 'SMM' && 
        ((data.finished === "2022 и ранее" || data.finished === "2023" || data.finished === "2029 и позднее") ||
        (data.study === "Среднее специальное" && data.finished != '2026') ||
        (data.study === 'Аспирантура'))) ||
      (data.first === 'University Partnership' && 
        ((data.finished === "2029 и позднее") ||
        (data.study === "Среднее специальное" && data.finished != '2026'))) ||
      (data.first === 'Corporate Marketing' && 
        ((data.finished === "2027" || data.finished === "2028" || data.finished === "2029 и позднее") ||
        (data.study === "Среднее специальное") ||
        (data.city != 'Москва или МО'))) ||
      (data.first === 'Video Editor' && 
        ((data.finished === "2029 и позднее") ||
        (data.study === "Среднее специальное" && data.finished != '2026'))) ||
      (data.first === 'Projects' && 
        ((data.finished === "2029 и позднее") ||
        (data.study === "Среднее специальное" && data.finished != '2026')))
    ) {
    approved = 'отказ';
  };
  
  if (data.city === 'Другой') {data.city = data.city_other};
  if (data.citizen === 'Другое') {data.citizen = data.citizen_other};
  
  try {
    const phone_check = formData.get('phone');
    if (!/^[7]\d{10}$/.test(phone_check)) {
      errorEl.textContent = 'Phone must be 11 characters, format: 7XXXXXXXXXX';
      return;
    }
    const res = await fetch('https://ndb.fut.ru/api/v2/tables/maiff22q0tefj6t/records', {
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
        "Направление 1 приоритета": data.first,
        "Направление 2 приоритета": data.second,
        "Гражданство": data.citizen,
        "Город": data.city,
        "Скрининг итог": approved,
        "tg-id": window.tgUserId,
        "start-param": window.tgUserStartParam
      })
    }
    )
    window.location.href = 'bye.html'
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Server error. Please try again.';
    }

  console.log('Data:', data, 'Approved:', approved, 'repeated:', repeated); 
});

form.addEventListener('input', saveForm);
restoreForm();
