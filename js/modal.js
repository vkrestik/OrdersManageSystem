// modalModule.js

let modalwindow = null;
const body = document.body;

function open({ template, handlers = {}, animationClass = 'open'}) {
  if (modalwindow) close(); // закрыть текущее окно, если есть

  modalwindow = document.createElement('div');
  modalwindow.className = 'modal';
  modalwindow.innerHTML = typeof template === 'function' ? template() : template;
  body.appendChild(modalwindow);

  // Навешиваем обработчики событий
  for (const selector in handlers) {
    const elements = modalwindow.querySelectorAll(selector);
    elements.forEach(el => {
      el.addEventListener('click', handlers[selector]);
    });
  }
  modalwindow.querySelector("#btn-close").addEventListener("click",() => close());
  
  // Отслеживание кликов внутри окна (если есть блок с классом modal_box)
  modalwindow.querySelector('.modal_box')?.addEventListener('click', e => {
    e._isClickWithInModal = true;
  });

  // Клик вне модалки закрывает её
  modalwindow.addEventListener('click', e => {
    if (e._isClickWithInModal) return;
    close();
  });

  // Запуск анимации открытия с задержкой
  setTimeout(() => {
    modalwindow.classList.add("open");
  }, 0);

  return modalwindow;
}

function close() {
      modalwindow.classList.remove("open");
      setTimeout(function() {
        //modalwindow.parentNode.removeChild(modalwindow);
        body.removeChild(modalwindow);
        modalwindow=null;
      }, 500);
}

export default { open, close };

//изменения в чужом репозитории через форк 
function close2() {
    modalwindow.classList.remove("open");
    setTimeout(function () {
        //modalwindow.parentNode.removeChild(modalwindow);
        body.removeChild(modalwindow);
        modalwindow = null;
    }, 500);
}