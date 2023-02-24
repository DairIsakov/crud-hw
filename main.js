// ? АПИ для запросов
const API = "http://localhost:8000/users";

// ? это блок куда добавляются карточки
const list = document.querySelector("#users-list");
const addForm = document.querySelector("#add-contact");
const titleInp = document.querySelector("#username");
const priceInp = document.querySelector("#phone-number");
const descriptionInp = document.querySelector("#email");
const imageInp = document.querySelector("#image");

// ? Инпуты и кнопка из модалки
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");
const editImageInp = document.querySelector("#edit-image");
const editSaveBtn = document.querySelector("#btn-save-edit");

// ? инпут для поиска
const searchInput = document.querySelector("#search");
// ? перменная по которой делаем запрос на поиск
let searchVal = "";

// ? То где отображаем кнопки для пагинации
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
let limit = 3;
let currentPage = 1;
let pageTotalCount = 1;

// ? Стягиваем данные , первоначальное отображение данных
getProducts();

// ? Стягиваем данные с сервера
async function getProducts() {
  const res = await fetch(
    `${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
  );
  const count = res.headers.get("x-total-count");
  pageTotalCount = Math.ceil(count / limit);
  const data = await res.json(); // ? Расшифровка данных
  // ? Отображаем актуальные данные
  render(data);
}

// ? функция для получения одного продукта
async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json(); // ? расшифовка данных
  return data; // ? добавляем продукт в db.json
}

// ? Функция чтобы изменить данные
async function editProduct(id, editedProduct) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

// ? Функция для удаления из db.json
async function deleteProducts(id) {
  // ? await для того чтобы GetProducts подождал пока данные удалятся
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  // ? стянуть и удалить актуальные данные
  getProducts();
}

// ?
async function addProduct(product) {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(product),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

// ? Для отображения на странице
function render(arr) {
  // ? Очищаем чтобы наши карточки не дублировались
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `
     <div class="card m-5" style="width: 18rem;">
     <img src="${item.image}" 
     class="card-img-top w-100" 
     alt="...">
     <div class="card-body">
     <h5 class="card-title">${item.title}</h5>
     <p class="card-text">${item.description.slice(0, 30)}</p>
     <p class="card-text">+ ${item.price}</p>
      <button id = "${
        item.id
      }"  class="btn btn-danger btn-delete">Delete</button>
      <button data-bs-toggle= "modal" 
      data-bs-target = "#exampleModal" 
      id = "${item.id}"  
      class="btn btn-dark btn-edit">Edit</button>
   </div>
 </div>`;
  });
  renderPagination();
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };
  addProduct(product);

  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

// ? обработчик события для удаления (DELETE)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProducts(e.target.id);
  }
});

// ? переменная чтобы сохранить id продукта на который мы нажали
let id = null;
// ? Обработчик события на открытиу и заполнение модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    // ? сохраняем id продукта
    id = e.target.id;
    // ? получаем объект продукта на который мы нажали
    // ? await потому что getOneProduct асинхронная функция
    const product = await getOneProduct(e.target.id);

    // ? заполнем инпуты данными продукта

    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

// ? обраболтчик события на сохранение данных
editSaveBtn.addEventListener("click", () => {
  // ? проверка на пустоту инпутов
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    // ? если хотя бы один инпут пустой , выводим предупреждение и останавливаем функцию
    return;
  }

  // ? собираем измемненный объект для изменения продукта
  const editedProduct = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };
  // ? вызываем функцию для изменения
  editProduct(id, editedProduct);
});

searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;  
  getProducts();
});

function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += ` <li class="page-item ${
      currentPage == i ? "active" : ""
    }">
    <a class="page-link page_number" href="#">${i}</a>
  </li>`;
  }
  if (currentPage == 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }

  if (currentPage == pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getProducts();
  }
});

next.addEventListener("click", (e) => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getProducts();
});

prev.addEventListener("click", (e) => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});