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
        width: 90%;
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

      #wheel {
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        margin-top: 20px;
        width: 100%;
        max-width: 360px;
      }

      #centerImage {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20%;
        max-width: 80px;
        z-index: 1001; /* Выше канваса */
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

      #closeWidgetButton:hover,
      #closeWidgetButton:focus,
      .close:hover,
      .close:focus {
        color: #D4564C;
        text-decoration: none;
      }

      .modal {
        display: none;
        position: fixed;
        z-index: 1001;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
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
          width: 90%;
          padding: 15px;
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
          width: 30%;
          max-width: 50px;
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
        <canvas id="wheel"></canvas>
        <img id="centerImage" src="https://raw.githubusercontent.com/AVAbsk/Pictures/main/dili.png" alt="Центральное изображение">
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
    const canvas = document.getElementById("wheel");
    const ctx = canvas.getContext("2d");
    const spinButton = document.getElementById("spinButton");
    const phoneInput = document.getElementById("phoneInput");
    const resultModal = document.getElementById("resultModal");
    const resultText = document.getElementById("resultText");
    const modalCloseButton = document.querySelector(".modal .close");

    const slices = [
      "Скидка на обучение 5%",
      "Не повезло",
      "Скидка на обучение 10%",
      "Не повезло",
      "Учебная литература в подарок",
      "Не повезло",
      "Скидка на обучение 1000₽",
      "Не повезло",
    ];

    const colors = [
      "#D4564C", // Красный
      "#393939", // Черный
      "#D4564C",
      "#393939",
      "#D4564C",
      "#393939",
      "#D4564C",
      "#393939",
    ];

    let startAngle = 0;
    const arc = (2 * Math.PI) / slices.length;
    let spinTimeout = null;
    let spinAngleStart = 0;
    let spinTime = 0;
    let spinTimeTotal = 0;
    let hasSpun = false;

    let arrowAngle = 0;
    let lastSectorIndex = -1;

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

    spinButton.addEventListener("click", spin);
    window.addEventListener("resize", resizeCanvas);

    phoneInput.addEventListener("focus", handlePhoneFocus);
    phoneInput.addEventListener("keydown", handlePhoneKeyDown);
    phoneInput.addEventListener("beforeinput", handlePhoneBeforeInput);
    phoneInput.addEventListener("input", handlePhoneInput);

    resizeCanvas();

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
      if (validatePhoneNumber(phoneNumber) && !hasSpun) {
        spinButton.disabled = false;
      } else {
        spinButton.disabled = true;
      }
    }

    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+7\d{10}$/;
      return phoneRegex.test(phone);
    }

    function resizeCanvas() {
      const containerWidth = widget.offsetWidth;
      const canvasSize = Math.min(containerWidth, 500);

      canvas.width = canvasSize;
      canvas.height = canvasSize;

      drawWheel();
    }

    function drawWheel() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = canvas.width / 2 - 10;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;

      slices.forEach((slice, i) => {
        const angle = startAngle + i * arc;

        ctx.fillStyle = colors[i];

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "#fff";
        const textAngle = angle + arc / 2;
        const textRadius = outerRadius * 0.8;

        ctx.translate(
          centerX + Math.cos(textAngle) * textRadius,
          centerY + Math.sin(textAngle) * textRadius
        );
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.font = `${canvas.width / 30}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        wrapText(ctx, slice, 0, 0, outerRadius * 0.5, canvas.width / 20);
        ctx.restore();
      });
    }

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(" ");
      let line = "";
      for (const word of words) {
        const testLine = `${line}${word} `;
        const { width: testWidth } = context.measureText(testLine);
        if (testWidth > maxWidth && line !== "") {
          context.fillText(line, x, y);
          line = `${word} `;
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    }

    function spin() {
      const phoneNumber = phoneInput.value.trim();

      if (!validatePhoneNumber(phoneNumber)) {
        alert(
          "Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX"
        );
        return;
      }

      spinButton.disabled = true;
      hasSpun = true;

      const possibleAngles = [1405, 1165];
      spinAngleStart =
        possibleAngles[Math.floor(Math.random() * possibleAngles.length)];

      spinTime = 0;
      spinTimeTotal = 4000;
      rotateWheel();
    }

    function rotateWheel() {
      spinTime += 30;
      if (spinTime >= spinTimeTotal) {
        startAngle = startAngle % (2 * Math.PI);
        drawWheel();
        stopRotateWheel();
        return;
      }

      const spinProgress = spinTime / spinTimeTotal;
      const easedSpin = easeOut(spinProgress) * spinAngleStart;
      const deltaAngle =
        ((easedSpin -
          easeOut((spinTime - 30) / spinTimeTotal) * spinAngleStart) *
          Math.PI) /
        180;
      startAngle += deltaAngle;
      startAngle %= 2 * Math.PI;

      drawWheel();
      spinTimeout = setTimeout(rotateWheel, 30);
    }

    function stopRotateWheel() {
      clearTimeout(spinTimeout);
      const degrees = (startAngle * 180) / Math.PI + 90;
      const arcd = (arc * 180) / Math.PI;
      let index = Math.floor((360 - (degrees % 360)) / arcd);
      index %= slices.length;
      const landedSector = slices[index];

      showResult(landedSector);
    }

    function showResult(result) {
      let message = "";
      if (result.includes("1000₽")) {
        message =
          "<span style='color: #D4564C;'>Поздравляем!<br></span> Вы выиграли скидку на обучение 1000₽!<br>Для подтверждения купона позвоните нам<br><a href='tel:+79299942055' style='color: #D4564C;'>+7 (929) 994-20-55</a>";
      } else if (result.includes("Учебная литература")) {
        message =
          "<span style='color: #D4564C;'>Поздравляем!<br></span> Вы выиграли учебную литературу в подарок!<br>Для подтверждения купона позвоните нам<br><a href='tel:+79299942055' style='color: #D4564C;'>+7 (929) 994-20-55</a>";
      } else {
        message = `Ваш результат: ${result}`;
      }

      resultText.innerHTML = message;
      resultModal.style.display = "block";
    }

    function easeOut(t) {
      return --t * t * t + 1;
    }
  }
})();
