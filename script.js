document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('city');
  const otherInput = document.getElementById('city-other');

  select.addEventListener('change', () => {
    if (select.value === 'other') {
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
    if (select.value === 'other') {
      otherInput.style.display = 'block';
    } else {
      otherInput.style.display = 'none';
      otherInput.value = ''; // Clear the input when hiding
    }
  });
});

const form = document.getElementById('reg-form');
form.addEventListener('submit', async function (e) {
  const formData = new FormData(form);
  const data = {
    surname: formData.get('surname'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    city: formData.get('city'),
    city_other: formData.get('city-other'),
    citizen: formData.get('citizen'),
    citizen_other: formData.get('citizen_other'),
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
    };
  }
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Server error. Please try again.';
    }

  let approved = 'ок';
  // Multi-cascade conditions
  if ((data.finished === '22' || data.finished === '23' || data.finished === '28' || data.finished === '29') || 
      (data.hours === '10') || 
      (data.first === 'a' && (data.city === 'alm' || data.city === 'other'))) {
    approved = 'отказ';
  };

  try {
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
        "Скрининг итог": approved
      })
    }
    )}
  catch (err) {
    console.error(err);
    errorEl.textContent = 'Server error. Please try again.';
    }

  console.log('Data:', data, 'Approved:', approved, 'repeated:', repeated);
  // Later: Send to NocoDB with { email, approved }  
});

