let installPrompt;
let date = newDate();
const html = $t("html");

class Message {
  constructor(
    from = newDate().getDate(),
    to = newDate().getDate(),
    message = "",
    classes = [""]
  ) {
    let fromDate = newDate();
    fromDate.setDate(from);
    fromDate.setHours(0, 0, 0, 0);

    let toDate = newDate();
    toDate.setDate(to);
    toDate.setHours(23, 59, 59);

    this.toShow = newDate() >= fromDate && newDate() <= toDate;
    this.message = message;
    this.classes = classes;
  }

  isApplicableTo(realClass) {
    return this.classes.includes(realClass);
  }
}

const messages = [
  // All class names should be in capitals. This is because they are checked with the heading of the class.
  new Message(8, 8, `PE exam today from 10:00-10:30. All the best!!`, [
    "XA",
    "XB",
    "XC",
  ]),
  new Message(
    8,
    8,
    `Offline typing exam today. <a href="https://drive.google.com/file/d/1GaESha5nSuPPp3DI0EdWv6WH25HhbrLM/view?usp=sharing" class="btn">When?</a>`,
    ["XB"]
  ),
  new Message(8, 8, `ALL GMEETS ARE STILL THERE.`, ["XA", "XB", "XC"]),
];

const linkCardLiTemplate = (() => {
  const li = document.createElement("li");
  const timingAndStatus = addTimingAndStatus(li);
  timingAndStatus.appendChild(document.createElement("div"));
  addStatus(timingAndStatus);

  return li;
})();

function $(elem) {
  return document.querySelector(elem);
}

function $$(elems) {
  return document.querySelectorAll(elems);
}

function $id(elem) {
  return document.getElementById(elem);
}

function $cl(elem) {
  return document.getElementsByClassName(elem)[0];
}

function $$cl(elems) {
  return document.getElementsByClassName(elems);
}

function $t(elem) {
  return document.getElementsByTagName(elem)[0];
}

function $$t(elem) {
  return document.getElementsByTagName(elem);
}

function $add(tagName) {
  return document.createElement(tagName);
}

function swInit() {
  return new Promise((resolve) => {
    // Service worker
    if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
      navigator.serviceWorker.register("/SchoolWork/TimeTable/sw.js");
    resolve();
  });
}

function installBtnInit() {
  return new Promise((resolve) => {
    const installBtn = $(".install.btn");

    // Get the prompt which usually shows up and save it
    window.addEventListener("beforeinstallprompt", (e) => {
      installPrompt = e;
      e.preventDefault();
      installBtn && (installBtn.style.display = "block");
    });

    // When the install button is clicked show the previously saved prompt
    installBtn &&
      installBtn.addEventListener("click", async (ev) => {
        if (installPrompt) {
          installPrompt.prompt();
          const { outcome } = await installPrompt.userChoice;

          if (outcome === "accepted") {
            // That means the user installed the website
            installPrompt = false; // So we dont need this button to work anymore
            ev.target.display = "none";
          }
        }
      });
    resolve();
  });
}

function navInit() {
  if ($("nav")) {
    const division = localStorage.getItem("division");

    if (
      division &&
      $id(division) &&
      $(".ind > div:last-child > label").innerText <= division
    )
      $id(division).checked = true;
    else $('input[name="div"]').checked = true;
  }
}

function goBtnUpdate() {
  $$("#curr .go-btn, .link-card .go-btn").forEach((btn) =>
    btn.addEventListener("mousedown", () =>
      Array.from(btn.previousElementSibling.children).every((opt) => {
        if (opt.selected) {
          btn.href = opt.value;
          localStorage.setItem("thirdLang", opt.innerText.trim());
          return false;
        }
        return true;
      })
    )
  );
}

function thirdLangDefSet() {
  if ($('[name="third-lang"].dropdown')) {
    const prefLang = localStorage.getItem("thirdLang");

    prefLang &&
      $$(
        ':is(#curr, .link-card) [name="third-lang"].dropdown > option'
      ).forEach((opt) => (opt.selected = opt.innerText.trim() === prefLang));
  }
}

function setDataTime(mobile = false) {
  const timings = $$(".resp-table#curr tr > th:not(:first-child)");
  const tds = $$(".resp-table#curr tr > td:not(:first-child)");

  if (
    tds.length &&
    (mobile || window.matchMedia("(max-width: 900px)").matches) &&
    !("time" in tds[0].dataset)
  )
    tds.forEach((td, i) =>
      td.setAttribute("data-time", timings[i % 2].innerText)
    );
}

function update() {
  date = newDate();

  setDataTime();
  const linkCard = $cl("link-card");

  // If today isn't Sunday
  if (date.getDay()) {
    remExistingOl();

    const todaysRow = $$(
      `#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`
    );
    const ol = document.createElement("ol");

    todaysRow.forEach(({ firstElementChild: btn }, i) => {
      if (btn)
        ol.appendChild(
          (() => {
            // Adds an li
            const li = linkCardLiTemplate.cloneNode(true);
            const timingAndStatus = li.firstElementChild;
            const timeDetails = timeInRange(
              addTime(
                $(`#curr tr > th:nth-child(${i + 2})`).innerText,
                timingAndStatus.firstElementChild
              ).innerText
            );

            statusLogic(timeDetails, timingAndStatus.children[1], btn);

            const appendBtn = btn.cloneNode(true);
            appendBtn.classList.add("link-card");
            li.appendChild(appendBtn);

            return li;
          })()
        );
    });

    linkCard.appendChild(ol);
    goBtnUpdate();
    thirdLangDefSet();
  }

  {
    // Remove existing messageCard
    const messageCard = $(".message.card");
    messageCard && messageCard.parentElement.removeChild(messageCard);
  }

  messages.forEach((message) => {
    if (message.toShow && message.classes.includes($t(`h1`).innerText)) {
      let messageCard = $(".message.card");
      if (!messageCard) {
        const cards = $cl("cards");
        messageCard = document.createElement("li");

        messageCard.classList.add("card", "message");

        {
          // Adding the heading
          const heading = document.createElement("h2");
          heading.innerText = "Messages:";
          messageCard.appendChild(heading);
        }
        // Adding an ol
        messageCard.appendChild(document.createElement("ol"));

        cards.insertBefore(messageCard, cards.children[0]);
      }

      // Actually adding the message in the card
      const messageElem = document.createElement("li");
      messageElem.innerHTML = message.message;
      messageCard.getElementsByTagName("ol")[0].appendChild(messageElem);
    }
  });
}

function radioChange(callUpdate = true) {
  Array.from($$(".ind input")).every(async (btn) => {
    if (btn.checked) {
      const currClass =
        $("h1").innerText.slice(0, $("h1").innerText.length - 1) +
        btn.nextElementSibling.innerText;
      localStorage.setItem("division", btn.id);

      $("h1").innerText = currClass;
      $id("curr").removeAttribute("id");
      $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
      callUpdate && (await update());
      return false;
    }
    return true;
  });
}

function remExistingOl() {
  const linkCard = $(".link-card");
  Array.from(linkCard.children).forEach(
    (child, ind) => ind && linkCard.removeChild(child)
  );
}

function addTimingAndStatus(parent) {
  const timingAndStatus = document.createElement("div");

  timingAndStatus.classList.add("timing-and-status");
  parent.appendChild(timingAndStatus);

  return timingAndStatus;
}

function addTime(timeFrameText, whereTo) {
  whereTo.innerText = timeFrameText + ":";
  return whereTo;
}

function addStatus(parent) {
  const status = document.createElement("div");

  status.classList.add("status");
  parent.appendChild(status);

  return status;
}

function statusLogic(timeDetails, status, correspondingInp) {
  const updateActiveBtn = () => {
    activeBtnLogic(timeDetails, correspondingInp, false);
  };

  if (correspondingInp.classList.contains("greyed") && timeDetails !== false) {
    status.innerText = "Cancelled";
    status.classList.add("prob");
  } else if (timeDetails === true || timeDetails < 0) {
    status.innerText = "✓Join";
    status.classList.add("go");
    status.classList.remove("wait");
    updateActiveBtn();
  } else if (timeDetails > 0) {
    const secs = timeDetails % 60;

    status.innerText =
      Math.floor(timeDetails / 60) + ":" + (secs < 10 ? "0" : "") + secs;
    status.classList.add("wait");
    updateActiveBtn();

    return false;
  } else {
    status.innerText = "";
    status.classList.remove("prob");
    updateActiveBtn();
  }

  return true;
}

// Function for easy testing
function newDate() {
  const date = new Date();
  return date;
}

function timeInRange(strRange) {
  date = newDate();
  strRange = strRange.split(" ");
  strRange.splice(1, 1);

  const range = makeDateFromStr(strRange);
  const incMinsBy = (time, offset) =>
    time.setMinutes(time.getMinutes() + offset);

  incMinsBy(range[0], -5); // starts 5 mins early
  incMinsBy(range[1], 1); // ends a min late
  if (date >= range[0] && date <= range[1])
    // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
    return Math.round((range[0] - date + 300000) / 1000) || true;
  return false;
}

function makeDateFromStr(range) {
  const retTime = [];

  range.forEach((time) => {
    time = time.split(":");
    retTime.push(newDate());
    retTime[retTime.length - 1].setHours(time[0], time[1], 0, 0);
  });

  return retTime;
}

function activeBtnLogic(timeDetails, correspondingInp, greyed = true) {
  if (timeDetails) {
    // If the class is supposed to be cancelled, don't highlight it.
    if (!greyed || !correspondingInp.classList.contains("greyed"))
      correspondingInp.classList.add("active");
  } else {
    if (correspondingInp.classList.contains("active")) {
      const activeInTT = $("#curr .active");
      activeInTT && activeInTT.classList.remove("active");
    }

    correspondingInp.classList.remove("active");
  }
}

function statusUpdate() {
  Array.from($$cl("timing-and-status")).every((timingAndStatus) => {
    const timeDetails = timeInRange(
      timingAndStatus.firstElementChild.innerText
    );

    return statusLogic(
      timeDetails,
      timingAndStatus.querySelector(".status"),
      timingAndStatus.parentElement.lastElementChild
    );
  });
}

function divRadioInit() {
  const divRadios = $$('[name="div"]');
  divRadios &&
    divRadios.forEach((divRadio) =>
      divRadio.addEventListener("change", radioChange)
    );
}

// This is used by redirect.html
localStorage.setItem("lastVisitedPage", location.pathname);

swInit();

installBtnInit();
navInit();
radioChange(false);
update();

window
  .matchMedia("(max-width: 770px)")
  .addEventListener("change", () => setDataTime(true));

// If today isn't sunday
if (date.getDay()) setInterval(statusUpdate, 1 * 1000);

divRadioInit();
