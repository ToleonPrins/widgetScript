(function () {
  // Проверяем, что документ загружен
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Создание и вставка стилей
    const style = document.createElement("style");
    style.innerHTML = `
          body {
            font-family: "Arial", sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            box-sizing: border-box;
          }

          .wheel-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 90%; /* Изменено с 100% для добавления отступов */
            max-width: 500px;
            border-radius: 30px;
            background-image: url("https://raw.githubusercontent.com/AVAbsk/Pictures/main/signs.jpeg");
            background-size: cover;
            background-position: center;
            padding: 20px;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background-color: #fff;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          }

          #spinButton {
            margin-top: 10px;
            padding: 15px 30px;
            font-size: 18px;
            background-color: #ff6f61;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          #spinButton:hover:enabled {
            background-color: #ff3b2f;
          }

          #spinButton:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }

          #phoneInput {
            margin-top: 10px;
            padding: 10px;
            font-size: large;
            width: 170px;
            border: 1px solid #ccc;
            border-radius: 5px;
            color: #555;
          }

          h1,
          h5 {
            margin: 5px 0;
            text-align: center;
          }

          h1 {
            font-size: 28px;
            color: #D4564C;
          }

          h5 {
            font-size: 14px;
            color: #555;
          }

          #centerImage {
            border-radius: 50%;
            margin-top: 20px;
            width: 100%;
            max-width: 360px;
          }

          /* Стиль кнопки закрытия виджета */
          #closeWidgetButton,
          .close {
            position: absolute;
            top: 10px;
            right: 10px;
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            background: none;
            border: none;
            cursor: pointer;
          }

          /* Ховер-эффект для обеих кнопок */
          #closeWidgetButton:hover,
          #closeWidgetButton:focus,
          .close:hover,
          .close:focus {
            color: #D4564C;
            text-decoration: none;
          }

          .modal {
            display: none; /* Скрываем по умолчанию */
            position: fixed;
            z-index: 1001; /* Отображение поверх всего */
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8); /* Полупрозрачный черный фон */
            border-radius: 30px;
          }

          .modal-content {
            background-color: #fff;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 300px;
            text-align: center;
            border-radius: 10px;
            position: relative;
          }

          @media (max-width: 600px) {
            .wheel-container {
              width: 90%; /* Увеличенные отступы на мобильных */
              padding: 15px;
              aspect-ratio: 1;
            }

            #spinButton {
              padding: 10px 20px;
              font-size: 16px;
            }

            #phoneInput {
              width: 100%;
              max-width: 140px;
            }

            h1 {
              font-size: 24px;
            }

            h5 {
              font-size: 12px;
            }

            #centerImage {
              max-width: 280px; /* Уменьшение размера изображения на мобильных */
            }
          }
        `;
    document.head.appendChild(style);

    // Создание HTML структуры виджета
    const widgetHTML = `
          <div id="wheelWidget" class="wheel-container">
            <button id="closeWidgetButton">&times;</button>
            <h1>Выиграй приз!</h1>
            <h5>
              Введите номер вашего телефона и крутите колесо<br>
              *только для новых клиентов
            </h5>
            <input type="text" id="phoneInput" value="+7" maxlength="12" />
            <button id="spinButton" disabled>Крутить колесо</button>
            <img id="centerImage" src="https://raw.githubusercontent.com/AVAbsk/Pictures/main/dili.png" alt="Изображение колеса">
            <!-- Модальное окно для вывода результата -->
            <div id="resultModal" class="modal">
              <div class="modal-content">
                <p id="resultText"></p>
              </div>
              <span class="close">&times;</span>
            </div>
          </div>
        `;
    // Вставка виджета в тело документа
    document.body.insertAdjacentHTML("beforeend", widgetHTML);

    // Инициализация функциональности
    initializeWheelWidget();
  }

  function initializeWheelWidget() {
    const widget = document.getElementById("wheelWidget");
    const closeWidgetButton = document.getElementById("closeWidgetButton");
    const spinButton = document.getElementById("spinButton");
    const phoneInput = document.getElementById("phoneInput");
    const resultModal = document.getElementById("resultModal");
    const resultText = document.getElementById("resultText");
    const modalCloseButton = document.querySelector(".modal .close");

    // Добавление обработчиков событий
    closeWidgetButton.addEventListener("click", () => {
      widget.style.display = "none";
    });

    modalCloseButton.addEventListener("click", () => {
      resultModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === resultModal) {
        resultModal.style.display = "none";
      }
    });

    phoneInput.addEventListener("focus", handlePhoneFocus);
    phoneInput.addEventListener("keydown", handlePhoneKeyDown);
    phoneInput.addEventListener("beforeinput", handlePhoneBeforeInput);
    phoneInput.addEventListener("input", handlePhoneInput);

    function handlePhoneFocus() {
      if (phoneInput.value.length < 2) {
        phoneInput.value = "+7";
      }
      phoneInput.setSelectionRange(2, 2);
    }

    function handlePhoneKeyDown(e) {
      const cursorPosition = phoneInput.selectionStart;
      if (
        cursorPosition <= 2 &&
        ["Backspace", "ArrowLeft", "Delete"].includes(e.key)
      ) {
        e.preventDefault();
        phoneInput.setSelectionRange(2, 2);
      }
    }

    function handlePhoneBeforeInput(e) {
      const cursorPosition = phoneInput.selectionStart;
      if (cursorPosition < 2) {
        e.preventDefault();
        phoneInput.setSelectionRange(2, 2);
      }
    }

    function handlePhoneInput() {
      if (!phoneInput.value.startsWith("+7")) {
        phoneInput.value =
          "+7" + phoneInput.value.slice(2).replace(/[^0-9]/g, "");
      } else {
        phoneInput.value =
          "+7" + phoneInput.value.slice(2).replace(/[^0-9]/g, "");
      }

      if (phoneInput.value.length > 12) {
        phoneInput.value = phoneInput.value.slice(0, 12);
      }

      const phoneNumber = phoneInput.value.trim();
      if (validatePhoneNumber(phoneNumber)) {
        spinButton.disabled = false;
      } else {
        spinButton.disabled = true;
      }
    }

    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+7\d{10}$/;
      return phoneRegex.test(phone);
    }
  }
})();
